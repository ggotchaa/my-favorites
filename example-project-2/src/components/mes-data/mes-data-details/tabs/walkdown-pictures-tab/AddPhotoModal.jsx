import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";

const OPERATIONAL_STATUSES = [
  { value: "AV", label: "AV" },
  { value: "DM", label: "DM" },
  { value: "DN", label: "DN" },
];

const OBSTACLE_TYPES = [
  "Scaffolding",
  "Insulation",
  "Scaffolding and Insulation",
  "Safety",
  "Ex_Enclosure",
  "No authorization",
  "Physical obstruction",
  "Temporary_Operational",
];

export const AddPhotoModal = ({
  open,
  onClose,
  onUpload,
  loading,
  equipmentTag,
}) => {
  const [formData, setFormData] = useState({
    operationalStatus: "",
    comment: "",
    postponed: false,
    postponedComment: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Reset form whenever the modal is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        operationalStatus: "",
        comment: "",
        postponed: false,
        postponedComment: "",
      });
      setSelectedFiles([]);
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);

    // Check if adding new files would exceed the limit
    if (selectedFiles.length + newFiles.length > 20) {
      setErrors((prev) => ({
        ...prev,
        files: `Cannot add ${newFiles.length} files. Maximum 20 files total (currently have ${selectedFiles.length})`,
      }));
      return;
    }

    // Filter out duplicate files based on name and size
    const uniqueNewFiles = newFiles.filter(
      (newFile) =>
        !selectedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    // Add new files to existing selection
    setSelectedFiles((prev) => [...prev, ...uniqueNewFiles]);
    setErrors((prev) => ({
      ...prev,
      files: "",
    }));

    // Clear the input value so the same files can be selected again if needed
    event.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.operationalStatus) {
      newErrors.operationalStatus = "Operational status is required";
    }

    if (formData.postponed && !formData.postponedComment) {
      newErrors.postponedComment = "Obstacle type is required when postponed";
    }

    if (selectedFiles.length === 0) {
      newErrors.files = "At least one image must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = () => {
    if (!validateForm()) {
      return;
    }

    const uploadData = {
      operationalStatus: formData.operationalStatus,
      postponed: Boolean(formData.postponed),
      files: selectedFiles,
    };

    if (formData.comment) {
      uploadData.comment = formData.comment;
    }
    if (formData.postponed && formData.postponedComment) {
      uploadData.postponedComment = formData.postponedComment;
    }

    onUpload(uploadData);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="add-photo-modal"
    >
      <DialogTitle data-testid="add-photo-modal-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add Photo</Typography>
          <IconButton
            data-testid="add-photo-modal-close-button"
            onClick={handleClose}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Equipment Tag Display */}
          <TextField
            label="Equipment Tag"
            value={equipmentTag || ""}
            disabled
            variant="outlined"
            fullWidth
            data-testid="equipment-tag-display"
          />

          {/* Operational Status */}
          <FormControl fullWidth error={!!errors.operationalStatus}>
            <InputLabel required>Operational Status</InputLabel>
            <Select
              data-testid="operational-status-select"
              value={formData.operationalStatus}
              onChange={(e) =>
                handleInputChange("operationalStatus", e.target.value)
              }
              label="Operational Status *"
            >
              {OPERATIONAL_STATUSES.map((status) => (
                <MenuItem
                  data-testid="operational-status-menu-item"
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </MenuItem>
              ))}
            </Select>
            {errors.operationalStatus && (
              <Typography
                data-testid="operational-status-error"
                variant="caption"
                color="error"
                sx={{ mt: 0.5 }}
              >
                {errors.operationalStatus}
              </Typography>
            )}
          </FormControl>

          {/* Comment */}
          <TextField
            label="Comment"
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            fullWidth
            data-testid="comment-input"
          />

          {/* Postponed Toggle */}
          <FormControlLabel
            control={
              <Switch
                data-testid="postponed-switch"
                checked={formData.postponed}
                onChange={(e) =>
                  handleInputChange("postponed", e.target.checked)
                }
                color="primary"
              />
            }
            label="Postponed"
          />

          {/* Obstacle Type (shown when postponed is true) */}
          {formData.postponed && (
            <FormControl fullWidth error={!!errors.postponedComment}>
              <InputLabel required>Obstacle Type</InputLabel>
              <Select
                data-testid="obstacle-type-select"
                value={formData.postponedComment}
                onChange={(e) =>
                  handleInputChange("postponedComment", e.target.value)
                }
                label="Obstacle Type *"
              >
                {OBSTACLE_TYPES.map((type) => (
                  <MenuItem
                    data-testid="obstacle-type-menu-item"
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.postponedComment && (
                <Typography
                  data-testid="obstacle-type-error"
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5 }}
                >
                  {errors.postponedComment}
                </Typography>
              )}
            </FormControl>
          )}

          {/* File Upload */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 2, height: 48 }}
              data-testid="add-image-button"
            >
              Add image
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                max="20"
                data-testid="file-input"
              />
            </Button>

            {errors.files && (
              <Typography
                variant="caption"
                color="error"
                display="block"
                sx={{ mb: 1 }}
                data-testid="files-error"
              >
                {errors.files}
              </Typography>
            )}

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                  data-testid="selected-files-count"
                >
                  Selected files ({selectedFiles.length}/20):
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveFile(index)}
                      size="small"
                      data-testid="selected-file-chip"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          data-testid="cancel-button"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={
            loading || selectedFiles.length === 0 || !formData.operationalStatus
          }
          color="primary"
          data-testid="upload-button"
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
