import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
  Checkbox,
} from "@mui/material";
import {
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { setIsSchedulesListUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const AddNewSchedule = ({
  closeNewScheduleModal,
  openNewScheduleModal,
  walkdownUsers,
}) => {
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startDateClose, setStartDateClose] = useState(false);
  const [completionDateClose, setCompletionDateClose] = useState(false);

  const { addWalkdownSchedule } = useWalkdownManagement();

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      userId: null,
      plannedStartDate: null,
      plannedCompletionDate: null,
    },
  });

  const [formattedUsers, setFormattedUsers] = useState([]);

  useEffect(() => {
    if (walkdownUsers.length) {
      const formattedUsers = getWalkdownUserNames(walkdownUsers);
      setFormattedUsers(formattedUsers);
    }
  }, [walkdownUsers]);

  const handleAdd = (data) => {
    setIsPending(true);
    addWalkdownSchedule(data)
      .then((response) => {
        if (response) {
          reset();
          setIsPending(false);
          closeNewScheduleModal();
          dispatch(setIsSchedulesListUpdated());
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const getWalkdownUserNames = (users) => {
    const allUsers = users.map((user) => ({
      value: user.userPk,
      label: `${user.firstName} ${user.lastName}`,
    }));
    return allUsers;
  };

  return (
    <div className="w-[400px]" data-testid="add-new-schedule-component">
      <h6
        className="text-xl font-fira font-bold leading-6"
        data-testid="add-new-schedule-title"
      >
        Add new schedule
      </h6>
      <form onSubmit={handleSubmit(handleAdd)}>
        <div className="flex flex-col w-full gap-4 mt-6">
          <Controller
            control={control}
            name="userId"
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Autocomplete
                  // multiple
                  disabled={isPending}
                  size="small"
                  disablePortal
                  // disableCloseOnSelect
                  options={formattedUsers}
                  // renderOption={(props, option, { selected }) => (
                  //   <li {...props}>
                  //     <Checkbox
                  //       icon={icon}
                  //       checkedIcon={checkedIcon}
                  //       style={{ marginRight: 8 }}
                  //       checked={selected}
                  //     />
                  //     {option.label}
                  //   </li>
                  // )}
                  // renderInput={(params) => (
                  //   <TextField {...params} label="Select user" />
                  // )}
                  // onChange={(_event, option) => {
                  //   field.onChange(option.map((item) => item.value));
                  // }}
                  renderInput={(params) => (
                    <TextField
                      label="User"
                      {...params}
                      inputRef={field.ref}
                      data-testid="user-select-input"
                    />
                  )}
                  onChange={(_event, option) => {
                    field.onChange(option?.value);
                  }}
                />
              );
            }}
          />

          <div className="flex items-center justify-between gap-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                control={control}
                name="plannedStartDate"
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <DatePicker
                      disabled={isPending}
                      format="DD/MM/YYYY"
                      closeOnSelect={true}
                      label="Planned start date"
                      slots={{
                        textField: (params) => (
                          <TextField
                            size="small"
                            {...params}
                            data-testid="planned-start-date-input"
                          />
                        ),
                      }}
                      inputRef={field.ref}
                      value={field.value}
                      slotProps={{
                        popper: {
                          placement: "right-start",
                          sx: {
                            display:
                              !openNewScheduleModal || startDateClose
                                ? "none"
                                : "",
                          },
                        },
                      }}
                      onClose={() => setStartDateClose(true)}
                      onOpen={() => setStartDateClose(false)}
                      disablePast
                      onChange={(date) => {
                        setStartDate(date);
                        field.onChange(dayjs(date).format("YYYY-MM-DD"));
                      }}
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name="plannedCompletionDate"
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <DatePicker
                      disabled={isPending}
                      format="DD/MM/YYYY"
                      closeOnSelect={true}
                      label="Planned end date"
                      slots={{
                        textField: (params) => (
                          <TextField
                            size="small"
                            {...params}
                            data-testid="planned-completion-date-input"
                          />
                        ),
                      }}
                      inputRef={field.ref}
                      value={field.value}
                      slotProps={{
                        popper: {
                          placement: "right-start",
                          sx: {
                            display:
                              !openNewScheduleModal || completionDateClose
                                ? "none"
                                : "",
                          },
                        },
                      }}
                      onClose={() => setCompletionDateClose(true)}
                      onOpen={() => setCompletionDateClose(false)}
                      disablePast
                      onChange={(date) => {
                        field.onChange(dayjs(date).format("YYYY-MM-DD"));
                      }}
                      minDate={startDate && dayjs(startDate)}
                    />
                  );
                }}
              />
            </LocalizationProvider>
          </div>
          <div className="flex items-center justify-end w-full gap-4 mt-6">
            <Button
              sx={{ width: "90px" }}
              variant="outlined"
              onClick={closeNewScheduleModal}
              disabled={isPending}
              data-testid="cancel-add-schedule-button"
            >
              Cancel
            </Button>
            <Button
              sx={{ width: "90px" }}
              variant="contained"
              color="primary"
              type="submit"
              disabled={isPending}
              data-testid="add-schedule-button"
            >
              {isPending ? <CircularProgress size={20} /> : "Add"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
