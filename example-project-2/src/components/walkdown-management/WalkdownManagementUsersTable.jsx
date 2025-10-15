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
  IconButton,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import { setIsWalkdownUsersListUpdated } from "../../store/slices/walkdown-management/walkdownUsersSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";

import { AddUser } from "../common/AddUser";
import { UpdateUser } from "../common/UpdateUser";
import { TableLoader } from "../common/TableLoader";
import { TransitionsModal } from "../common/Modal";
import { DeletionAgreement } from "../common/DeletionAgreement";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";

import { USERS_TABLE_COLUMNS } from "../../constants/walkdown-management";

export const WalkdownManagementUsersTable = ({
  openAddUserModal,
  closeAddUserModal,
  rows = [],
  loading,
  isUserActionEnabled,
}) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const savedRowsPerPage = localStorage.getItem("wmUsersRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 25
  );
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openUserEditModal, setOpenUserEditModal] = useState(false);

  const { deleteWalkdownUser } = useWalkdownManagement();

  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    localStorage.setItem("wmUsersRowsPerPage", newRowsPerPage);
  };

  const visibleRows = useMemo(
    () =>
      rows
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .sort((a, b) => a.userPk - b.userPk),
    [page, rows, rowsPerPage]
  );

  const handleUserEdit = (row) => {
    setUser(row);
    setOpenUserEditModal(true);
  };

  const closeUserEditModal = () => {
    setOpenUserEditModal(false);
  };

  const handleUserDelete = (row) => {
    setUser(row);
    setOpenConfirmModal(true);
  };

  const displayTableCell = (col, row) => {
    switch (col.id) {
      case "userPk":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            <span className="text-black/[.54]">{row[col.id]}</span>
          </TableCell>
        );
      case "isAdmin":
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            {row.isAdmin ? (
              <CheckIcon color="success" />
            ) : (
              <CloseIcon color="error" />
            )}
          </TableCell>
        );
      case "actions":
        if (isUserActionEnabled) {
          return (
            <TableCell key={col.id} width={col.width} align={col.align}>
              <div className="flex items-center gap-8">
                <Button
                  data-testid={`edit-btn-${row.userPk}`}
                  onClick={() => handleUserEdit(row)}
                >
                  Edit
                </Button>
                <IconButton
                  data-testid={`delete-btn-${row.userPk}`}
                  onClick={() => handleUserDelete(row)}
                >
                  <DeleteIcon sx={{ fontSize: "20px", color: "#F44336" }} />
                </IconButton>
              </div>
            </TableCell>
          );
        } else {
          return null;
        }
      default:
        return (
          <TableCell key={col.id} width={col.width} align={col.align}>
            {row[col.id]}
          </TableCell>
        );
    }
  };

  const closeConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const agreeConfirmModal = () => {
    setIsDeleting(true);
    deleteWalkdownUser(user.userPk)
      .then((response) => {
        if (response) {
          setOpenConfirmModal(false);
          setIsDeleting(false);
          dispatch(setIsWalkdownUsersListUpdated());
          if (rows.length > 1 && rows.length - rowsPerPage === 1) {
            setPage(page - 1);
          }
          setUser(null);
        }
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
      >
        <TableContainer sx={{ minHeight: 400 }}>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
            data-testid="walkdown-users-table"
          >
            <TableHead>
              <TableRow>
                {USERS_TABLE_COLUMNS.map((col) =>
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
                      {col.label}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableLoader colSpan={USERS_TABLE_COLUMNS.length} />
            ) : (
              <>
                {!visibleRows.length && (
                  <NoDataFoundInTable
                    label="No users found"
                    colSpan={USERS_TABLE_COLUMNS.length}
                  />
                )}
                <TableBody>
                  {visibleRows.map((row) => {
                    return (
                      <TableRow
                        tabIndex={-1}
                        key={row.userPk}
                        data-testid={`walkdown-user-row-${row.userPk}`}
                      >
                        {USERS_TABLE_COLUMNS.filter((col) => col.isChecked).map(
                          (col) => displayTableCell(col, row)
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
          data-testid="walkdown-users-table-pagination"
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </Paper>
      <TransitionsModal
        open={openConfirmModal}
        handleClose={closeConfirmModal}
        data-testid="delete-user-modal"
      >
        <DeletionAgreement
          title="Delete user?"
          subtitle="You will not be able to restore it later."
          onCancel={closeConfirmModal}
          onConfirm={agreeConfirmModal}
          loading={isDeleting}
        />
      </TransitionsModal>
      <TransitionsModal
        open={openAddUserModal}
        handleClose={closeAddUserModal}
        data-testid="add-user-modal"
      >
        <AddUser closeAddUserModal={closeAddUserModal} />
      </TransitionsModal>
      <TransitionsModal
        open={openUserEditModal}
        handleClose={closeUserEditModal}
        data-testid="edit-user-modal"
      >
        <UpdateUser
          user={user}
          setUser={setUser}
          closeUserEditModal={closeUserEditModal}
        />
      </TransitionsModal>
    </Box>
  );
};
