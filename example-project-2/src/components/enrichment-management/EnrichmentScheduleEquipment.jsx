import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Button } from "@mui/material";

import {
  isScheduledEquipmentsUpdated,
  setIsScheduledEquipmentsUpdated,
  setInitialScheduleEquipmentStatuses,
} from "../../store/slices/enrichment-management/schedulesSlice";
import {
  getFilterParams,
  getCurrentPage,
  resetAllFilters,
} from "../../store/slices/enrichment-management/notAssignedTagsSlice";
import {
  allowedUserActions,
  selectUserRole,
} from "../../store/slices/global/userSlice";
import { useEnrichmentManagement } from "../../hooks/useEnrichmentManagement";

import { TransitionsModal } from "../common/Modal";
import { ImageInfo } from "../common/ImageInfo";
import { DeletionAgreement } from "../common/DeletionAgreement";
import { EnrichmentScheduleEquipmentTable } from "./EnrichmentScheduleEquipmentTable";
import { AssignEnrichmentTags } from "./AssignEnrichmentTags";
import { USER_ROLE } from "../../constants/environment";
import { AddNewTagForm } from "./AddNewTagForm";

export const EnrichmentScheduleEquipment = ({ id }) => {
  const { accounts } = useMsal();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state?.from;
  const filterParams = useSelector(getFilterParams);
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.em;
  const isScheduleEquipmentsUpdated = useSelector(isScheduledEquipmentsUpdated);
  const userRole = useSelector(selectUserRole);

  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const savedPage = sessionStorage.getItem(`enrichmentSchedulePage_${id}`);
  const [page, setPage] = useState(savedPage ? Number(savedPage) : 1);
  const [equipmentTags, setEquipmentTags] = useState([]);
  const savedRowsPerPage = localStorage.getItem(
    "enrichmentScheduleRowsPerPage"
  );
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

  const [isAddNewTagFormOpen, setIsAddNewTagFormOpen] = useState(false);

  const selectedEnrichmentScheduleDetails = localStorage.getItem(
    "assignEnrichmentTagPayload"
  );

  const enrichmentSchedule =
    selectedEnrichmentScheduleDetails &&
    JSON.parse(selectedEnrichmentScheduleDetails);

  const isAssignNewTagBtnEnabled =
    (userRole === USER_ROLE.ENRICHMENT_TEAM &&
      accounts[0].localAccountId === enrichmentSchedule.user.id) ||
    userRole === USER_ROLE.ADMIN;

  const {
    deleteScheduleEquipment,
    getEnrichmentScheduleEquipment,
    getNotScheduledEquipmentTags,
    getEnrichmentScheduleOwnerByScheduleId,
  } = useEnrichmentManagement();

  useEffect(() => {
    getEnrichmentScheduleOwnerByScheduleId(id).then((response) => {
      const scheduleOwner = `${response?.firstName ?? ""} ${
        response?.lastName ?? ""
      }`;
      setScheduleOwner(scheduleOwner);
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsSchedulesLoading(true);
      getEnrichmentScheduleEquipment(id, page, rowsPerPage)
        .then((response) => {
          if (isMounted && response) {
            setRows(response.result);
            setTotalRows(response.totalTags);
            setIsSchedulesLoading(false);
            setEquipmentTags(response.result.map((item) => item.equipmentTag));
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
    getEnrichmentScheduleEquipment,
  ]);

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
    sessionStorage.removeItem(`enrichmentSchedulePage_${id}`);
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate("/enrichment-management");
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

  const handleAddNewTag = () => {
    setIsAddNewTagFormOpen(true);
  };

  return isAddNewTagFormOpen ? (
    <AddNewTagForm id={id} setIsAddNewTagFormOpen={setIsAddNewTagFormOpen} />
  ) : (
    <div className="w-full">
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
                Enrichment schedule equipment
              </h6>
              <div
                className="font-bold text-sm min-h-[20px]"
                data-testid="schedule-owner"
              >
                {scheduleOwner && <p>Assigned to: {scheduleOwner}</p>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              {isAssignNewTagBtnEnabled && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewTag}
                  disabled={pending}
                  data-testid="add-new-tag-btn"
                >
                  Add new tag
                </Button>
              )}
              {isUserActionEnabled && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAssignTag}
                  disabled={pending}
                  data-testid="assign-tag-btn"
                >
                  Assign tag
                </Button>
              )}
            </div>
          </div>
        </div>
        <EnrichmentScheduleEquipmentTable
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
        />
        <TransitionsModal open={openInfo} handleClose={handleCloseInfo}>
          <ImageInfo selectedImageInfo={selectedImageInfo} />
        </TransitionsModal>
        <TransitionsModal
          open={openConfirmModal}
          handleClose={closeConfirmModal}
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
        >
          <AssignEnrichmentTags
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
