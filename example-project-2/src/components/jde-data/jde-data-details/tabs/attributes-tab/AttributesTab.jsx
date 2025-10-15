import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { AttributesTable } from "./AttributesTable";
import { AttributesEditTable } from "./AttributesEditTable";
import { useJdeData } from "../../../../../hooks/useJdeDataHook";

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

  const { getManufacturerOptions } = useJdeData();

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
      data-testid="attributes-tab"
      className="flex flex-col w-full min-h-[400px]"
    >
      <Paper data-testid="attributes-paper" elevation={0} variant="outlined">
        <>
          {!editMode && (
            <AttributesTable
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
