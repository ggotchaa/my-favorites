import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { CircularProgress, ListItemIcon, ListItemText } from "@mui/material";

export const DownloadMenu = ({
  isExcelLoading,
  isCSVLoading,
  label,
  downloadExcel,
  downloadCSV,
  isDisabled,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadExcel = () => {
    downloadExcel();
    handleClose();
  };

  const handleDownloadCSV = () => {
    downloadCSV();
    handleClose();
  };

  return (
    <>
      <Button
        startIcon={
          isExcelLoading || isCSVLoading ? (
            <CircularProgress size={14} />
          ) : (
            <DownloadIcon />
          )
        }
        onClick={handleClick}
        disabled={isDisabled}
        data-testid="download-button"
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        data-testid="download-menu"
      >
        {downloadExcel && (
          <MenuItem onClick={handleDownloadExcel} data-testid="download-excel">
            <ListItemIcon>
              <InsertDriveFileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Excel File</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDownloadCSV} data-testid="download-csv">
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>CSV File</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
