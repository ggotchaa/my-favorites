import {
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";

export const TableLoader = ({ colSpan, width }) => {
  return (
    <TableBody data-testid="table-loader-body">
      <TableRow data-testid="table-loader-row">
        <TableCell
          colSpan={colSpan}
          sx={{ minWidth: width }}
          data-testid="table-loader-cell"
        >
          <div
            className="flex flex-col items-center justify-center gap-4 w-full min-h-[300px] select-none"
            data-testid="table-loader"
          >
            <CircularProgress />
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
