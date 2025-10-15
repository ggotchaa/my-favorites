import z from "zod";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, TextField } from "@mui/material";

import { setIsManufacturerListUpdated } from "../../store/slices/jde-data/manufacterSlice";
import { useJdeData } from "../../hooks/useJdeDataHook";

const formSchema = z.object({
  equipmentManufacturerPk: z
    .string()
    .trim()
    .min(1, "Must be at least 1 character long"),
  manufacturerNameRus: z
    .string()
    .trim()
    .min(1, "Must be at least 1 character long")
    .optional()
    .or(z.literal("")),
  manufacturerWebSiteLink: z
    .string()
    .trim()
    .url("Website url is invalid. Must start with http:// or https://")
    .optional()
    .or(z.literal("")),
});

export const AddNewManufacturer = ({
  closeManufacturerModal,
  manufacturerOptions,
}) => {
  const dispatch = useDispatch();
  const [nameAllowed, setNameAllowed] = useState({
    message: "",
    isValid: true,
  });
  const [nameRusAllowed, setNameRusAllowed] = useState({
    message: "",
    isValid: true,
  });
  const [webLinkAllowed, setWebLinkAllowed] = useState({
    message: "",
    isValid: true,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentManufacturerPk: "",
      manufacturerNameRus: "",
      manufacturerWebSiteLink: "",
    },
  });

  const [isPending, setIsPending] = useState(false);
  const { addNewManufacturer } = useJdeData();

  const handleNameChange = (event) => {
    const { value } = event.target;
    if (value) {
      const matched = manufacturerOptions.find(
        (item) => item.value.toLowerCase() === value.toLowerCase()
      );

      if (matched) {
        setNameAllowed({
          message: "Manufacturer name already exists",
          isValid: false,
        });
      } else {
        setNameAllowed({ message: "", isValid: true });
      }
    }
  };

  const handleNameRusChange = (event) => {
    const { value } = event.target;
    if (value) {
      const matched = manufacturerOptions.find(
        (item) => item.nameRus.toLowerCase() === value.toLowerCase()
      );

      if (matched) {
        setNameRusAllowed({
          message: "Name in russian already exists",
          isValid: false,
        });
      } else {
        setNameRusAllowed({ message: "", isValid: true });
      }
    }
  };

  const handleWebLinkChange = (event) => {
    const { value } = event.target;
    if (value) {
      const matched = manufacturerOptions.find(
        (item) => item.webLink.toLowerCase() === value.toLowerCase()
      );

      if (matched) {
        setWebLinkAllowed({
          message: "Website url already exists",
          isValid: false,
        });
      } else {
        setWebLinkAllowed({ message: "", isValid: true });
      }
    }
  };

  const handleAdd = (data) => {
    if (
      !nameAllowed.isValid ||
      !nameRusAllowed.isValid ||
      !webLinkAllowed.isValid
    ) {
      return;
    }
    setIsPending(true);
    addNewManufacturer(data)
      .then((response) => {
        if (response) {
          reset();
          closeManufacturerModal();
          dispatch(setIsManufacturerListUpdated());
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <div className="w-[400px]" data-testid="add-new-manufacturer-modal">
      <h6 className="text-xl font-fira font-bold leading-6">
        Add new manufacturer
      </h6>
      <form onSubmit={handleSubmit(handleAdd)}>
        <div className="flex flex-col w-full gap-4 mt-6">
          <TextField
            className="w-full"
            size="small"
            label="Name"
            variant="outlined"
            error={!!errors.equipmentManufacturerPk || !nameAllowed.isValid}
            helperText={
              errors.equipmentManufacturerPk?.message ||
              (nameAllowed.message ? nameAllowed.message : "")
            }
            {...register("equipmentManufacturerPk", {
              onChange: handleNameChange,
            })}
            data-testid="manufacturer-name-input"
          />
          <TextField
            className="w-full"
            size="small"
            label="Name in russian"
            variant="outlined"
            error={!!errors.manufacturerNameRus || !nameRusAllowed.isValid}
            helperText={
              errors.manufacturerNameRus?.message ||
              (nameRusAllowed.message ? nameRusAllowed.message : "")
            }
            {...register("manufacturerNameRus", {
              onChange: handleNameRusChange,
            })}
            data-testid="manufacturer-name-rus-input"
          />
          <TextField
            className="w-full"
            size="small"
            label="Website url"
            variant="outlined"
            error={!!errors.manufacturerWebSiteLink || !webLinkAllowed.isValid}
            helperText={
              errors.manufacturerWebSiteLink?.message ||
              (webLinkAllowed.message ? webLinkAllowed.message : "")
            }
            {...register("manufacturerWebSiteLink", {
              onChange: handleWebLinkChange,
            })}
            data-testid="manufacturer-website-input"
          />
          <span className="pl-[4px] text-[10px] text-black/[0.45]">
            After request is approved you will be able to select manufacturer
            from the list.
          </span>
        </div>
        <div className="flex items-center justify-end w-full gap-4 mt-6">
          <Button
            sx={{ width: "90px" }}
            variant="outlined"
            onClick={closeManufacturerModal}
            disabled={isPending}
            data-testid="cancel-add-manufacturer-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            sx={{ width: "90px" }}
            variant="contained"
            color="primary"
            disabled={isPending}
            data-testid="confirm-add-manufacturer-button"
          >
            {isPending ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};
