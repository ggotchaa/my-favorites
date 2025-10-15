import { TableBody, TableCell, TableRow } from "@mui/material";

import noTagsFound from "../../assets/no-tags-found.svg";

export const NoDataFoundInTable = ({ label, colSpan }) => {
  return (
    <TableBody data-testid="no-data-found-in-table">
      <TableRow data-testid="no-data-found-in-table-row">
        <TableCell colSpan={colSpan} data-testid="no-data-found-in-table-cell">
          <div
            className="flex flex-col items-center justify-center gap-4 w-full min-h-[300px] select-none"
            data-testid="no-data-found-in-table-content"
          >
            <img
              src={noTagsFound}
              alt="not found"
              width={100}
              data-testid="no-data-found-in-table-image"
            />
            <span
              className="font-fira text-black/[0.54]"
              data-testid="no-data-found-in-table-label"
            >
              {label}
            </span>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
