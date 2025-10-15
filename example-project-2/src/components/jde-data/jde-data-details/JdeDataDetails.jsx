import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MoreCommentsIcon from "@mui/icons-material/Chat";
import { DeletionAgreement } from "../../common/DeletionAgreement";

import {
  Autocomplete,
  Button,
  ButtonGroup,
  IconButton,
  Paper,
  TextField,
  Badge,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  allowedUserActions,
  selectUserRole,
  getUserPolicyId,
} from "../../../store/slices/global/userSlice";
import {
  isCharacteristicsUpdated,
  isWalkdownPicturesUpdated,
  setEnrichmentStatus,
} from "../../../store/slices/jde-data/characteristicsSlice";
import { useJdeData } from "../../../hooks/useJdeDataHook";

import { AttributesTab, EquipmentDocuments, WalkdownPicturesTab } from ".";
import {
  ORDERED_EQUIPMENT_CHARS,
  IMG_DELETE_ALLOWED_STATUSES,
} from "../../../constants/jde-data";
import { NEW_TAG_DELETE_NOT_ALLOWWED_STATUS } from "../../../constants/enrichment-management";
import { getFormattedStatusList } from "../../../utils/index";
import { TransitionsModal } from "../../common/Modal";
import { CommentsHistory } from "../../common/CommentsHistory";
import { useFilterByPermissions } from "../../../hooks/useFilterByPermissions";
import { USER_ROLE } from "../../../constants/environment";

