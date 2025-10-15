import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  TableBody,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";

import DateRangeIcon from "@mui/icons-material/DateRange";

import {
  displayCellLabel,
  displayCriticalily,
  getFormattedDate,
  getStatusSeverity,
  getUpdatedCharsState,
  getUpdatedCommentsState,
} from "../../../../../utils";
import {
  EQUIPMENT_CHARS_MAP,
  EQUIPMENT_GENERAL_CHAR_NAME,
  ONLY_JDE_EQUIPMENT_CHARS,
  ATTRIBUTES_OPTIONAL_FIELDS,
} from "../../../../../constants/jde-data";

import { VirtualizedAutocomplete } from "../../../../common/VirtualizedAutocomplete";

import { StatusAlert } from "../../../../common/StatusAlert";
import { Comments } from "../../../../common/Comments";
import { useState } from "react";
import { useJdeData } from "../../../../../hooks/useJdeDataHook";
import { useEnrichmentManagement } from "../../../../../hooks/useEnrichmentManagement";
import { setIsCharacteristicsUpdated } from "../../../../../store/slices/jde-data/characteristicsSlice";
import {
  getUserPolicyId,
  selectUserRole,
} from "../../../../../store/slices/global/userSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { validateTag } from "../../../../../utils/tagValidation";
import { USER_ROLE } from "../../../../../constants/environment";

