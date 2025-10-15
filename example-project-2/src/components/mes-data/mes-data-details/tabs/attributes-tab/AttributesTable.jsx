import { useSelector } from "react-redux";
import {
  TableBody,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  Tooltip,
  TableHead,
  Button,
} from "@mui/material";

import DateRangeIcon from "@mui/icons-material/DateRange";

import {
  displayCellLabel,
  displayCriticalily,
  getFormattedDate,
  getStatusSeverity,
} from "../../../../../utils";
import { allowedUserActions } from "../../../../../store/slices/global/userSlice";
import {
  EQUIPMENT_CHARS_MAP,
  EQUIPMENT_GENERAL_CHAR_NAME,
  MANUFACTURER_STATUS,
  ONLY_JDE_EQUIPMENT_CHARS,
} from "../../../../../constants/mes-data";

import { StatusAlert } from "../../../../common/StatusAlert";
import { TableLoader } from "../../../../common/TableLoader";
import { NoDataFoundInTable } from "../../../../common/NoDataFoundInTable";
import { Comments } from "../../../../common/Comments";

export const AttributesTable = ({
  rows,
  loading,
  handleEditMode,
  editMode,
  manufacturerOptions,
  classesAndSubClasses,
  flag,
}) => {
  const allowedActions = useSelector(allowedUserActions);
  const isUserActionEnabled = allowedActions.all || allowedActions.mes;
  const isEditButtonEnabled = flag.isAttrEditEnabled;

  const displayClassValueWithDescription = (classValue) => {
    const matchedClass = classesAndSubClasses.find(
      (item) => item.class === classValue
    );
    if (matchedClass) {
      return `${matchedClass.class} - ${matchedClass.description}`;
    }
    return displayCellLabel(classValue);
  };

  const displaySubClassValueWithDescription = (subClassValue, attrType) => {
    const initialClass = rows.find(
      (row) => row.jdeAttrName === "JDE_CLASSIFICATION"
    );
    const matchedSubClass = classesAndSubClasses.find(
      (item) => item.class === initialClass[attrType]
    );
    if (matchedSubClass) {
      const initialSubClass =
        matchedSubClass.subClasses.length &&
        matchedSubClass.subClasses.find(
          (item) => item.subClass === subClassValue
        );
      if (initialSubClass) {
        return `${initialSubClass.subClass} - ${initialSubClass.description}`;
      }
    }
    return displayCellLabel(subClassValue);
  };

  const displayJDEValue = (row) => {
    const { jdeAttrName, jdeValue } = row;

    let manufacturerInfo;
    if (jdeAttrName === EQUIPMENT_GENERAL_CHAR_NAME.MANUFACTURER) {
      manufacturerInfo = manufacturerOptions.find(
        ({ value }) => value === jdeValue
      );
    }

    switch (jdeAttrName) {
      case EQUIPMENT_GENERAL_CHAR_NAME.ACQN_VALUE_DATE:
      case EQUIPMENT_GENERAL_CHAR_NAME.START_UP_DATE:
        return (
          <div className="flex items-center gap-2">
            <DateRangeIcon className="text-black/[0.54]" />
            <span className="text-sm leading-4 text-black/[0.87] font-roboto ">
              {displayCellLabel(getFormattedDate(jdeValue))}
            </span>
          </div>
        );
      case EQUIPMENT_GENERAL_CHAR_NAME.AC_RANKING:
      case EQUIPMENT_GENERAL_CHAR_NAME.EC_RANKING:
        return displayCriticalily(jdeValue);
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_CLASSIFICATION:
        return displayClassValueWithDescription(jdeValue);
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_SUBCLASSIFICATION:
        return displaySubClassValueWithDescription(jdeValue, "jdeValue");
      case EQUIPMENT_GENERAL_CHAR_NAME.MANUFACTURER:
        return displayCellLabel(manufacturerInfo?.label);
      default:
        return displayCellLabel(jdeValue);
    }
  };

  const displayMESValue = (row) => {
    const { jdeAttrName, walkdownValue } = row;

    let manufacturerInfo;
    if (jdeAttrName === EQUIPMENT_GENERAL_CHAR_NAME.MANUFACTURER) {
      manufacturerInfo = manufacturerOptions.find(
        ({ value }) => value === walkdownValue
      );
    }

    switch (jdeAttrName) {
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_CLASSIFICATION:
        return displayClassValueWithDescription(walkdownValue);
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_SUBCLASSIFICATION:
        return displaySubClassValueWithDescription(
          walkdownValue,
          "walkdownValue"
        );
      case EQUIPMENT_GENERAL_CHAR_NAME.MANUFACTURER:
        return displayCellLabel(manufacturerInfo?.label);
      default:
        return displayCellLabel(walkdownValue);
    }
  };

  const displayAtributeStatus = (row) => {
    if (ONLY_JDE_EQUIPMENT_CHARS.includes(row.jdeAttrName)) {
      return (
        <StatusAlert
          value={row.walkdownAttrStatusName}
          severity={getStatusSeverity(row.walkdownAttrStatusName)}
        />
      );
    }

    return (
      <StatusAlert
        value={row.walkdownAttrStatusName}
        severity={getStatusSeverity(row.walkdownAttrStatusName)}
      />
    );
  };

  return (
    <>
      {isUserActionEnabled && rows.length ? (
        <div className="flex items-center justify-between w-full px-4 pt-4">
          <div className="flex w-full items-center justify-end gap-4">
            {!editMode && !loading && isEditButtonEnabled && (
              <Button
                data-testid="edit-btn"
                color="primary"
                onClick={handleEditMode}
              >
                <span className="text-sm mr-2">Edit</span>
              </Button>
            )}
          </div>
        </div>
      ) : null}
      <TableContainer data-testid="attributes-table-container">
        <Table
          data-testid="attributes-table"
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="equipment overview view table"
        >
          {loading ? (
            <TableLoader width={840} />
          ) : (
            <>
              {!rows.length && !loading && (
                <NoDataFoundInTable label="No details" colSpan={5} />
              )}
              <TableHead data-testid="attributes-table-head">
                <TableRow>
                  <TableCell data-testid="header-cell-name"></TableCell>
                  <TableCell data-testid="header-cell-jde">
                    JDE E1 Original Value
                  </TableCell>
                  <TableCell data-testid="header-cell-mes">MES Value</TableCell>
                  <TableCell data-testid="header-cell-status">
                    Attribute status
                  </TableCell>
                  <TableCell data-testid="header-cell-comments">
                    Comments
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody data-testid="attributes-table-body">
                {rows.map((row) => (
                  <TableRow
                    data-testid={`attribute-row-${row.jdeAttrName}`}
                    key={row.jdeAttrCode}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      data-testid={`attribute-name-${row.jdeAttrName}`}
                      align="left"
                      width={200}
                      component="th"
                      scope="row"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm leading-4 text-black/[0.87] font-bold font-roboto">
                          {EQUIPMENT_CHARS_MAP[row.jdeAttrName]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="left" width={340}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm leading-4 text-black/[0.87] font-roboto ">
                          {displayJDEValue(row)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="left" width={340}>
                      <div className="flex flex-col">
                        <span className="text-sm leading-4 text-black/[0.87] font-roboto">
                          {displayMESValue(row)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="left" width={250}>
                      {displayAtributeStatus(row)}
                    </TableCell>
                    <TableCell align="left" width={250}>
                      <Comments row={row} editMode={editMode} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </>
  );
};
