import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Autocomplete,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { validateTag } from "../../utils/tagValidation";
import { debounce } from "../../utils";
import { NewTagDetailsRow } from "./NewTagDetailsRow";
import {
  NEW_TAG_ATTR_FIELDS,
  NEW_TAG_OPTIONAL_FIELDS,
} from "../../constants/enrichment-management";
import { useNavigate } from "react-router-dom";
import { useEnrichmentManagement } from "../../hooks/useEnrichmentManagement";
import { VirtualizedAutocomplete } from "../common/VirtualizedAutocomplete";

export const NewTagDetailsFields = ({
  classesAndSubClasses,
  onCancel,
  enrichmentScheduleId,
  loading,
  manufacturerOptions,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [state, setState] = useState(
    Object.keys(NEW_TAG_ATTR_FIELDS).map((key) => ({
      name: key,
      value: "",
      comment: "",
    }))
  );

  const [selectedClass, setSelectedClass] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [descriptionErrors, setDescriptionErrors] = useState({});

  const { validateNewEquipmentTag, createNewEquipmentTag } =
    useEnrichmentManagement();

  const debouncedValidation = useCallback(
    debounce(async (tagNumber, name) => {
      if (!tagNumber) return;
      await validateTag({
        tagNumber,
        validateNewEquipmentTag,
        setErrors,
        fieldName: name,
      });
    }, 500),
    []
  );

  const handleValueChange = useCallback(
    (name, value, option = null) => {
      setErrors((prev) => ({ ...prev, [name]: "" }));

      // Add description validation
      if (
        name === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
        name === "EQUIPMENT_TAG_DESCRIPTION_EN"
      ) {
        if (value.length > 30) {
          setDescriptionErrors((prev) => ({
            ...prev,
            [name]: "Maximum 30 characters allowed",
          }));
        } else {
          setDescriptionErrors((prev) => ({
            ...prev,
            [name]: "",
          }));
        }
      }

      if (name === "EQUIPMENT_TAG" || name === "PARENT_EQUIPMENT_TAG") {
        debouncedValidation(value, name);
      }

      if (name === "JDE_CLASSIFICATION") {
        const selected = classesAndSubClasses.filter(
          (item) => item.class === value
        );
        setSelectedClass(selected);

        setState((prevState) =>
          prevState.map((field) => {
            if (field.name === "JDE_SUBCLASSIFICATION") {
              return { ...field, value: "" };
            }
            if (field.name === name) {
              return { ...field, value };
            }
            return field;
          })
        );
      } else {
        setState((prevState) =>
          prevState.map((field) =>
            field.name === name ? { ...field, value } : field
          )
        );
      }
    },
    [classesAndSubClasses, debouncedValidation]
  );

  const handleCommentChange = useCallback((name, comment) => {
    setState((prevState) =>
      prevState.map((field) =>
        field.name === name ? { ...field, comment } : field
      )
    );
  }, []);

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

  const renderEditableValue = useCallback(
    (field) => {
      if (
        field.name === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
        field.name === "EQUIPMENT_TAG_DESCRIPTION_EN"
      ) {
        return (
          <TextField
            size="small"
            value={field.value}
            onChange={(e) => handleValueChange(field.name, e.target.value)}
            style={{ width: 400 }}
            error={!!errors[field.name] || !!descriptionErrors[field.name]}
            helperText={errors[field.name] || descriptionErrors[field.name]}
            FormHelperTextProps={{
              sx: {
                top: "35px",
                left: "0px",
                marginLeft: "0px",
                fontSize: "10px",
                position: "absolute",
              },
            }}
          />
        );
      } else if (field.name === "ASSET_NUMBER") {
        return "Generated automatically";
      } else if (field.name === "JDE_STATUS") {
        return (
          <Autocomplete
            size="small"
            value={field.value}
            disablePortal
            options={[
              { value: "AV", label: "AV" },
              { value: "DN", label: "DN" },
            ]}
            renderInput={(params) => <TextField size="small" {...params} />}
            onChange={(_, option) =>
              handleValueChange(field.name, option?.value || "")
            }
            style={{ width: 400 }}
          />
        );
      } else if (field.name === "JDE_CLASSIFICATION") {
        return (
          <Autocomplete
            size="small"
            value={displayClassValueWithDescription(field.value)}
            options={classesAndSubClasses.map((item) => ({
              value: item.class,
              label: `${item.class} - ${item.description}`,
            }))}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                FormHelperTextProps={{
                  sx: {
                    top: "35px",
                    left: "0px",
                    marginLeft: "0px",
                    fontSize: "10px",
                    position: "absolute",
                  },
                }}
              />
            )}
            onChange={(_, option) =>
              handleValueChange(field.name, option?.value || "", option)
            }
            disableClearable
            style={{ width: 400 }}
            loading={loading}
            loadingText="Loading..."
          />
        );
      } else if (field.name === "JDE_SUBCLASSIFICATION") {
        const subClasses =
          selectedClass.length > 0 ? selectedClass[0].subClasses : [];
        const selectedValue =
          selectedClass.length &&
          subClasses.find((item) => item.subClass === field.value);
        return (
          <Autocomplete
            size="small"
            value={
              selectedValue
                ? `${selectedValue.subClass} - ${selectedValue.description}`
                : ""
            }
            options={subClasses.map((item) => ({
              value: item.subClass,
              label: `${item.subClass} - ${item.description}`,
            }))}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                FormHelperTextProps={{
                  sx: {
                    top: "35px",
                    left: "0px",
                    marginLeft: "0px",
                    fontSize: "10px",
                    position: "absolute",
                  },
                }}
              />
            )}
            onChange={(_, option) =>
              handleValueChange(field.name, option?.value || "")
            }
            disableClearable
            style={{ width: 400 }}
            loading={loading}
            loadingText="Loading..."
          />
        );
      } else if (field.name === "MANUFACTURER") {
        return (
          <VirtualizedAutocomplete
            filterId={"new tag manufacturer"}
            size="small"
            disablePortal
            value={displayManufacturerValueWithDescription(field.value)}
            width={390}
            options={manufacturerOptions}
            label="Value"
            renderInput={(params) => (
              <TextField style={{ width: 400 }} {...params} />
            )}
            loading={loading}
            loadingText={loading ? "Fetching data..." : ""}
            onChange={(_, option) =>
              handleValueChange(field.name, option?.value || "")
            }
            style={{ width: 400 }}
          />
        );
      } else {
        return (
          <TextField
            size="small"
            value={field.value}
            onChange={(e) => handleValueChange(field.name, e.target.value)}
            style={{ width: 400 }}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            FormHelperTextProps={{
              sx: {
                top: "35px",
                left: "0px",
                marginLeft: "0px",
                fontSize: "10px",
                position: "absolute",
              },
            }}
          />
        );
      }
    },
    [errors, descriptionErrors, classesAndSubClasses, loading, selectedClass]
  );

  const validateFields = () => {
    const newErrors = { ...errors }; // Preserve existing errors
    let hasValidationErrors = false;

    state.forEach((field) => {
      const isDescriptionField =
        field.name === "EQUIPMENT_TAG_DESCRIPTION_RU" ||
        field.name === "EQUIPMENT_TAG_DESCRIPTION_EN";

      // Skip validation if field already has an error (preserves tag validation errors)
      if (!newErrors[field.name]) {
        // Check required fields
        if (
          !NEW_TAG_OPTIONAL_FIELDS.includes(field.name) ||
          isDescriptionField
        ) {
          if (!field.value || !field.value.trim()) {
            newErrors[field.name] = "This field is required";
            hasValidationErrors = true;
          }
        }

        // Description validation for max length
        if (isDescriptionField && field.value && field.value.length > 30) {
          newErrors[field.name] = "Maximum 30 characters allowed";
          hasValidationErrors = true;
        }
      } else {
        // If there's an existing error, mark validation as failed
        hasValidationErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasValidationErrors;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      toast.info("Please fill fields by requirements");
      return;
    }

    const equipmentTagField = state.find(
      (field) => field.name === "EQUIPMENT_TAG"
    );

    const parentTagField = state.find(
      (field) => field.name === "PARENT_EQUIPMENT_TAG"
    );

    try {
      setIsSaving(true);

      // Validate equipment tag
      if (equipmentTagField?.value) {
        const isEquipmentTagValid = await validateTag({
          tagNumber: equipmentTagField.value,
          validateNewEquipmentTag,
          setErrors,
          fieldName: "EQUIPMENT_TAG",
        });
        if (!isEquipmentTagValid) {
          setIsSaving(false);
          return;
        }
      }

      // Validate parent tag if it exists
      if (parentTagField?.value) {
        const isParentTagValid = await validateTag({
          tagNumber: parentTagField.value,
          validateNewEquipmentTag,
          setErrors,
          fieldName: "PARENT_EQUIPMENT_TAG",
        });
        if (!isParentTagValid) {
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        enrichmentScheduleMasterPk: enrichmentScheduleId,
        attributes: state.map((field) => ({
          characteristicsName: field.name,
          characteristicsValue: field.value,
          comment: field.comment,
        })),
      };

      const response = await createNewEquipmentTag(payload);

      if (response?.status === 200) {
        navigate(`/jde-data/${response?.data?.assetNumberPhk}`, {
          state: { from: `/enrichment-management/${enrichmentScheduleId}` },
        });
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error validating tags:", error);
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedValidation.cancel?.();
    };
  }, [debouncedValidation]);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between h-[40px]">
          <h6 data-testid="table-title" className="text-xl font-bold leading-6">
            Add New Tag Details
          </h6>
          <div className="flex items-center gap-6">
            <Button
              size="small"
              onClick={handleSave}
              data-testid="add-new-tag-btn"
              variant="contained"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="small"
              onClick={onCancel}
              data-testid="cancel-add-new-tag-btn"
              variant="outlined"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
      <TableContainer sx={{ overflowX: "unset" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>MES Value</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.map((field) => (
              <NewTagDetailsRow
                key={field.name}
                field={field}
                label={NEW_TAG_ATTR_FIELDS[field.name]}
                comment={field.comment}
                renderEditableValue={renderEditableValue}
                onCommentChange={handleCommentChange}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
