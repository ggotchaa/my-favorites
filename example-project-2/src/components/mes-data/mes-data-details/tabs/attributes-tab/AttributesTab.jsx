import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { AttributesTable } from "./AttributesTable";
import { AttributesEditTable } from "./AttributesEditTable";
import { useMesData } from "../../../../../hooks/useMesData";

export const AttributesTab = ({
  loading,
  rows,
  attributeStatuses,
  classesAndSubClasses,
  flag,
  isNewTag,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);

  const { getManufacturerOptions } = useMesData();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      getManufacturerOptions().then((options) => {
        if (isMounted && options) {
          const formattedOptions = options.map((option) => ({
            label: `${option.code} - ${option.description}`,
            value: option.code,
          }));
          setManufacturerOptions(formattedOptions);
        }
      });
    };

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, [getManufacturerOptions]);

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <div
      data-testid="attributes-tab-container"
      className="flex flex-col w-full min-h-[400px]"
    >
      <Paper
        data-testid="attributes-tab-paper"
        elevation={0}
        variant="outlined"
      >
        <>
          {!editMode && (
            <AttributesTable
              data-testid="attributes-view-table"
              rows={rows}
              loading={loading}
              editMode={editMode}
              handleEditMode={handleEditMode}
              manufacturerOptions={manufacturerOptions}
              classesAndSubClasses={classesAndSubClasses}
              flag={flag}
            />
          )}
          {editMode && (
            <AttributesEditTable
              data-testid="attributes-edit-table"
              rows={rows}
              attributeStatuses={attributeStatuses}
              manufacturerOptions={manufacturerOptions}
              handleCancel={handleCancel}
              editMode={editMode}
              setEditMode={setEditMode}
              loading={loading}
              classesAndSubClasses={classesAndSubClasses}
              flag={flag}
              isNewTag={isNewTag}
            />
          )}
        </>
      </Paper>
    </div>
  );
};
