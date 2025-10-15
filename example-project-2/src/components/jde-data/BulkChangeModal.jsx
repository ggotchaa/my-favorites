import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/global/userSlice";
import { useJdeData } from "../../hooks/useJdeDataHook";
import { getFormattedStatusList } from "../../utils/index";

const qaEngineerReviewByDSEquipmentNextStatuses = [
  "Review by FV",
  "Review by Archive",
  "Internal QA/QC",
];

const qaEngineerReturnToDSEquipmentNextStatuses = [
  "Return to FV",
  "Review by Archive",
  "Internal QA/QC",
];

export const BulkChangeModal = ({
  open,
  onClose,
  currentStatus,
  onConfirm,
}) => {
  const [equipmentStatuses, setEquipmentStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [comment, setComment] = useState("");
  const userRole = useSelector(selectUserRole);
  const { getEquipmentStatuses } = useJdeData();

  useEffect(() => {
    let isMounted = true;

    if (open) {
      const fetchRows = async () => {
        const response = await getEquipmentStatuses();
        if (isMounted && response) {
          const { equipmentStatuses } = getFormattedStatusList(response);
          setEquipmentStatuses(equipmentStatuses);
        }
      };

      fetchRows();
    }

    return () => {
      isMounted = false;
    };
  }, [open, getEquipmentStatuses]);

  useEffect(() => {
    if (userRole === "Admin") {
      setFilteredStatuses(equipmentStatuses);
    } else if (userRole === "QA Engineer" && currentStatus === "Review by DS") {
      setFilteredStatuses(
        equipmentStatuses.filter((status) =>
          qaEngineerReviewByDSEquipmentNextStatuses.includes(status.label)
        )
      );
    } else if (userRole === "QA Engineer" && currentStatus === "Return to DS") {
      setFilteredStatuses(
        equipmentStatuses.filter((status) =>
          qaEngineerReturnToDSEquipmentNextStatuses.includes(status.label)
        )
      );
    } else if (
      userRole === "QA Engineer" &&
      ["Return to FV", "Review by Archive", "Review by FV"].includes(
        currentStatus
      )
    ) {
      setFilteredStatuses(
        equipmentStatuses.filter((status) => status.label === "Return to DS")
      );
    } else if (
      userRole === "QA Engineer" &&
      currentStatus === "Internal QA/QC"
    ) {
      setFilteredStatuses(
        equipmentStatuses.filter(
          (status) =>
            status.label === "Return to DS" ||
            status.label === "Ready for QA/QC"
        )
      );
    } else if (
      userRole === "QA Engineer" &&
      currentStatus === "Ready for QA/QC"
    ) {
      setFilteredStatuses(
        equipmentStatuses.filter(
          (status) =>
            status.label === "Return to DS" ||
            status.label === "Ready for JDE update"
        )
      );
    } else if (
      userRole === "QA Engineer" &&
      currentStatus === "Ready for JDE update"
    ) {
      setFilteredStatuses(
        equipmentStatuses.filter((status) => status.label === "ACD submitted")
      );
    } else if (userRole === "SME user" && currentStatus === "Ready for QA/QC") {
      setFilteredStatuses(
        equipmentStatuses.filter(
          (status) =>
            status.label === "Internal QA/QC" ||
            status.label === "Ready for JDE update"
        )
      );
    } else if (
      userRole === "SME user" &&
      currentStatus === "Ready for JDE update"
    ) {
      setFilteredStatuses(
        equipmentStatuses.filter(
          (status) =>
            status.label === "Internal QA/QC" ||
            status.label === "ACD submitted"
        )
      );
    } else {
      setFilteredStatuses([]);
    }
  }, [userRole, currentStatus, equipmentStatuses]);

  const handleConfirm = () => {
    onConfirm({ newStatus: selectedStatus, comment: comment.trim() });
    setSelectedStatus("");
    setComment("");
    onClose();
  };

  const handleClose = () => {
    setSelectedStatus("");
    setComment("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="bulk-change-modal"
    >
      <DialogTitle data-testid="bulk-change-modal-title">
        Enrichment status bulk change
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 py-4">
          <TextField
            label="Current status"
            value={currentStatus}
            disabled
            fullWidth
            data-testid="current-status-display"
          />

          <FormControl fullWidth>
            <InputLabel>Available statuses</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Available statuses"
              data-testid="available-statuses-select"
            >
              {filteredStatuses.length === 0 ? (
                <MenuItem disabled value="">
                  No options available
                </MenuItem>
              ) : (
                filteredStatuses
                  .filter((status) => status.label !== currentStatus)
                  .map((status) => (
                    <MenuItem
                      key={status.value}
                      value={status.value}
                      data-testid={`status-option-${status.label}`}
                    >
                      {status.label}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>

          <TextField
            label="Comment (Optional)"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            data-testid="comment-input"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button data-testid="cancel-button" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedStatus}
          variant="contained"
          data-testid="confirm-button"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
