import { Button, CircularProgress } from "@mui/material";

export const DeletionAgreement = ({
  title,
  subtitle,
  onCancel,
  onConfirm,
  loading,
}) => {
  return (
    <div data-testid="delete-modal">
      <h6
        className="text-xl font-fira font-bold leading-6"
        data-testid="delete-modal-title"
      >
        {title}
      </h6>
      <span
        className="block text-base font-normal leading-5 mt-6"
        data-testid="delete-modal-subtitle"
      >
        {subtitle}
      </span>
      <div className="flex items-center justify-end gap-4 mt-6">
        <Button
          data-testid="cancel-btn"
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          data-testid="delete-btn"
        >
          {loading ? <CircularProgress size={20} /> : "Delete"}
        </Button>
      </div>
    </div>
  );
};
