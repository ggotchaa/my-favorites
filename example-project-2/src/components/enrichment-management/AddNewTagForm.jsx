import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { NewTagDetailsFields } from "./NewTagDetailsFields";
import { useJdeData } from "../../hooks/useJdeDataHook";

export const AddNewTagForm = ({ id, setIsAddNewTagFormOpen }) => {
  const navigate = useNavigate();
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [classesAndSubClasses, setClassesAndSubClasses] = useState([]);
  const [isClassesAndSubClassesLoading, setIsClassesAndSubClassesLoading] =
    useState(false);
  const { getClassesAndSubClasses, getManufacturerOptions } = useJdeData();

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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsClassesAndSubClassesLoading(true);
      getClassesAndSubClasses()
        .then((response) => {
          if (isMounted && response) {
            setClassesAndSubClasses(response);
          }
        })
        .finally(() => {
          setIsClassesAndSubClassesLoading(false);
        });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getClassesAndSubClasses]);

  const handleBack = () => {
    setIsAddNewTagFormOpen(false);
    navigate(`/enrichment-management/${id}`);
  };

  return (
    <div className="w-full" data-testid="add-new-tag-form">
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        data-testid="new-tag-back-btn"
      >
        Back
      </Button>
      <div className="w-full">
        <NewTagDetailsFields
          classesAndSubClasses={classesAndSubClasses}
          onCancel={handleBack}
          enrichmentScheduleId={id}
          loading={isClassesAndSubClassesLoading}
          manufacturerOptions={manufacturerOptions}
        />
      </div>
    </div>
  );
};
