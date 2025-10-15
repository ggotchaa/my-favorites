import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Button, IconButton } from "@mui/material";

import {
  isScheduledEquipmentsUpdated,
  setIsScheduledEquipmentsUpdated,
  setInitialScheduleEquipmentStatuses,
  getUpdatedScheduleEquipmentStatuses,
  getInitialScheduleEquipmentStatuses,
  setUpdatedScheduleEquipmentStatuses,
} from "../../store/slices/walkdown-management/schedulesSlice";
import {
  getFilterParams,
  getCurrentPage,
  resetAllFilters,
} from "../../store/slices/walkdown-management/notAssignedTagsSlice";
import { allowedUserActions } from "../../store/slices/global/userSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";

import { TransitionsModal } from "../common/Modal";
import { ImageInfo } from "../common/ImageInfo";
import { AssignWalkdownTags } from "./AssignWalkdownTags";
import { DeletionAgreement } from "../common/DeletionAgreement";
import { WalkdownScheduleEquipmentTable } from "./WalkdownScheduleEquipmentTable";

export const WalkdownScheduleEquipment = ({ id }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state?.from;
  const filterParams = useSelector(getFilterParams);
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.wm;
  const updatedStatuses = useSelector(getUpdatedScheduleEquipmentStatuses);
  const initialStatuses = useSelector(getInitialScheduleEquipmentStatuses);
  const isScheduleEquipmentsUpdated = useSelector(isScheduledEquipmentsUpdated);

  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const savedPage = sessionStorage.getItem(`walkdownSchedulePage_${id}`);
  const [page, setPage] = useState(savedPage ? Number(savedPage) : 1);
  const [equipmentTags, setEquipmentTags] = useState([]);
  const savedRowsPerPage = localStorage.getItem("walkdownScheduleRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 10
  );
  const order = page * rowsPerPage;

  const [imageInfo, setImageInfo] = useState({});
  const [selectedImageInfo, setSelectedImageInfo] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [scheduleEquipmentId, setScheduleEquipmentId] = useState(null);
  const [imagesIdToBeDeleted, setImagesIdToBeDeleted] = useState([]);

  const [pending, setPending] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const [openInfo, setOpenInfo] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openAssignTagModal, setOpenAssignTagModal] = useState(false);
  const [openImageConfirmModal, setOpenImageConfirmModal] = useState(false);

  const [notAssignedTags, setNotAssignedTags] = useState([]);
  const [notAssignedTagsCount, setNotAssignedTagsCount] = useState(0);
  const [isNotAssignedTagsLoading, setIsNotAssignedTagsLoading] =
    useState(true);
  const [fetchNotAssignedTags, setFetchNotAssignedTags] = useState(false);
  const [assignTagsPerPage, setAssignTagsPerPage] = useState(25);
  const assignTagsCurrentPage = useSelector(getCurrentPage);

  const [scheduleOwner, setScheduleOwner] = useState("");

  const {
    updateScheduleStatus,
    updateScheduleEquipment,
    deleteWalkdownEquipmentImages,
    deleteScheduleEquipment,
    getWalkdownEquipmentImages,
    getWalkdownScheduleEquipment,
    getNotScheduledEquipmentTags,
    getWalkdownScheduleOwnerByScheduleId,
  } = useWalkdownManagement();

  useEffect(() => {
    getWalkdownScheduleOwnerByScheduleId(id).then((response) => {
      setScheduleOwner(response);
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsSchedulesLoading(true);
      getWalkdownScheduleEquipment(id, page, rowsPerPage)
        .then((response) => {
          if (isMounted && response) {
            setRows(response.result);
            setTotalRows(response.totalTags);
            setIsSchedulesLoading(false);
            setEquipmentTags(response.result.map((item) => item.assetNumber));
            dispatch(setInitialScheduleEquipmentStatuses(response.result));
          }
        })
        .finally(() => {
          setIsSchedulesLoading(false);
        });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [
    id,
    page,
    dispatch,
    rowsPerPage,
    isScheduleEquipmentsUpdated,
    getWalkdownScheduleEquipment,
  ]);

  useEffect(() => {
    if (equipmentTags.length) {
      setIsImagesLoading(true);
      const imageInfo = {};
      getWalkdownEquipmentImages(equipmentTags)
        .then((response) => {
          if (response) {
            Object.entries(response).forEach(([assetNumber, images]) => {
              if (images && images.length > 0) {
                imageInfo[assetNumber] = {
                  images: images,
                  equipmentTag: images[0].equipmentTag,
                };
              }
            });
            setImageInfo(imageInfo);
          }
        })
        .finally(() => {
          setIsImagesLoading(false);
        });
    }
  }, [equipmentTags, getWalkdownEquipmentImages]);

  useEffect(() => {
    if (fetchNotAssignedTags === false) return;

    const getNotAssignedTags = async () => {
      setIsNotAssignedTagsLoading(true);
      try {
        const response = await getNotScheduledEquipmentTags({
          ...filterParams,
          startFrom: assignTagsCurrentPage,
          fetchRecord: assignTagsPerPage,
        });

        if (response) {
          setNotAssignedTags(response.items);
          setNotAssignedTagsCount(response.count);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setNotAssignedTags([]);
        setNotAssignedTagsCount(0);
      } finally {
        setIsNotAssignedTagsLoading(false);
      }
    };

    getNotAssignedTags();
  }, [filterParams, fetchNotAssignedTags]);

  const closeConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const agreeConfirmModal = () => {
    setDeletionPending(true);
    deleteScheduleEquipment(scheduleEquipmentId)
      .then((response) => {
        if (response) {
          setOpenConfirmModal(false);
          setScheduleEquipmentId(null);
          setDeletionPending(false);
          dispatch(setIsScheduledEquipmentsUpdated());
        }
      })
      .finally(() => {
        setDeletionPending(false);
      });
  };

  const closeImageConfirmModal = () => {
    setImagesIdToBeDeleted(
      imagesIdToBeDeleted.filter((id) => id !== selectedImageId)
    );
    setOpenImageConfirmModal(false);
  };

  const agreeImageConfirmModal = () => {
    setImagesIdToBeDeleted([...imagesIdToBeDeleted, selectedImageId]);
    setOpenImageConfirmModal(false);
  };

  const handleBack = () => {
    sessionStorage.removeItem(`walkdownSchedulePage_${id}`);
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate("/walkdown-management");
    }
  };

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  const handleAssignTag = () => {
    setOpenAssignTagModal(true);
    setFetchNotAssignedTags(true);
  };

  const closeAssignTagModal = () => {
    setOpenAssignTagModal(false);
    setFetchNotAssignedTags(false);
    dispatch(resetAllFilters());
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setRows(initialStatuses);
    setImagesIdToBeDeleted([]);
    dispatch(setUpdatedScheduleEquipmentStatuses([]));
    setEditMode(false);
  };

  const handleSave = () => {
    if (updatedStatuses.length && imagesIdToBeDeleted.length) {
      updateAll();
    } else if (updatedStatuses.length) {
      updateOnlyStasuses();
    } else if (imagesIdToBeDeleted.length) {
      updateOnlyImages();
    } else {
      setEditMode(false);
      return;
    }
  };

  const updateAll = () => {
    setPending(true);
    updateScheduleEquipment(updatedStatuses, imagesIdToBeDeleted)
      .then((response) => {
        if (response) {
          setEditMode(false);
          dispatch(setIsScheduledEquipmentsUpdated());
        }
      })
      .finally(() => {
        setPending(false);
        setEditMode(false);
        dispatch(setUpdatedScheduleEquipmentStatuses([]));
      });
  };

  const updateOnlyStasuses = () => {
    setPending(true);
    updateScheduleStatus(updatedStatuses)
      .then((response) => {
        if (response) {
          setEditMode(false);
          dispatch(setIsScheduledEquipmentsUpdated());
        }
      })
      .finally(() => {
        setPending(false);
        setEditMode(false);
        dispatch(setUpdatedScheduleEquipmentStatuses([]));
      });
  };

  const updateOnlyImages = () => {
    setPending(true);
    deleteWalkdownEquipmentImages(imagesIdToBeDeleted)
      .then((response) => {
        if (response) {
          setEditMode(false);
          dispatch(setIsScheduledEquipmentsUpdated());
        }
      })
      .finally(() => {
        setPending(false);
        setEditMode(false);
        setImagesIdToBeDeleted([]);
      });
  };

  return (
    <div className="w-full" data-testid="walkdown-schedule-equipment">
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        data-testid="back-btn"
      >
        Back
      </Button>
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between h-[40px]">
            <div className="flex flex-col gap-1 mt-4">
              <h6
                data-testid="table-title"
                className="text-xl font-bold leading-6"
              >
                Walkdown schedule equipment
              </h6>
              <div className="font-bold text-sm min-h-[20px]">
                {scheduleOwner && (
                  <p data-testid="schedule-owner">
                    Assigned to:{" "}
                    {`${scheduleOwner?.firstName ?? ""} ${
                      scheduleOwner?.lastName ?? ""
                    }`}
                  </p>
                )}
              </div>
            </div>

            {isUserActionEnabled && (
              <div className="flex items-center gap-6">
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAssignTag}
                  disabled={pending}
                  data-testid="assign-tag-btn"
                >
                  Assign tag
                </Button>
                {!editMode ? (
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    disabled={pending}
                    data-testid="edit-btn"
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <IconButton
                      color="error"
                      onClick={handleCancel}
                      disabled={pending}
                      data-testid="cancel-btn"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={handleSave}
                      disabled={pending}
                      data-testid="save-btn"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <WalkdownScheduleEquipmentTable
          page={page}
          setPage={setPage}
          rows={rows}
          imageInfo={imageInfo}
          setRows={setRows}
          editMode={editMode}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          setSelectedImageInfo={setSelectedImageInfo}
          setSelectedImageId={setSelectedImageId}
          setScheduleEquipmentId={setScheduleEquipmentId}
          setOpenInfo={setOpenInfo}
          setOpenConfirmModal={setOpenConfirmModal}
          setOpenImageConfirmModal={setOpenImageConfirmModal}
          pending={pending}
          isImagesLoading={isImagesLoading}
          loading={isSchedulesLoading}
          imagesIdToBeDeleted={imagesIdToBeDeleted}
          isUserActionEnabled={isUserActionEnabled}
          order={order}
          id={id}
          scheduleOwner={scheduleOwner}
        />
        <TransitionsModal
          open={openInfo}
          handleClose={handleCloseInfo}
          data-testid="image-info-modal"
        >
          <ImageInfo selectedImageInfo={selectedImageInfo} />
        </TransitionsModal>
        <TransitionsModal
          open={openConfirmModal}
          handleClose={closeConfirmModal}
          data-testid="delete-tag-modal"
        >
          <DeletionAgreement
            title="Delete tag?"
            subtitle="You will not be able to restore it later."
            onCancel={closeConfirmModal}
            onConfirm={agreeConfirmModal}
            loading={deletionPending}
          />
        </TransitionsModal>
        <TransitionsModal
          open={openImageConfirmModal}
          handleClose={closeImageConfirmModal}
          data-testid="delete-image-modal"
        >
          <DeletionAgreement
            title="Delete image?"
            subtitle="You will not be able to restore it later."
            onCancel={closeImageConfirmModal}
            onConfirm={agreeImageConfirmModal}
          />
        </TransitionsModal>
        <TransitionsModal
          open={openAssignTagModal}
          handleClose={closeAssignTagModal}
          customStyle={{ width: "90%", height: "90%", maxHeight: "90%" }}
          data-testid="assign-tag-modal"
        >
          <AssignWalkdownTags
            closeAssignTagModal={closeAssignTagModal}
            scheduleId={id}
            notAssignedTags={notAssignedTags}
            isLoading={isNotAssignedTagsLoading}
            setAssignTagsPerPage={setAssignTagsPerPage}
            assignTagsCurrentPage={assignTagsCurrentPage}
            assignTagsPerPage={assignTagsPerPage}
            notAssignedTagsCount={notAssignedTagsCount}
          />
        </TransitionsModal>
      </div>
    </div>
  );
};
