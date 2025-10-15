import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

import { setIsSchedulesListUpdated } from "../../store/slices/enrichment-management/schedulesSlice";
import { useEnrichmentManagement } from "../../hooks/useEnrichmentManagement";
import { getFormattedDate } from "../../utils";

import { TableLoader } from "../common/TableLoader";
import { TransitionsModal } from "../common/Modal";
import { DeletionAgreement } from "../common/DeletionAgreement";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";

import { SCHEDULES_TABLE_COLUMNS } from "../../constants/enrichment-management";
import { AddNewEnrichmentSchedule } from "./AddNewEnrichmentSchedule";

export const EnrichmentManagementSchedulesTable = ({
  openNewScheduleModal,
  closeNewScheduleModal,
  rows = [],
  loading,
  isUserActionEnabled,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const savedRowsPerPage = localStorage.getItem("emSchedulesRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 25
  );
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [scheduleId, setScheduleId] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteEnrichmentSchedule } = useEnrichmentManagement();

  const handleClick = (row) => {
    localStorage.setItem("assignEnrichmentTagPayload", JSON.stringify(row));
    navigate("/enrichment-management/" + row.enrichmentScheduleMasterPk);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(rowsPerPage);
    setPage(0);
    localStorage.setItem("emSchedulesRowsPerPage", rowsPerPage);
  };

  const visibleRows = useMemo(
    () =>
      rows
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .sort(
          (a, b) => a.enrichmentScheduleMasterPk - b.enrichmentScheduleMasterPk
        ),
    [page, rows, rowsPerPage]
  );

  const displayUser = ({ user }) => {
    const { firstName = "", lastName = "" } = user;
    return `${firstName} ${lastName}`;
  };

  const closeConfirmModal = (_event, reason) => {
    if (reason === "backdropClick" && isDeleting) return;
    setOpenConfirmModal(false);
  };

  const agreeConfirmModal = () => {
    setIsDeleting(true);
    deleteEnrichmentSchedule(scheduleId)
      .then((response) => {
        if (response) {
          setOpenConfirmModal(false);
          setIsDeleting(false);
          dispatch(setIsSchedulesListUpdated());
          if (rows.length > 1 && rows.length - rowsPerPage === 1) {
            setPage(page - 1);
          }
          setScheduleId(null);
        }
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const handleDeleteSchedule = (scheduleId) => {
    setScheduleId(scheduleId);
    setOpenConfirmModal(true);
  };

  const displayTableCell = (col, row) => {
    switch (col.id) {
      case "enrichmentScheduleMasterPk":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <span className="text-black/[.54]">{row[col.id]}</span>
          </TableCell>
        );
      case "actions":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <div className="flex items-center gap-8">
              <Button
                data-testid={`manage-tags-${row.enrichmentScheduleMasterPk}`}
                onClick={() => handleClick(row)}
              >
                Manage Tags
              </Button>
              {isUserActionEnabled && (
                <IconButton
                  onClick={() =>
                    handleDeleteSchedule(row.enrichmentScheduleMasterPk)
                  }
                  data-testid={`delete-btn-${row.enrichmentScheduleMasterPk}`}
                >
                  <DeleteIcon sx={{ fontSize: "20px", color: "#F44336" }} />
                </IconButton>
              )}
            </div>
          </TableCell>
        );
      case "user":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            {displayUser(row)}
          </TableCell>
        );
      case "plannedStartDate":
      case "plannedCompletionDate":
      case "scheduleModifiedDate":
      case "actualStartDate":
      case "actualCompletionDate":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            {getFormattedDate(row[col.id])}
          </TableCell>
        );
      case "numberOfTags":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <span className="font-medium">{row[col.id]}</span>
          </TableCell>
        );
      default:
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            {row[col.id]}
          </TableCell>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
      >
        <TableContainer sx={{ minHeight: 400 }} data-testid="schedules-table">
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <TableHead>
              <TableRow>
                {SCHEDULES_TABLE_COLUMNS.filter((col) => col.isChecked).map(
                  (col) => (
                    <TableCell
                      sx={{ maxWidth: col.width }}
                      width={col.width}
                      key={col.id}
                      align={col.align}
                      padding="normal"
                    >
                      {col.label}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableLoader colSpan={SCHEDULES_TABLE_COLUMNS.length} />
            ) : (
              <>
                {!visibleRows.length && (
                  <NoDataFoundInTable
                    label="No schedules found"
                    colSpan={SCHEDULES_TABLE_COLUMNS.length}
                  />
                )}
                <TableBody data-testid="schedules-table-body">
                  {visibleRows.map((row) => {
                    return (
                      <TableRow
                        tabIndex={-1}
                        key={row.enrichmentScheduleMasterPk}
                      >
                        {SCHEDULES_TABLE_COLUMNS.filter(
                          (col) => col.isChecked
                        ).map((col) => displayTableCell(col, row))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
          data-testid="schedules-pagination"
        />
      </Paper>
      <TransitionsModal open={openConfirmModal} handleClose={closeConfirmModal}>
        <DeletionAgreement
          title="Delete schedule?"
          subtitle="You will not be able to restore it later."
          onCancel={closeConfirmModal}
          onConfirm={agreeConfirmModal}
          loading={isDeleting}
        />
      </TransitionsModal>
      <TransitionsModal
        open={openNewScheduleModal}
        handleClose={closeNewScheduleModal}
      >
        <AddNewEnrichmentSchedule
          closeNewScheduleModal={closeNewScheduleModal}
          openNewScheduleModal={openNewScheduleModal}
        />
      </TransitionsModal>
    </Box>
  );
};
