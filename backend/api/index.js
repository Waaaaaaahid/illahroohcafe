const app = require("../server");
const connectDB = require("../config/db");

let dbConnected = false;

module.exports = async (req, res) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Backend startup error:", error);

    return res.status(500).json({
      success: false,
      message: "Backend failed to start",
      error: error.message,
    });
  }
};