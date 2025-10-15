import { useDispatch } from "react-redux";

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
import { useNavigate, Link } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";

import { setUpdatedScheduleEquipmentStatuses } from "../../store/slices/enrichment-management/schedulesSlice";
import { getStatusSeverity, getUpdatedSchedule } from "../../utils";

import { StatusAlert } from "../common/StatusAlert";
import { TableLoader } from "../common/TableLoader";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";
import { ImagesGalleryList } from "../common/ImagesGalleryList";

import {
  SCHEDULE_STATUS_OPTIONS,
  SCHEDULE_EQUIPMENT_STATUS,
  ENRICHMENT_SCHEDULE_TABLE_COLUMNS,
} from "../../constants/enrichment-management";

export const EnrichmentScheduleEquipmentTable = ({
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
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChangePage = (_event, newPage) => {
    const newPageValue = newPage + 1;
    setPage(newPageValue);
    sessionStorage.setItem(`enrichmentSchedulePage_${id}`, newPageValue);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    localStorage.setItem("enrichmentScheduleRowsPerPage", newRowsPerPage);
    sessionStorage.setItem(`enrichmentSchedulePage_${id}`, 1);
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
      row.enrichmentSchedulePk === item.enrichmentSchedulePk
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

  const displayTableHeader = (col) => {
    if (col.id === "equipmentWalkdownStatus") {
      return editMode ? (
        <Autocomplete
          size="small"
          disablePortal
          options={SCHEDULE_STATUS_OPTIONS}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Status for all"
              data-testid="status-for-all"
            />
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
    const images = imageInfo?.[row.equipmentTag]?.images?.filter(
      (image) => !imagesIdToBeDeleted?.includes(image.equipmentImagePk)
    );
    switch (col.id) {
      case "index":
        return (
          <span className="text-black/[0.54]" data-testid={`index-${index}`}>
            {index}
          </span>
        );
      case "equipmentTag":
        return (
          <Link
            data-testid={`equipment-tag-${row.equipmentTag}`}
            to={`/jde-data/${row.assetNumberPhk}`}
            state={{ from: `/enrichment-management/${id}` }}
            className="no-underline text-blue-600 font-medium text-sm uppercase px-4 py-1.5 rounded inline-block transition-colors duration-250 ease-out hover:bg-blue-50"
          >
            {row.equipmentTag}
          </Link>
        );
      case "pictures":
        return isImagesLoading ? (
          <Image
            data-testid={`skeleton-image-${row.equipmentTag}`}
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
                data-testid={`no-image-${row.equipmentTag}`}
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
              renderMask={(images) =>
                renderMask(images, imageInfo?.[row.equipmentTag]?.user)
              }
            />
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
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                data-testid={`status-${row.equipmentTag}`}
              />
            )}
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
              handleScheduleEquipmentDelete(row.enrichmentSchedulePk)
            }
            disabled={pending}
            data-testid={`delete-btn-${row.enrichmentSchedulePk}`}
          >
            <DeleteIcon sx={{ fontSize: "20px", color: "#F44336" }} />
          </IconButton>
        );
      default:
        return row[col.id];
    }
  };

  const renderMask = (image, user) => {
    return (
      <div className="flex items-center">
        {editMode ? (
          <>
            <DisabledByDefaultIcon
              className="absolute top-0 right-0 text-red-600 p-0 rounded-sm w-5 h-5"
              onClick={(e) => handleImageDelete(e, image.equipmentImagePk)}
              data-testid={`delete-image-btn-${image.equipmentImagePk}`}
            />
            <HelpCenterIcon
              className="absolute bottom-0 right-0 text-yellow-500 p-0 rounded-sm w-5 h-5"
              onClick={(e) => handleOpenInfo(e, image, user)}
              data-testid={`more-info-btn-${image.equipmentImagePk}`}
            />
          </>
        ) : (
          <HelpCenterIcon
            className="absolute bottom-0 right-0 text-yellow-500 p-0 rounded-sm w-5 h-5"
            onClick={(e) => handleOpenInfo(e, image, user)}
            data-testid={`more-info-btn-${image.equipmentImagePk}`}
          />
        )}
      </div>
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
          >
            <TableHead>
              <TableRow>
                {ENRICHMENT_SCHEDULE_TABLE_COLUMNS.map((col) =>
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
              <TableLoader colSpan={ENRICHMENT_SCHEDULE_TABLE_COLUMNS.length} />
            ) : (
              <>
                {!rows.length && (
                  <NoDataFoundInTable
                    colSpan={ENRICHMENT_SCHEDULE_TABLE_COLUMNS.length}
                    label="No data found"
                  />
                )}
                <TableBody data-testid="enrichment-schedule-equipment-table-body">
                  {rows.map((row, index) => {
                    return (
                      <TableRow tabIndex={-1} key={row.enrichmentSchedulePk}>
                        {ENRICHMENT_SCHEDULE_TABLE_COLUMNS.filter(
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
          data-testid="enrichment-schedule-equipment-table-pagination"
        />
      </Paper>
    </Box>
  );
};