export const AttributesEditTable = ({
  rows,
  manufacturerOptions,
  attributeStatuses,
  handleCancel,
  editMode,
  setEditMode,
  loading,
  classesAndSubClasses,
  flag,
  isNewTag,
}) => {
  const location = useLocation();
  const { id } = useParams();
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState(rows);
  const initialEquipmentTag = rows.find(
    (row) => row.jdeAttrName === "EQUIPMENT_TAG"
  );
  const equipmentTagRow = state.find(
    (row) => row.jdeAttrName === "EQUIPMENT_TAG"
  );
  const [isPending, setIsPending] = useState(false);
  const [selectedClass, setSelectedClass] = useState([]);
  const userId = useSelector(getUserPolicyId);
  const [errors, setErrors] = useState({});
  const [descriptionErrors, setDescriptionErrors] = useState({});

  const { validateNewEquipmentTag } = useEnrichmentManagement();

  const [commentsState, setCommentsState] = useState(
    rows.map(
      (row) => row.comments.find((comment) => comment.current)?.comment || ""
    )
  );

  const handleCommentChange = (rowIndex, newComment) => {
    const updatedCommentsState = [...commentsState];
    updatedCommentsState[rowIndex] = newComment;
    setCommentsState(updatedCommentsState);
  };

  const {
    updateWalkdownEquipmentTagCharacteristics,
    addNewEquipTagWalkdownCharComment,
  } = useJdeData();

  useEffect(() => {
    const initialClassRow = rows.find(
      (row) => row.jdeAttrName === "JDE_CLASSIFICATION"
    );
    if (initialClassRow?.walkdownValue) {
      const matchingClass = classesAndSubClasses.filter(
        (item) => item.class === initialClassRow.walkdownValue
      );
      setSelectedClass(matchingClass);
    }
  }, [rows, classesAndSubClasses]);

  const displayClassValueWithDescription = (classValue) => {
    const matchedClass = classesAndSubClasses.find(
      (item) => item.class === classValue
    );
    if (matchedClass) {
      return `${matchedClass.class} - ${matchedClass.description}`;
    }
    return classValue;
  };

  const displayManufacturerValueWithDescription = (value) => {
    const matchedManufacturer = manufacturerOptions.find(
      (item) => item.value === value
    );
    if (matchedManufacturer) {
      return matchedManufacturer.label;
    }
    return value;
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
    return subClassValue;
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
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm leading-4 text-black/[0.87] font-roboto ">
              {displayCellLabel(jdeValue)}
            </span>
          </div>
        );
    }
  };

  const displayMESValue = (row) => {
    const { jdeAttrName, walkdownValue } = row;

    switch (jdeAttrName) {
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_CLASSIFICATION:
        return displayClassValueWithDescription(walkdownValue);
      case EQUIPMENT_GENERAL_CHAR_NAME.JDE_SUBCLASSIFICATION:
        return displaySubClassValueWithDescription(
          walkdownValue,
          "walkdownValue"
        );
      case EQUIPMENT_GENERAL_CHAR_NAME.MANUFACTURER:
        return displayManufacturerValueWithDescription(walkdownValue);
      default:
        return displayCellLabel(walkdownValue);
    }
  };

  const handleRowStatusChange = (_event, option, jdeAttrName) => {
    if (option) {
      const newState = state.map((item) =>
        item.walkdownAttrStatusName !== option.label &&
        item.jdeAttrName === jdeAttrName
          ? {
              ...item,
              walkdownAttrStatusCode: option.value,
              walkdownAttrStatusName: option.label,
            }
          : item
      );
      setState(newState);
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
      <>
        {editMode && flag.isEditAttrStatusEnabled ? (
          <Autocomplete
            size="small"
            value={row.walkdownAttrStatusName}
            disablePortal
            options={attributeStatuses}
            renderInput={(params) => <TextField size="small" {...params} />}
            onChange={(event, option) =>
              handleRowStatusChange(event, option, row.jdeAttrName)
            }
            disabled={isPending || loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
          />
        ) : (
          <StatusAlert
            value={row.walkdownAttrStatusName}
            severity={getStatusSeverity(row.walkdownAttrStatusName)}
          />
        )}
      </>
    );
  };

  const validateFields = () => {
    const newErrors = { ...errors };
    let hasValidationErrors = false;

    state.forEach((row) => {
      const isDescriptionField =
        row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
        row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_EN";

      const isFieldEditable =
        !ONLY_JDE_EQUIPMENT_CHARS.includes(row.jdeAttrName) &&
        flag.isEditAttrValueEnabled;

      if (!isFieldEditable) {
        return;
      }

      if (!newErrors[row.jdeAttrName]) {
        if (
          !ATTRIBUTES_OPTIONAL_FIELDS.includes(row.jdeAttrName) ||
          isDescriptionField
        ) {
          if (!row.walkdownValue || !row.walkdownValue.toString().trim()) {
            newErrors[row.jdeAttrName] = "This field is required";
            hasValidationErrors = true;
          }
        }

        if (
          isDescriptionField &&
          row.walkdownValue &&
          row.walkdownValue.length > 30
        ) {
          newErrors[row.jdeAttrName] = "Maximum 30 characters allowed";
          hasValidationErrors = true;
        }
      } else {
        hasValidationErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasValidationErrors;
  };

  const isRequiredField = (jdeAttrName) => {
    const isDescriptionField =
      jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
      jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_EN";

    return (
      !ATTRIBUTES_OPTIONAL_FIELDS.includes(jdeAttrName) || isDescriptionField
    );
  };

  const handleSave = async () => {
    if (flag.isEditAttrValueEnabled && !validateFields()) {
      toast.info("Please fill required fields");
      return;
    }

    setIsPending(true);
    const skipDescriptionValidation =
      userRole === USER_ROLE.ENRICHMENT_COORDINATOR ||
      userRole === USER_ROLE.SME;

    if (!skipDescriptionValidation) {
      const descriptionFields = state.filter(
        (row) =>
          (row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
            row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_EN") &&
          row.walkdownValue
      );

      let hasValidationErrors = false;
      const newDescriptionErrors = {};

      descriptionFields.forEach((field) => {
        if (field.walkdownValue.length > 30) {
          hasValidationErrors = true;
          newDescriptionErrors[field.jdeAttrName] =
            "Maximum 30 characters allowed";
        }
      });

      if (hasValidationErrors) {
        setDescriptionErrors(newDescriptionErrors);
        toast.error("Description fields cannot exceed 30 characters");
        setIsPending(false);
        return;
      }
    }

    if (flag.isEditAttrValueEnabled) {
      const parentTagRow = state.find(
        (row) => row.jdeAttrName === "PARENT_EQUIPMENT_TAG"
      );

      if (equipmentTagRow?.walkdownValue) {
        const isEquipmentTagValid = await validateTag({
          tagNumber: equipmentTagRow.walkdownValue,
          validateNewEquipmentTag,
          setErrors,
          fieldName: "EQUIPMENT_TAG",
          skipValidation:
            equipmentTagRow.walkdownValue === initialEquipmentTag.jdeValue ||
            equipmentTagRow.walkdownValue === initialEquipmentTag.walkdownValue,
        });
        if (!isEquipmentTagValid) {
          setIsPending(false);
          return;
        }
      }

      if (parentTagRow?.walkdownValue) {
        const isParentTagValid = await validateTag({
          tagNumber: parentTagRow.walkdownValue,
          validateNewEquipmentTag,
          setErrors,
          fieldName: "PARENT_EQUIPMENT_TAG",
        });
        if (!isParentTagValid) {
          setIsPending(false);
          return;
        }
      }

      const classRow = state.find(
        (row) => row.jdeAttrName === "JDE_CLASSIFICATION"
      );
      const subclassRow = state.find(
        (row) => row.jdeAttrName === "JDE_SUBCLASSIFICATION"
      );

      if (classRow?.walkdownValue && !subclassRow?.walkdownValue) {
        toast.error("Sub-class is required when Class is selected");
        setIsPending(false);
        return;
      }
    }

    const updatedAttr = getUpdatedCharsState(
      id,
      rows,
      state,
      attributeStatuses
    );
    const updatedComments = getUpdatedCommentsState(commentsState, state);

    const statusOnlyChanges = updatedComments
      .map((commentsUpdate) => {
        const { commentHistoryPhk, commentHistoryBk } = commentsUpdate;

        const row = state.find((r) => r.jdeAttrCode === commentHistoryPhk);
        const initialRow = rows.find(
          (r) => r.jdeAttrCode === commentHistoryPhk
        );

        if (!row || !initialRow) return null;

        const initialStatus = initialRow.walkdownAttrStatusName;
        const updatedStatus = row.walkdownAttrStatusName;

        const commentUpdate = updatedComments.find(
          (c) => c.commentHistoryPhk === commentHistoryPhk
        );
        const newComment = commentUpdate ? commentUpdate.comment : "";

        let commentMessage = "";
        if (initialStatus !== updatedStatus) {
          if (newComment.trim().length) {
            commentMessage = `Changed status from ${initialStatus} to ${updatedStatus} by leaving a comment: ${newComment}`;
          } else {
            commentMessage = `Changed status from ${initialStatus} to ${updatedStatus}`;
          }
        } else if (newComment) {
          commentMessage = newComment;
        }
        return commentMessage.trim().length
          ? {
              commentHistoryPhk: commentHistoryPhk,
              commentHistoryBk: commentHistoryBk,
              comment: commentMessage,
            }
          : null;
      })
      .filter(Boolean);

    if (!updatedAttr.length && !statusOnlyChanges.length) {
      setEditMode(false);
      return;
    }
    const requests = [];
    if (updatedAttr.length > 0) {
      requests.push(updateWalkdownEquipmentTagCharacteristics(updatedAttr, id));
    }
    if (statusOnlyChanges.length > 0) {
      requests.push(addNewEquipTagWalkdownCharComment(statusOnlyChanges, id));
    }
    setIsPending(updatedAttr.length > 0 || statusOnlyChanges.length > 0);
    Promise.all(requests)
      .then((responses) => {
        const data = responses.some((response) => response.status === 200);
        if (data) {
          dispatch(setIsCharacteristicsUpdated());
        }
      })
      .finally(() => {
        setIsPending(false);
        setEditMode(false);
      });
  };

  const handleSelectedOptionValueChange = (
    _event,
    option,
    characteristicName
  ) => {
    if (option) {
      // Clear existing errors when user makes a selection
      setErrors((prev) => ({ ...prev, [characteristicName]: "" }));

      const newState = state.map((item) =>
        item.jdeAttrName === characteristicName &&
        item.walkdownValue !== option.value
          ? { ...item, walkdownValue: option.value }
          : item
      );
      setState(newState);
    }
  };

  const handleJDEClassValueChange = (_event, option, characteristicName) => {
    setSelectedClass(
      classesAndSubClasses.filter((item) => item.class === option.value)
    );
    if (option) {
      // Clear existing errors when user makes a selection
      setErrors((prev) => ({ ...prev, [characteristicName]: "" }));

      const newState = state.map((item) => {
        if (item.jdeAttrName === "JDE_SUBCLASSIFICATION") {
          return { ...item, walkdownValue: "" };
        }
        if (
          item.jdeAttrName === characteristicName &&
          item.walkdownValue !== option.value
        ) {
          return { ...item, walkdownValue: option.value };
        }
        return item;
      });
      setState(newState);
    }
  };

  const handleMESValueChange = async (event, characteristicName) => {
    const value = event.target.value;

    // Clear existing errors when user starts typing
    setErrors((prev) => ({ ...prev, [characteristicName]: "" }));

    if (
      (characteristicName === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
        characteristicName === "EQUIPMENT_TAG_DESCRIPTION_EN") &&
      value.length > 30
    ) {
      setDescriptionErrors({
        ...descriptionErrors,
        [characteristicName]: "Maximum 30 characters allowed",
      });
    } else {
      setDescriptionErrors({
        ...descriptionErrors,
        [characteristicName]: "",
      });
    }
    const newState = state.map((item) =>
      item.jdeAttrName === characteristicName
        ? { ...item, walkdownValue: value }
        : item
    );
    setState(newState);
    if (
      characteristicName === "EQUIPMENT_TAG" ||
      characteristicName === "PARENT_EQUIPMENT_TAG"
    ) {
      await validateTag({
        tagNumber: value,
        validateNewEquipmentTag,
        setErrors,
        fieldName: characteristicName,
        skipValidation:
          characteristicName === "EQUIPMENT_TAG"
            ? value === initialEquipmentTag.jdeValue ||
              value === initialEquipmentTag.walkdownValue
            : null,
      });
    }
  };

  const renderEditableValue = (row) => {
    if (
      row.jdeAttrName === "EQUIPMENT_TAG" ||
      row.jdeAttrName === "PARENT_EQUIPMENT_TAG"
    ) {
      return (
        <TextField
          variant="outlined"
          size="small"
          defaultValue={row.walkdownValue}
          disabled={loading || isPending}
          onChange={(event) => handleMESValueChange(event, row.jdeAttrName)}
          error={!!errors[row.jdeAttrName]}
          helperText={errors[row.jdeAttrName]}
          required={isRequiredField(row.jdeAttrName)}
          FormHelperTextProps={{
            sx: {
              marginLeft: 0,
              fontSize: "10px",
            },
          }}
        />
      );
    } else if (
      row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
      row.jdeAttrName === "EQUIPMENT_TAG_DESCRIPTION_EN"
    ) {
      return (
        <TextField
          variant="outlined"
          size="small"
          defaultValue={row.walkdownValue}
          disabled={loading || isPending}
          onChange={(event) => handleMESValueChange(event, row.jdeAttrName)}
          error={
            !!descriptionErrors[row.jdeAttrName] || !!errors[row.jdeAttrName]
          }
          helperText={
            descriptionErrors[row.jdeAttrName] || errors[row.jdeAttrName]
          }
          required={isRequiredField(row.jdeAttrName)}
          FormHelperTextProps={{
            sx: {
              marginLeft: 0,
              fontSize: "10px",
            },
          }}
        />
      );
    } else if (row.jdeAttrName === "JDE_STATUS") {
      return (
        <Autocomplete
          size="small"
          value={row.walkdownValue}
          disablePortal
          options={[
            { value: "AV", label: "AV" },
            { value: "DN", label: "DN" },
          ]}
          renderInput={(params) => <TextField size="small" {...params} />}
          onChange={(event, option) =>
            handleSelectedOptionValueChange(event, option, row.jdeAttrName)
          }
          disabled={isPending || loading}
          disableClearable
        />
      );
    } else if (row.jdeAttrName === "JDE_CLASSIFICATION") {
      return (
        <Autocomplete
          size="small"
          value={displayMESValue(row)}
          disablePortal
          options={
            (classesAndSubClasses.length &&
              classesAndSubClasses.map((item) => ({
                value: item.class,
                label: `${item.class} - ${item.description}`,
              }))) ||
            []
          }
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              required={isRequiredField(row.jdeAttrName)}
              error={!!errors[row.jdeAttrName]}
              helperText={errors[row.jdeAttrName]}
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  fontSize: "10px",
                },
              }}
            />
          )}
          onChange={(event, option) =>
            handleJDEClassValueChange(event, option, row.jdeAttrName)
          }
          disabled={isPending || loading}
          disableClearable
        />
      );
    } else if (row.jdeAttrName === "JDE_SUBCLASSIFICATION") {
      const selectedValue =
        selectedClass.length &&
        selectedClass[0].subClasses.find(
          (item) => item.subClass === row.walkdownValue
        );

      return (
        <Autocomplete
          size="small"
          value={
            selectedValue
              ? `${selectedValue.subClass} - ${selectedValue.description}`
              : ""
          }
          disablePortal
          options={
            (selectedClass.length &&
              selectedClass[0].subClasses.map((item) => ({
                value: item.subClass,
                label: `${item.subClass} - ${item.description}`,
              }))) ||
            []
          }
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              required={isRequiredField(row.jdeAttrName)}
              error={!!errors[row.jdeAttrName]}
              helperText={errors[row.jdeAttrName]}
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  fontSize: "10px",
                },
              }}
            />
          )}
          onChange={(event, option) =>
            handleSelectedOptionValueChange(event, option, row.jdeAttrName)
          }
          disabled={isPending || loading}
          disableClearable
        />
      );
    } else if (row.jdeAttrName === "MANUFACTURER") {
      return (
        <VirtualizedAutocomplete
          filterId={id}
          size="small"
          disablePortal
          value={displayMESValue(row)}
          width={390}
          options={manufacturerOptions}
          label="Value"
          renderInput={(params) => <TextField {...params} />}
          loading={loading}
          loadingText={loading ? "Fetching data..." : ""}
          onChange={(event, option) =>
            handleSelectedOptionValueChange(event, option, row.jdeAttrName)
          }
          disabled={isPending || loading}
        />
      );
    } else {
      return (
        <TextField
          variant="outlined"
          size="small"
          defaultValue={row.walkdownValue}
          disabled={loading || isPending}
          onChange={(event) => handleMESValueChange(event, row.jdeAttrName)}
          required={isRequiredField(row.jdeAttrName)}
          error={!!errors[row.jdeAttrName]}
          helperText={errors[row.jdeAttrName]}
          FormHelperTextProps={{
            sx: {
              marginLeft: 0,
              fontSize: "10px",
            },
          }}
        />
      );
    }
  };

  return (
    <>
      <div
        data-testid="status-actions"
        className="flex items-center justify-end w-full px-4 pt-4"
      >
        <div className="flex items-center justify-end gap-4">
          {editMode && (
            <>
              <Button
                disabled={isPending || loading}
                variant="outlined"
                onClick={handleCancel}
                data-testid="cancel-btn"
              >
                <span className="text-sm">Cancel</span>
              </Button>
              <Button
                disabled={isPending || loading}
                variant="contained"
                onClick={handleSave}
                data-testid="save-btn"
              >
                {isPending || loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <span className="text-sm">Save</span>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      <TableContainer>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="equipment overview view table"
          data-testid="attributes-edit-table"
        >
          <>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>JDE E1 Original Value</TableCell>
                <TableCell>MES Value</TableCell>
                <TableCell>Attribute status</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="attributes-edit-table-body">
              {state.map((row, index) => (
                <TableRow
                  key={row.jdeAttrCode}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  data-testid={`attributes-edit-row-${row.jdeAttrName}`}
                >
                  <TableCell
                    align="left"
                    width={200}
                    component="th"
                    scope="row"
                    data-testid={`char-name-${row.jdeAttrName}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm leading-4 text-black/[0.87] font-bold font-roboto">
                        {EQUIPMENT_CHARS_MAP[row.jdeAttrName]}
                        {editMode && isRequiredField(row.jdeAttrName) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="left" width={340}>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm leading-4 text-black/[0.87] font-roboto"
                        data-testid={`jde-value-${row.jdeAttrName}`}
                      >
                        {displayJDEValue(row)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="left" width={340}>
                    <div
                      className="flex flex-col"
                      data-testid={`mes-value-${row.jdeAttrName}`}
                    >
                      {!editMode ? (
                        <span className="text-sm leading-4 text-black/[0.87] font-roboto">
                          {displayMESValue(row)}
                        </span>
                      ) : !ONLY_JDE_EQUIPMENT_CHARS.includes(row.jdeAttrName) &&
                        flag.isEditAttrValueEnabled ? (
                        renderEditableValue(row)
                      ) : (
                        displayMESValue(row)
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    data-testid={`attributes-edit-row-${row.jdeAttrName}`}
                    align="left"
                    width={250}
                  >
                    {displayAtributeStatus(row)}
                  </TableCell>
                  <TableCell
                    align="left"
                    width={250}
                    data-testid={`comments-${row.jdeAttrName}`}
                  >
                    <Comments
                      row={row}
                      editMode={editMode && flag.isEditAttrCommentEnabled}
                      loading={loading || isPending}
                      onCommentChange={(newComment) =>
                        handleCommentChange(index, newComment)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        </Table>
      </TableContainer>
    </>
  );
};
