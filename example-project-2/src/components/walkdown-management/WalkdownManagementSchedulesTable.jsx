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

import { setIsSchedulesListUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";
import { getFormattedDate } from "../../utils";

import { TableLoader } from "../common/TableLoader";
import { TransitionsModal } from "../common/Modal";
import { DeletionAgreement } from "../common/DeletionAgreement";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";
import { AddNewWalkdownSchedule } from "./AddNewWalkdownSchedule";

import { SCHEDULES_TABLE_COLUMNS } from "../../constants/walkdown-management";

export const WalkdownManagementSchedulesTable = ({
  openNewScheduleModal,
  closeNewScheduleModal,
  rows = [],
  loading,
  walkdownUsers,
  isUserActionEnabled,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const savedRowsPerPage = localStorage.getItem("wmSchedulesRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 25
  );
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [scheduleId, setScheduleId] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteWalkdownSchedule } = useWalkdownManagement();

  const handleClick = (row) => {
    localStorage.setItem("assignWalkdownTagPayload", JSON.stringify(row));
    navigate("/walkdown-management/" + row.walkdownScheduleMasterPk);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(rowsPerPage);
    setPage(0);
    localStorage.setItem("wmSchedulesRowsPerPage", rowsPerPage);
  };

  const visibleRows = useMemo(
    () =>
      rows
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .sort(
          (a, b) => a.walkdownScheduleMasterPk - b.walkdownScheduleMasterPk
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
    deleteWalkdownSchedule(scheduleId)
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
      case "walkdownScheduleMasterPk":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <span
              className="text-black/[.54]"
              data-testid={`schedule-id-${row[col.id]}`}
            >
              {row[col.id]}
            </span>
          </TableCell>
        );
      case "actions":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <div className="flex items-center gap-8">
              <Button
                data-testid={`manage-tags-${row.walkdownScheduleMasterPk}`}
                onClick={() => handleClick(row)}
              >
                Manage Tags
              </Button>
              {isUserActionEnabled && (
                <IconButton
                  onClick={() =>
                    handleDeleteSchedule(row.walkdownScheduleMasterPk)
                  }
                  data-testid={`delete-btn-${row.walkdownScheduleMasterPk}`}
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
      case "numberOfTagsByStatus":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <p className="font-medium">
              Total: {row.numberOfTagsByStatus?.total}
            </p>
            <p>Planned: {row.numberOfTagsByStatus?.planned}</p>
            <p>Submitted: {row.numberOfTagsByStatus?.submitted}</p>
            <p>Postponed: {row.numberOfTagsByStatus?.postponed}</p>
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
    <Box
      sx={{ width: "100%" }}
      data-testid="walkdown-schedules-table-container"
    >
      <Paper
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
        data-testid="walkdown-schedules-paper"
      >
        <TableContainer sx={{ minHeight: 400 }}>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
            data-testid="walkdown-schedules-table"
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
                <TableBody>
                  {visibleRows.map((row) => {
                    return (
                      <TableRow
                        tabIndex={-1}
                        key={row.walkdownScheduleMasterPk}
                        data-testid={`schedule-row-${row.walkdownScheduleMasterPk}`}
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
          data-testid="walkdown-schedules-pagination"
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
        <AddNewWalkdownSchedule
          closeNewScheduleModal={closeNewScheduleModal}
          openNewScheduleModal={openNewScheduleModal}
          walkdownUsers={walkdownUsers}
        />
      </TransitionsModal>
    </Box>
  );
};
