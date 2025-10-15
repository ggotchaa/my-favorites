import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export const DetailsActionsWithHeader = ({
  header,
  editMode,
  handleEditMode,
  handleCancel,
  handleSave,
  actionMode,
  loading,
  isActionsDisabled,
  canEditPhoto,
}) => {
  const isUserActionEnabled = canEditPhoto && actionMode;

  return (
    <div
      className="flex items-center justify-between w-full px-4 pt-4"
      data-testid="details-header"
    >
      <h6
        className="text-base not-italic font-bold leading-5"
        data-testid="details-header-title"
      >
        {header}
      </h6>
      {isUserActionEnabled && (
        <div className="flex items-center gap-4" data-testid="action-buttons">
          {editMode ? (
            <>
              <IconButton
                color="error"
                onClick={handleCancel}
                disabled={isActionsDisabled}
                data-testid="cancel-btn"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="success"
                onClick={handleSave}
                disabled={isActionsDisabled}
                data-testid="save-btn"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            !loading && (
              <IconButton
                color="primary"
                onClick={handleEditMode}
                disabled={isActionsDisabled}
                data-testid="edit-btn"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )
          )}
        </div>
      )}
    </div>
  );
};
