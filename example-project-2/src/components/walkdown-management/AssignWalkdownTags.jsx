import { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { setIsScheduledEquipmentsUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";
import { resetAllFilters } from "../../store/slices/walkdown-management/notAssignedTagsSlice";

import { NotScheduledWalkdownTagsTable } from "./NotScheduledWalkdownTagsTable";
import { WalkdownTagsSearchHeader } from "./WalkdownTagsSearchHeader";

export const AssignWalkdownTags = ({
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
  const [search, setSearch] = useState("");
  const { addEquipmentTags } = useWalkdownManagement();
  const debounceTimerRef = useRef(null);

  const localPayload = localStorage.getItem("assignWalkdownTagPayload");
  const payload = localPayload && JSON.parse(localPayload);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const debouncedHandleAdd = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pending) return;

      try {
        setPending(true);
        addEquipmentTags({
          scheduleID: Number(scheduleId),
          selectedEquipment: selectedTags,
          userID: payload?.userFk,
          walkDownStatus: payload?.scheduleStatus,
        })
          .then(() => {
            closeAssignTagModal();
            dispatch(setIsScheduledEquipmentsUpdated());
          })
          .catch((error) => {
            console.error("Error adding equipment tags:", error);
          })
          .finally(() => {
            setPending(false);
          });
      } catch (error) {
        console.error("Error in handleAdd:", error);
        setPending(false);
      }
    }, 300); // 300ms delay
  }, [
    scheduleId,
    selectedTags,
    payload,
    addEquipmentTags,
    closeAssignTagModal,
    dispatch,
    pending,
  ]);

  const handleResetFilter = () => {
    dispatch(resetAllFilters());
    setSearch("");
  };

  return (
    <div
      className="flex flex-col gap-4 w-full h-full"
      data-testid="assign-walkdown-tags-container"
    >
      <div className="flex justify-between items-center">
        <h6 className="text-xl font-fira font-bold leading-6">Assign tag</h6>
        <IconButton
          color="default"
          onClick={closeAssignTagModal}
          data-testid="close-modal-button"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      <div className="flex items-center gap-4 justify-between w-full">
        <WalkdownTagsSearchHeader
          isLoading={isLoading}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[420px]">
          <CircularProgress data-testid="loading-spinner" />
        </div>
      ) : notAssignedTags.length ? (
        <>
          <NotScheduledWalkdownTagsTable
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
              <div>
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
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  sx={{ width: "90px" }}
                  variant="contained"
                  onClick={debouncedHandleAdd}
                  disabled={pending || !selectedTags.length || isLoading}
                  data-testid="add-tags-button"
                >
                  {pending ? (
                    <CircularProgress
                      size={20}
                      data-testid="add-tags-loading"
                    />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center min-h-[420px]">
          <Typography className="text-gray-500">No tags available</Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetFilter}
            data-testid="refresh-button"
          >
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