export const JdeDataDetails = ({ id }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accounts } = useMsal();
  const location = useLocation();
  const previousPath = location.state?.from;
  const role = useSelector(selectUserRole);
  const userId = useSelector(getUserPolicyId);
  const isEquipmentCharacteristicsUpdated = useSelector(
    isCharacteristicsUpdated
  );

  const isEquipmentPicturesUpdated = useSelector(isWalkdownPicturesUpdated);
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.jde;
  const [activeButton, setActiveButton] = useState("attributes");

  const [statusEditMode, setStatusEditMode] = useState(false);
  const [assetNumberPhk, setAssetNumberPhk] = useState("");
  const [assetNumberBk, setAssetNumberBk] = useState("");
  const [equipmentChars, setEquipmentChars] = useState([]);
  const [initialEquipmentStatus, setInitialEquipmentStatus] = useState({
    value: "",
    label: "",
  });
  const [generalEquipmentStatus, setGeneralEquipmentStatus] = useState({
    value: "",
    label: "",
  });
  const [isNewTag, setIsNewTag] = useState(false);
  const [equipmentTag, setEquipmentTag] = useState("");

  const [initialEquipmentComment, setInitialEquipmentComment] = useState("");
  const [generalEquipmentComment, setGeneralEquimentComment] = useState("");
  const [mainNewCommentValue, setMainNewCommentValue] = useState("");
  const [walkdownAssignTo, setWalkdownAssignTo] = useState(null);
  const [enrichmentAssignTo, setEnrichmentAssignTo] = useState(null);

  const [isEquipmentCharsLoading, setIsEquipmentCharsLoading] = useState(true);
  const [isCommentHistoryOpen, setIsCommentHistoryOpen] = useState(false);
  const [equipmentCommentsHistory, setEquipmentCommentsHistory] = useState([]);
  const [isEquipmentStatusLoading, setIsEquipmentStatusLoading] =
    useState(true);

  const [equipmentCommentsCount, setEquipmentCommentsCount] = useState(0);

  const [equipmentStatuses, setEquipmentStatuses] = useState([]);
  const [attributeStatuses, setAttributeStatuses] = useState([]);

  const [imagesInfo, setImagesInfo] = useState(null);

  const [isImagesLoading, setIsImagesLoading] = useState(true);

  const [classesAndSubClasses, setClassesAndSubClasses] = useState([]);
  const [isClassesAndSubClassesLoading, setIsClassesAndSubClassesLoading] =
    useState(false);

  const [isDeleteBtnEnabled, setIsDeleteBtnEnabled] = useState(false);
  const [isAddPhotoBtnEnabled, setIsAddPhotoBtnEnabled] = useState(false);
  const [isEditPhotoBtnEnabled, setIsEditPhotoBtnEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const {
    getUnifiedEquipmentTagCharacteristics,
    getWalkdownPictures,
    getEquipmentStatuses,
    getEquipmentGeneralStatusDetails,
    addNewEquipTagWalkdownCharComment,
    getClassesAndSubClasses,
    updateEquipmentGeneralStatusDetails,
    deleteEquipmentTagWithCharacteristics,
  } = useJdeData();

  const {
    filteredEquipmentStatuses,
    filteredAttrStatuses,
    flag,
    setCurrentEquipmentStatus,
  } = useFilterByPermissions(
    initialEquipmentStatus,
    equipmentStatuses,
    attributeStatuses
  );

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsClassesAndSubClassesLoading(true);
      getClassesAndSubClasses()
        .then((response) => {
          if (isMounted && response) {
            setIsClassesAndSubClassesLoading(false);
            setClassesAndSubClasses(response);
          }
        })
        .finally(() => {
          setIsClassesAndSubClassesLoading(false);
        });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getClassesAndSubClasses]);

  const fetchEquipmentStatusDetails = useCallback(() => {
    getEquipmentGeneralStatusDetails(id)
      .then((response) => {
        if (response) {
          const generalStatus = {
            label: response.equipmentStatusName,
            value: response.equipmentStatusPhk,
          };
          setWalkdownAssignTo(response.walkdownSchedule);
          setEnrichmentAssignTo(response.enrichmentSchedule);
          setGeneralEquipmentStatus(generalStatus);
          dispatch(setEnrichmentStatus(generalStatus.label));
          setInitialEquipmentStatus(generalStatus);
          setGeneralEquimentComment(
            response.comments.find((comment) => comment.current)?.comment || ""
          );
          setInitialEquipmentComment(
            response.comments.find((comment) => comment.current)?.comment || ""
          );
          setEquipmentCommentsCount(response.comments.length);
          setAssetNumberPhk(response.equipmentAssetNumberPhk);
          setAssetNumberBk(response.equipmentAssetNumberBk);
          setEquipmentCommentsHistory(response.comments);
          setIsEquipmentStatusLoading(false);
          if (response.isNewTag) {
            setIsNewTag(true);
            if (response.enrichmentSchedule) {
              setIsDeleteBtnEnabled(
                (role === USER_ROLE.ENRICHMENT_TEAM &&
                  !NEW_TAG_DELETE_NOT_ALLOWWED_STATUS.includes(
                    generalStatus.label
                  ) &&
                  accounts[0].localAccountId ===
                    response.enrichmentSchedule.user.userObjectId) ||
                  role === USER_ROLE.ADMIN
              );
            }
          }
          const canAddPhotoAsWalkdownCoordinator =
            role === USER_ROLE.WALKDOWN_COORDINATOR &&
            IMG_DELETE_ALLOWED_STATUSES.includes(generalStatus.label) &&
            response.walkdownSchedule?.user?.email;
          const canEditPhotoAsWalkdownCoordinator =
            role === USER_ROLE.WALKDOWN_COORDINATOR &&
            IMG_DELETE_ALLOWED_STATUSES.includes(generalStatus.label);

          const canAddPhotoAsFieldEngineer =
            role === USER_ROLE.FIELD_ENGINEERS &&
            accounts[0].localAccountId ===
              response.walkdownSchedule?.user?.userObjectId &&
            IMG_DELETE_ALLOWED_STATUSES.includes(generalStatus.label);

          const canAddPhotoAsAdmin =
            role === USER_ROLE.ADMIN && response.walkdownSchedule?.user?.email;
          const canEditPhotoAsAdmin = role === USER_ROLE.ADMIN;

          setIsAddPhotoBtnEnabled(
            canAddPhotoAsWalkdownCoordinator ||
              canAddPhotoAsFieldEngineer ||
              canAddPhotoAsAdmin
          );
          setIsEditPhotoBtnEnabled(
            canEditPhotoAsWalkdownCoordinator || canEditPhotoAsAdmin
          );
        }
      })
      .finally(() => {
        setIsEquipmentStatusLoading(false);
      });
  }, [getEquipmentGeneralStatusDetails, id]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsEquipmentCharsLoading(true);
      getUnifiedEquipmentTagCharacteristics(id)
        .then((response) => {
          if (isMounted && response) {
            const formattedResponse = response.sort(
              (a, b) =>
                ORDERED_EQUIPMENT_CHARS.indexOf(a.jdeAttrName) -
                ORDERED_EQUIPMENT_CHARS.indexOf(b.jdeAttrName)
            );
            setEquipmentChars(formattedResponse);

            const equipmentTagChar = response.find(
              (char) => char.jdeAttrName === "EQUIPMENT_TAG"
            );
            if (equipmentTagChar) {
              setEquipmentTag(
                equipmentTagChar.jdeValue ||
                  equipmentTagChar.walkdownValue ||
                  ""
              );
            }

            setIsEquipmentCharsLoading(false);
          }
        })
        .finally(() => {
          setIsEquipmentCharsLoading(false);
        });
    };
    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [
    getUnifiedEquipmentTagCharacteristics,
    id,
    isEquipmentCharacteristicsUpdated,
  ]);

  useEffect(() => {
    fetchEquipmentStatusDetails();
  }, [fetchEquipmentStatusDetails]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      getEquipmentStatuses().then((response) => {
        if (isMounted && response) {
          const { equipmentStatuses, attrStatuses } =
            getFormattedStatusList(response);
          setEquipmentStatuses(equipmentStatuses);
          setAttributeStatuses(attrStatuses);
        }
      });
    };

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, [getEquipmentStatuses, role]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      getWalkdownPictures([id])
        .then((response) => {
          if (isMounted && response) {
            const images = response[id];
            setImagesInfo(images);
          }
        })
        .finally(() => {
          setIsImagesLoading(false);
        });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getWalkdownPictures, id, isEquipmentPicturesUpdated]);

  const handleClick = (btn) => {
    setActiveButton(btn);
  };

  const handleEquipmentStatusChange = (_event, option) => {
    if (option) {
      setGeneralEquipmentStatus({ label: option.label, value: option.value });
    }
  };

  const handleMainCommentChange = (event) => {
    setGeneralEquimentComment(event.target.value);
    setMainNewCommentValue(event.target.value);
  };

  const handleSaveMainStatus = async () => {
    const updatedStatus = generalEquipmentStatus.label;
    const initialStatus = initialEquipmentStatus.label;
    const isMainStatusUpdated = initialStatus !== updatedStatus;

    if (!isMainStatusUpdated && !mainNewCommentValue.trim()) {
      setGeneralEquipmentStatus(initialEquipmentStatus);
      setGeneralEquimentComment(initialEquipmentComment);
      setStatusEditMode(false);
      setMainNewCommentValue("");
      return;
    }

    setCurrentEquipmentStatus(generalEquipmentStatus);
    setStatusEditMode(false);

    await updateEquipmentGeneralStatusDetails(
      [
        {
          assetNumberPhk,
          statusPhk: generalEquipmentStatus.value,
          comment: mainNewCommentValue.trim(),
        },
      ],
      userId
    );
    setMainNewCommentValue("");
    fetchEquipmentStatusDetails();
  };

  const handleCancelMainStatus = () => {
    setGeneralEquipmentStatus(initialEquipmentStatus);
    setGeneralEquimentComment(initialEquipmentComment);
    setMainNewCommentValue("");
    setStatusEditMode(false);
  };

  const handleBack = () => {
    if (previousPath?.includes("/enrichment-management/")) {
      navigate(previousPath);
    } else if (previousPath?.includes("/walkdown-management/")) {
      navigate(previousPath);
    } else {
      navigate("/jde-data");
    }
  };

  const handleDeleteTag = async () => {
    try {
      setIsDeleting(true);
      await deleteEquipmentTagWithCharacteristics(id);
      setIsDeleting(false);
      handleBack();
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting tag:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        data-testid="back-button"
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
      >
        Back
      </Button>
      <div className="flex justify-between items-center font-fira text-xl not-italic font-bold leading-6">
        <div className="flex flex-col">
          <div data-testid="equipment-tag">{equipmentTag}</div>
          {isEquipmentStatusLoading ? null : (
            <div className="flex flex-col mb-2 text-black/[0.54] text-sm">
              <div data-testid="equipment-assigned-info">
                Assigned to enrichment to: &nbsp;
                {enrichmentAssignTo ? (
                  <Link
                    className="text-black/[0.8] underline"
                    to={`/enrichment-management/${enrichmentAssignTo.enrichmentScheduleMasterPk}`}
                    state={{ from: `/jde-data/${id}` }}
                    data-testid="enrichment-assign-link"
                  >
                    {enrichmentAssignTo.user?.fullName}
                  </Link>
                ) : (
                  "not assigned"
                )}
              </div>
              <div data-testid="walkdown-assigned-info">
                Assigned to field verification to: &nbsp;
                {walkdownAssignTo ? (
                  <Link
                    className="text-black/[0.8] underline"
                    to={`/walkdown-management/${walkdownAssignTo.walkdownScheduleMasterPk}`}
                    state={{ from: `/jde-data/${id}` }}
                    data-testid="walkdown-assign-link"
                  >
                    {walkdownAssignTo.user?.fullName}
                  </Link>
                ) : (
                  "not assigned"
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <Paper className="flex p-2 gap-2" elevation={0} variant="outlined">
            <Autocomplete
              size="small"
              disablePortal
              options={filteredEquipmentStatuses || []}
              value={generalEquipmentStatus.label || ""}
              renderInput={(params) => (
                <TextField {...params} label="Enrichment status" />
              )}
              onChange={(event, option) =>
                handleEquipmentStatusChange(event, option)
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ width: 300 }}
              disableClearable
              disabled={
                !flag.isEditEnrichmentStatusEnabled ||
                !statusEditMode ||
                isEquipmentStatusLoading
              }
              data-testid="status-autocomplete"
            />

            <div className="flex gap-2 items-center">
              <span className="text-sm leading-4 text-black/[0.87] font-roboto">
                {statusEditMode ? (
                  <TextField
                    className="w-full"
                    size="small"
                    label="Comments"
                    variant="outlined"
                    value={mainNewCommentValue}
                    placeholder={!mainNewCommentValue && "New comment"}
                    disabled={
                      !flag.isEditEnrichmentCommentEnabled ||
                      !statusEditMode ||
                      isEquipmentStatusLoading
                    }
                    onChange={handleMainCommentChange}
                    style={{ width: 300 }}
                    data-testid="main-comment-input"
                  />
                ) : (
                  <TextField
                    className="w-full"
                    size="small"
                    label="Comments"
                    variant="outlined"
                    value={initialEquipmentComment}
                    placeholder={!initialEquipmentComment && "No comment"}
                    disabled={
                      !flag.isEditEnrichmentCommentEnabled ||
                      !statusEditMode ||
                      isEquipmentStatusLoading
                    }
                    style={{ width: 300 }}
                    data-testid="main-comment-input"
                  />
                )}
              </span>
              <IconButton
                disabled={!equipmentCommentsCount}
                aria-label="comments"
                onClick={() => setIsCommentHistoryOpen(true)}
                data-testid="comments-history-btn"
              >
                <Badge badgeContent={equipmentCommentsCount}>
                  <MoreCommentsIcon />
                </Badge>
              </IconButton>
            </div>
            {isUserActionEnabled && flag.isEnrichmentEditEnabled && (
              <div
                data-testid="status-actions"
                className="flex items-center gap-4"
              >
                {statusEditMode ? (
                  <>
                    <IconButton
                      color="error"
                      onClick={handleCancelMainStatus}
                      data-testid="cancel-btn"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={handleSaveMainStatus}
                      data-testid="save-btn"
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <IconButton
                    data-testid="edit-btn"
                    color="primary"
                    onClick={() => setStatusEditMode(true)}
                    disabled={isEquipmentStatusLoading}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            )}
          </Paper>
        </div>
      </div>
      <div className="mt-0 flex justify-between items-center">
        <ButtonGroup variant="outlined" aria-label="Equipment details section">
          <Button
            sx={{
              backgroundColor: activeButton === "attributes" ? "#0066B214" : "",
            }}
            onClick={() => handleClick("attributes")}
            data-testid="attributes-btn"
          >
            Attributes
          </Button>
          <Button
            sx={{
              backgroundColor: activeButton === "documents" ? "#0066B214" : "",
            }}
            onClick={() => handleClick("documents")}
            data-testid="documents-btn"
          >
            Documents
          </Button>
          <Button
            sx={{
              backgroundColor:
                activeButton === "walkdown-pictures" ? "#0066B214" : "",
            }}
            onClick={() => handleClick("walkdown-pictures")}
            data-testid="walkdown-pictures-btn"
          >
            Walkdown pictures
          </Button>
        </ButtonGroup>
        {isDeleteBtnEnabled && (
          <Button
            onClick={() => setOpenConfirmModal(true)}
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            data-testid="delete-tag-btn"
          >
            {isDeleting ? "Deleting..." : "Delete tag"}
          </Button>
        )}
      </div>
      <div className="mt-6">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {activeButton === "attributes" && (
            <AttributesTab
              loading={isEquipmentCharsLoading || isClassesAndSubClassesLoading}
              rows={equipmentChars}
              attributeStatuses={filteredAttrStatuses}
              classesAndSubClasses={classesAndSubClasses}
              flag={flag}
              isNewTag={isNewTag}
            />
          )}
        </LocalizationProvider>
        {activeButton === "documents" && <EquipmentDocuments />}
        {activeButton === "walkdown-pictures" && (
          <WalkdownPicturesTab
            images={imagesInfo || []}
            loading={isImagesLoading}
            assetNumberPhk={assetNumberPhk}
            equipmentTag={equipmentTag}
            canAddPhoto={isAddPhotoBtnEnabled}
            canEditPhoto={isEditPhotoBtnEnabled}
            onUploadSuccess={fetchEquipmentStatusDetails}
          />
        )}
      </div>
      <TransitionsModal
        open={isCommentHistoryOpen}
        handleClose={() => setIsCommentHistoryOpen(false)}
      >
        <CommentsHistory comments={equipmentCommentsHistory} />
      </TransitionsModal>
      <TransitionsModal
        open={openConfirmModal}
        handleClose={() => setOpenConfirmModal(false)}
      >
        <DeletionAgreement
          title="Delete tag?"
          subtitle="You will not be able to restore it later."
          onCancel={() => setOpenConfirmModal(false)}
          onConfirm={handleDeleteTag}
          loading={isDeleting}
        />
      </TransitionsModal>
    </>
  );
};
