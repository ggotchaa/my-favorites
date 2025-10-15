import React, { memo } from "react";
import { TableRow, TableCell } from "@mui/material";
import { TagCommentField } from "./TagCommentField";
import { NEW_TAG_OPTIONAL_FIELDS } from "../../constants/enrichment-management";

export const NewTagDetailsRow = memo(
  ({ field, label, comment, renderEditableValue, onCommentChange }) => {
    const showComment = field.name !== "ASSET_NUMBER";
    const isRequired = !NEW_TAG_OPTIONAL_FIELDS.includes(field.name);

    return (
      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        <TableCell align="left" width={150} component="th" scope="row">
          <div className="flex flex-col">
            <span
              className="text-sm leading-4 text-black/[0.87] font-bold font-roboto"
              data-testid={`label-${field.name}`}
            >
              {label}
              {isRequired && (
                <span style={{ color: "red", marginLeft: "2px" }}>*</span>
              )}
            </span>
          </div>
        </TableCell>
        <TableCell align="left" width={400}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className="text-sm leading-4 text-black/[0.87] font-roboto"
                data-testid={`value-${field.name}`}
              >
                {renderEditableValue(field)}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell
          align="left"
          width={450}
          data-testid={`comment-${field.name}`}
        >
          {showComment && (
            <TagCommentField
              name={field.name}
              initialComment={comment}
              onCommentChange={onCommentChange}
            />
          )}
        </TableCell>
      </TableRow>
    );
  }
);

NewTagDetailsRow.displayName = "NewTagDetailsRow";
