import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Alert,
  Button,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { setIsScheduledEquipmentsUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";
import { resetAllFilters } from "../../store/slices/walkdown-management/notAssignedTagsSlice";

import { AssignTagsSearchHeader } from "./AssignTagsSearchHeader";
import { NotScheduledTagsTable } from "./NotScheduledTagsTable";

export const AssignTags = ({
  closeAssignTagModal,
  scheduleId,
  notAssignedTags,
  isLoading,
  setAssignTagsPerPage,
  assignTagsCurrentPage,
  assignTagsPerPage,
  notAssignedTagsCount,
}) => {
  const dispatch = useDispatch();
  const [selectedTags, setSelectedTags] = useState([]);
  const [pending, setPending] = useState(false);
  const { addEquipmentTags } = useWalkdownManagement();

  const localPayload = localStorage.getItem("assignTagPayload");
  const payload = localPayload && JSON.parse(localPayload);

  const handleAdd = () => {
    try {
      setPending(true);
      addEquipmentTags({
        scheduleID: Number(scheduleId),
        selectedEquipment: selectedTags,
        userID: payload?.userFk,
        walkDownStatus: payload?.scheduleStatus,
      }).then(() => {
        closeAssignTagModal();
        dispatch(setIsScheduledEquipmentsUpdated());
        setPending(false);
      });
    } catch {
    } finally {
      setPending(false);
    }
  };

  const handleResetFilter = () => {
    dispatch(resetAllFilters());
  };

  return (
    <div
      className="flex flex-col gap-4 w-full h-full"
      data-testid="assign-tags-component"
    >
      <div
        className="flex justify-between items-center"
        data-testid="assign-tags-header"
      >
        <h6 className="text-xl font-fira font-bold leading-6">Assign tag</h6>
        <IconButton
          color="default"
          onClick={closeAssignTagModal}
          data-testid="close-assign-tags"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      <div className="flex items-center gap-4 justify-between w-full">
        <AssignTagsSearchHeader isLoading={isLoading} />
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center min-h-[420px]"
          data-testid="loading-indicator"
        >
          <CircularProgress />
        </div>
      ) : notAssignedTags.length ? (
        <>
          <NotScheduledTagsTable
            setSelectedTags={setSelectedTags}
            pending={pending}
            selectedTags={selectedTags}
            notScheduled={notAssignedTags}
            setAssignTagsPerPage={setAssignTagsPerPage}
            assignTagsCurrentPage={assignTagsCurrentPage}
            assignTagsPerPage={assignTagsPerPage}
            notAssignedTagsCount={notAssignedTagsCount}
          />
          <div className="m-[-16px] p-4 bg-white border-t border-gray-300">
            <div className="flex justify-between items-center">
              <div data-testid="selected-tags-count">
                {selectedTags.length ? (
                  <span>{`${selectedTags.length} ${
                    selectedTags.length === 1 ? "tag is " : "tags are"
                  } chosen`}</span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-4">
                <Button
                  sx={{ width: "90px" }}
                  variant="outlined"
                  onClick={closeAssignTagModal}
                  disabled={pending || isLoading}
                  data-testid="cancel-assign-tags"
                >
                  Cancel
                </Button>
                <Button
                  sx={{ width: "90px" }}
                  variant="contained"
                  onClick={handleAdd}
                  disabled={pending || !selectedTags.length || isLoading}
                  data-testid="add-assign-tags"
                >
                  {pending ? <CircularProgress size={20} /> : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center min-h-[420px]">
          <Typography className="text-gray-500" data-testid="no-tags-message">
            No tags available
          </Typography>
          <Button
            data-testid="reset-filter-button"
            variant="outlined"
            size="small"
            onClick={handleResetFilter}
          >
            Go back
          </Button>
        </div>
      )}
    </div>
  );
};
