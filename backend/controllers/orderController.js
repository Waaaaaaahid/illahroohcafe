const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Order = require('../models/Order');

// Active SSE clients
const orderSubscribers = new Map();
const adminSubscribers = new Set();

function sendSSE(res, data) {
  if (res.writableEnded) return;

  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// Send order update to customer + admin
function broadcastOrder(order, type = 'order-updated') {
  const orderId = String(order._id);

  /*
   * CUSTOMER
   * Only customers currently tracking this specific order
   */
  const subscribers = orderSubscribers.get(orderId);

  if (subscribers) {
    for (const res of subscribers) {
      try {
        sendSSE(res, {
          type,
          order,
        });
      } catch {
        subscribers.delete(res);
      }
    }
  }

  /*
   * ADMIN
   * All connected admin order pages
   */
  for (const res of adminSubscribers) {
    try {
      sendSSE(res, {
        type,
        order,
      });
    } catch {
      adminSubscribers.delete(res);
    }
  }
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

const createOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return error(res, 401, 'Login required to place an order');
  }

  const {
    customerDetails,
    items,
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
    paymentMethod,
  } = req.body;

  const computedSubtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const computedTotal = Number(
    (
      computedSubtotal +
      Number(tax) +
      Number(deliveryFee)
    ).toFixed(2)
  );

  if (
    Number(subtotal) !== Number(computedSubtotal) ||
    Number(totalAmount) !== computedTotal
  ) {
    return error(res, 400, 'Order totals are invalid');
  }

  const order = await Order.create({
    user: req.user.id,
    code: `MN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,
    customerDetails,
    items,
    subtotal: Number(subtotal),
    tax: Number(tax),
    deliveryFee: Number(deliveryFee),
    totalAmount: Number(totalAmount),
    paymentMethod,
  });

  /*
   * 🔥 REAL-TIME ADMIN NOTIFICATION
   *
   * Customer places order →
   * connected admin pages instantly receive:
   *
   * {
   *   type: "new-order",
   *   order: {...}
   * }
   */
  broadcastOrder(order, 'new-order');

  return success(
    res,
    201,
    order,
    'Order created successfully'
  );
});

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS - ADMIN
|--------------------------------------------------------------------------
*/

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email phone role')
    .sort('-createdAt');

  return success(
    res,
    200,
    orders,
    'Orders retrieved'
  );
});

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email phone role'
  );

  if (!order) {
    return error(res, 404, 'Order not found');
  }

  /*
   * If user is logged in, check ownership.
   * Admin can see everything.
   *
   * This also allows guest tracking through order reference.
   */
  if (req.user) {
    const isOwner =
      order.user &&
      String(order.user._id) === String(req.user.id);

    if (!isOwner && req.user.role !== 'admin') {
      return error(
        res,
        403,
        'Not authorized to view this order'
      );
    }
  }

  return success(
    res,
    200,
    order,
    'Order retrieved'
  );
});

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS - ADMIN
|--------------------------------------------------------------------------
*/

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const validStatuses =
    Order.schema.path('orderStatus').enumValues;

  if (!validStatuses.includes(orderStatus)) {
    return error(
      res,
      400,
      'Invalid order status'
    );
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    {
      new: true,
      runValidators: true,
    }
  ).populate(
    'user',
    'name email phone role'
  );

  if (!order) {
    return error(
      res,
      404,
      'Order not found'
    );
  }

  /*
   * 🔥 REAL-TIME UPDATE
   *
   * Admin changes:
   *
   * Pending → Confirmed
   *
   * Customer instantly receives:
   *
   * {
   *   type: "order-updated",
   *   order: {...}
   * }
   */
  broadcastOrder(order, 'order-updated');

  return success(
    res,
    200,
    order,
    'Order status updated'
  );
});

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user.id,
  }).sort('-createdAt');

  return success(
    res,
    200,
    orders,
    'User orders retrieved'
  );
});

/*
|--------------------------------------------------------------------------
| CUSTOMER REAL-TIME ORDER STREAM
|--------------------------------------------------------------------------
*/

const subscribeToOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const order = await Order.findById(orderId).populate(
    'user',
    'name email phone role'
  );

  if (!order) {
    return error(
      res,
      404,
      'Order not found'
    );
  }

  // SSE headers
  res.setHeader(
    'Content-Type',
    'text/event-stream'
  );

  res.setHeader(
    'Cache-Control',
    'no-cache, no-transform'
  );

  res.setHeader(
    'Connection',
    'keep-alive'
  );

  res.setHeader(
    'X-Accel-Buffering',
    'no'
  );

  res.flushHeaders?.();

  /*
   * Send current order immediately.
   * This means customer doesn't have to wait
   * for the first status update.
   */
  sendSSE(res, {
    type: 'order-updated',
    order,
  });

  if (!orderSubscribers.has(orderId)) {
    orderSubscribers.set(
      orderId,
      new Set()
    );
  }

  orderSubscribers
    .get(orderId)
    .add(res);

  const cleanup = () => {
    const subscribers =
      orderSubscribers.get(orderId);

    if (subscribers) {
      subscribers.delete(res);

      if (subscribers.size === 0) {
        orderSubscribers.delete(orderId);
      }
    }
  };

  req.on('close', cleanup);

  /*
   * Keep SSE connection alive.
   */
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN REAL-TIME ORDER STREAM
|--------------------------------------------------------------------------
*/

const subscribeToAdminOrders = asyncHandler(
  async (req, res) => {
    // SSE headers
    res.setHeader(
      'Content-Type',
      'text/event-stream'
    );

    res.setHeader(
      'Cache-Control',
      'no-cache, no-transform'
    );

    res.setHeader(
      'Connection',
      'keep-alive'
    );

    res.setHeader(
      'X-Accel-Buffering',
      'no'
    );

    res.flushHeaders?.();

    adminSubscribers.add(res);

    /*
     * Send currently existing orders once
     * when admin connects.
     *
     * This populates the admin page instantly.
     */
    const orders = await Order.find()
      .populate(
        'user',
        'name email phone role'
      )
      .sort('-createdAt');

    for (const order of orders) {
      sendSSE(res, {
        type: 'initial-order',
        order,
      });
    }

    /*
     * Keep connection alive.
     */
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': heartbeat\n\n');
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      adminSubscribers.delete(res);
    });
  }
);

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  subscribeToOrder,
  subscribeToAdminOrders,
};