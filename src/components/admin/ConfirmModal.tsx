import { Modal } from "@/components/Modal/Modal";
import { Button } from "@/components/ui/AppButton";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  confirmLabel = "Delete",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  confirmLabel?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
    </Modal>
  );
}
