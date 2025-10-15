import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";

import {
  Autocomplete,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Skeleton,
  IconButton,
  Button,
} from "@mui/material";
import { Image } from "antd";

import { Link } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { AddPhotoAlternate } from "@mui/icons-material";

import {
  setUpdatedScheduleEquipmentStatuses,
  setIsScheduledEquipmentsUpdated,
} from "../../store/slices/walkdown-management/schedulesSlice";
import { selectUserRole } from "../../store/slices/global/userSlice";
import { getStatusSeverity, getUpdatedSchedule } from "../../utils";
import { useJdeData } from "../../hooks/useJdeDataHook";

import { StatusAlert } from "../common/StatusAlert";
import { TableLoader } from "../common/TableLoader";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";
import { ImagesGalleryList } from "../common/ImagesGalleryList";
import { AddPhotoModal } from "../jde-data/jde-data-details/tabs/walkdown-pictures-tab/AddPhotoModal";

import {
  SCHEDULE_STATUS_OPTIONS,
  SCHEDULE_EQUIPMENT_STATUS,
  WALKDOWN_SCHEDULE_TABLE_COLUMNS,
} from "../../constants/walkdown-management";
import { USER_ROLE } from "../../constants/environment";
import { IMG_DELETE_ALLOWED_STATUSES } from "../../constants/jde-data";

export const WalkdownScheduleEquipmentTable = ({
  id,
  page,
  setPage,
  rows = [],
  setRows,
  rowsPerPage,
  setRowsPerPage,
  totalRows,
  editMode,
  setSelectedImageInfo,
  setSelectedImageId,
  setScheduleEquipmentId,
  setOpenInfo,
  setOpenConfirmModal,
  setOpenImageConfirmModal,
  isImagesLoading,
  pending,
  loading,
  imagesIdToBeDeleted,
  isUserActionEnabled,
  imageInfo,
  order,
  scheduleOwner,
}) => {
  const dispatch = useDispatch();
  const { accounts } = useMsal();
  const role = useSelector(selectUserRole);
  const [openAddPhotoModal, setOpenAddPhotoModal] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [selectedEquipmentForPhoto, setSelectedEquipmentForPhoto] =
    useState(null);

  const { uploadEquipmentImages, getImageLinksBeforeUpload } = useJdeData();
  const handleChangePage = (_event, newPage) => {
    const newPageValue = newPage + 1;
    setPage(newPageValue);
    sessionStorage.setItem(`walkdownSchedulePage_${id}`, newPageValue);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    localStorage.setItem("walkdownScheduleRowsPerPage", newRowsPerPage);
    sessionStorage.setItem(`walkdownSchedulePage_${id}`, 1);
  };

  const handleAllStatusChange = (_event, option) => {
    if (option) {
      const updated = rows.map((row) => ({
        ...row,
        equipmentWalkdownStatus: option.value,
      }));
      const updatedStatuses = getUpdatedSchedule(rows, updated);
      dispatch(setUpdatedScheduleEquipmentStatuses(updatedStatuses));
      setRows(updated);
    }
  };

  const handleScheduleEquipmentDelete = (id) => {
    setScheduleEquipmentId(id);
    setOpenConfirmModal(true);
  };

  const handleOpenInfo = (e, image, user) => {
    e.stopPropagation();
    setSelectedImageInfo({ image, user });
    setOpenInfo(true);
  };

  const handleImageDelete = (e, imageId) => {
    e.stopPropagation();
    setSelectedImageId(imageId);
    setOpenImageConfirmModal(true);
  };

  const handleEquipmentStatusChange = (_event, option, item) => {
    const updated = rows.map((row) =>
      row.equipmentWalkdownSchedulePk === item.equipmentWalkdownSchedulePk
        ? {
            ...row,
            equipmentWalkdownStatus: option.value,
          }
        : row
    );
    const updatedStatuses = getUpdatedSchedule(rows, updated);
    dispatch(setUpdatedScheduleEquipmentStatuses(updatedStatuses));
    setRows(updated);
  };

  const handleOpenAddPhotoModal = (equipment) => {
    setSelectedEquipmentForPhoto(equipment);
    setOpenAddPhotoModal(true);
  };

  const handleCloseAddPhotoModal = () => {
    setOpenAddPhotoModal(false);
    setSelectedEquipmentForPhoto(null);
  };

  const handleUploadImages = async (uploadData) => {
    if (!selectedEquipmentForPhoto?.assetNumber) {
      console.error("Asset number is required for image upload");
      return;
    }

    setUploadPending(true);
    try {
      const linkPromises = uploadData.files.map((file) => {
        return getImageLinksBeforeUpload(
          selectedEquipmentForPhoto.assetNumber,
          file
        );
      });
      const imageLinksResults = await Promise.all(linkPromises);
      const allImageLinks = imageLinksResults.filter(
        (result) => result !== null
      );
      if (allImageLinks.length > 0 && allImageLinks.every((link) => link)) {
        const { files, ...payload } = uploadData;
        payload.imageLinks = allImageLinks;

        await uploadEquipmentImages(
          selectedEquipmentForPhoto.assetNumber,
          payload
        );
        dispatch(setIsScheduledEquipmentsUpdated());
        handleCloseAddPhotoModal();
      } else {
        throw new Error("Failed to get image links");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadPending(false);
    }
  };

  const displayTableHeader = (col) => {
    if (col.id === "equipmentWalkdownStatus") {
      return editMode ? (
        <Autocomplete
          size="small"
          disablePortal
          options={SCHEDULE_STATUS_OPTIONS}
          renderInput={(params) => (
            <TextField {...params} label="Status for all" />
          )}
          onChange={handleAllStatusChange}
          disableClearable
          disabled={pending}
        />
      ) : (
        col.label
      );
    } else {
      return col.label;
    }
  };

  const displayTableCell = (col, row, index) => {
    const images = imageInfo?.[row.assetNumber]?.images?.filter(
      (image) => !imagesIdToBeDeleted?.includes(image.equipmentImagePk)
    );
    switch (col.id) {
      case "index":
        return <span className="text-black/[0.54]">{index}</span>;
      case "equipmentTag":
        return (
          <Link
            to={`/jde-data/${row.assetNumber}`}
            state={{ from: `/walkdown-management/${id}` }}
            className="no-underline text-blue-600 font-medium text-sm uppercase px-4 py-1.5 rounded inline-block transition-colors duration-250 ease-out hover:bg-blue-50"
            data-testid={`equipment-tag-link-${row.equipmentWalkdownSchedulePk}`}
          >
            {row.equipmentTag}
          </Link>
        );
      case "pictures":
        return isImagesLoading ? (
          <Image
            width={60}
            height={60}
            src={`https://placehold.co/60x60`}
            preview={false}
            placeholder={
              <Skeleton variant="rectangular" width={60} height={60} />
            }
          />
        ) : (
          <>
            {!images?.length && (
              <Image
                width={60}
                height={60}
                src={`https://placehold.co/60x60?text=No+Image`}
                preview={false}
              />
            )}
            <ImagesGalleryList
              width={60}
              height={60}
              images={images}
              renderMask={(image) => renderMask(image, row)}
            />
            {renderAddPhotoButton(row)}
          </>
        );
      case "equipmentWalkdownStatus":
        return editMode &&
          row.equipmentWalkdownStatus !==
            SCHEDULE_EQUIPMENT_STATUS.COMPLETED ? (
          <Autocomplete
            size="small"
            value={row.equipmentWalkdownStatus}
            disablePortal
            options={SCHEDULE_STATUS_OPTIONS}
            renderInput={(params) => <TextField {...params} label="Status" />}
            onChange={(event, option) =>
              handleEquipmentStatusChange(event, option, row)
            }
            disableClearable
            disabled={
              pending ||
              row.equipmentWalkdownStatus ===
                SCHEDULE_EQUIPMENT_STATUS.COMPLETED
            }
          />
        ) : (
          <StatusAlert
            value={row.equipmentWalkdownStatus}
            comment={row.comment}
            severity={getStatusSeverity(row.equipmentWalkdownStatus)}
          />
        );
      case "actions":
        return (
          <IconButton
            onClick={() =>
              handleScheduleEquipmentDelete(row.equipmentWalkdownSchedulePk)
            }
            disabled={pending}
            data-testid={`delete-btn-${row.equipmentWalkdownSchedulePk}`}
          >
            <DeleteIcon sx={{ fontSize: "20px", color: "#F44336" }} />
          </IconButton>
        );
      default:
        return row[col.id];
    }
  };

  const renderMask = (image, row) => {
    const equipmentStatus = row.equipmentStatus;
    const isImgDeleteAllowed =
      role === USER_ROLE.ADMIN ||
      (role === USER_ROLE.WALKDOWN_COORDINATOR &&
        IMG_DELETE_ALLOWED_STATUSES.includes(equipmentStatus));
    return (
      <div className="flex items-center">
        {editMode ? (
          <>
            {isImgDeleteAllowed && (
              <DisabledByDefaultIcon
                className="absolute top-0 right-0 text-red-600 p-0 rounded-sm w-5 h-5"
                onClick={(e) => handleImageDelete(e, image.equipmentImagePk)}
                data-testid={`delete-image-btn-${image.equipmentImagePk}`}
              />
            )}
            <HelpCenterIcon
              className="absolute bottom-0 right-0 text-yellow-500 p-0 rounded-sm w-5 h-5"
              onClick={(e) => handleOpenInfo(e, image, image.user)}
              data-testid={`more-info-btn-${image.equipmentImagePk}`}
            />
          </>
        ) : (
          <HelpCenterIcon
            className="absolute bottom-0 right-0 text-yellow-500 p-0 rounded-sm w-5 h-5"
            onClick={(e) => handleOpenInfo(e, image, image.user)}
            data-testid={`more-info-btn-${image.equipmentImagePk}`}
          />
        )}
      </div>
    );
  };

  const isAddPhotoBtnEnabled = (status) => {
    const canAddPhotoAsWalkdownCoordinator =
      role === USER_ROLE.WALKDOWN_COORDINATOR &&
      IMG_DELETE_ALLOWED_STATUSES.includes(status) &&
      scheduleOwner?.email;

    const canAddPhotoAsFieldEngineer =
      role === USER_ROLE.FIELD_ENGINEERS &&
      accounts[0].username?.toLowerCase() ===
        scheduleOwner?.email?.toLowerCase() &&
      IMG_DELETE_ALLOWED_STATUSES.includes(status);

    const canAddPhotoAsAdmin = role === USER_ROLE.ADMIN && scheduleOwner?.email;

    return (
      canAddPhotoAsWalkdownCoordinator ||
      canAddPhotoAsFieldEngineer ||
      canAddPhotoAsAdmin
    );
  };

  const renderAddPhotoButton = (equipment) => {
    const canAddPhoto = isAddPhotoBtnEnabled(equipment.equipmentStatus);
    if (!canAddPhoto) return null;
    return (
      <Button
        variant="outlined"
        onClick={() => handleOpenAddPhotoModal(equipment)}
        disabled={uploadPending || pending}
        startIcon={<AddPhotoAlternate />}
        data-testid={`add-photo-btn-${equipment.equipmentWalkdownSchedulePk}`}
        sx={{
          width: 60,
          height: 60,
          minWidth: 60,
          border: "2px dashed #ccc",
          borderRadius: 1,
          fontSize: "10px",
          padding: "4px",
          "&:hover": {
            border: "2px dashed #1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        Add
      </Button>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
      >
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
            data-testid="walkdown-schedule-equipment-table"
          >
            <TableHead>
              <TableRow>
                {WALKDOWN_SCHEDULE_TABLE_COLUMNS.map((col) =>
                  col.id === "actions" && !isUserActionEnabled
                    ? { ...col, isChecked: false }
                    : col
                )
                  .filter((col) => col.isChecked)
                  .map((col) => (
                    <TableCell
                      sx={{ maxWidth: col.width }}
                      width={col.width}
                      key={col.id}
                      align={col.align}
                      padding="normal"
                    >
                      {displayTableHeader(col)}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableLoader colSpan={WALKDOWN_SCHEDULE_TABLE_COLUMNS.length} />
            ) : (
              <>
                {!rows.length && (
                  <NoDataFoundInTable
                    colSpan={WALKDOWN_SCHEDULE_TABLE_COLUMNS.length}
                    label="No data found"
                  />
                )}
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <TableRow
                        tabIndex={-1}
                        key={row.equipmentWalkdownSchedulePk}
                        data-testid={`walkdown-schedule-equipment-row-${row.equipmentWalkdownSchedulePk}`}
                      >
                        {WALKDOWN_SCHEDULE_TABLE_COLUMNS.filter(
                          (col) => col.isChecked
                        ).map((col) =>
                          col.id === "actions" &&
                          !isUserActionEnabled ? null : (
                            <TableCell
                              key={col.id}
                              align={col.align}
                              width={col.width}
                              sx={{ maxWidth: col.width }}
                            >
                              <div
                                className={
                                  col.id === "pictures"
                                    ? "flex flex-wrap items-center gap-2"
                                    : ""
                                }
                              >
                                {displayTableCell(
                                  col,
                                  row,
                                  rowsPerPage === -1
                                    ? index + 1
                                    : order + index + 1 - rowsPerPage
                                )}
                              </div>
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, { label: "All", value: -1 }]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page - 1} // as by default 0 is first page
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
          data-testid="walkdown-schedule-equipment-pagination"
        />
      </Paper>
      <AddPhotoModal
        open={openAddPhotoModal}
        onClose={handleCloseAddPhotoModal}
        onUpload={handleUploadImages}
        loading={uploadPending}
        equipmentTag={selectedEquipmentForPhoto?.equipmentTag}
      />
    </Box>
  );
};
