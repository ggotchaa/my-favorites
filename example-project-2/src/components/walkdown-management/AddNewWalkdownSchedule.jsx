import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { setIsSchedulesListUpdated } from "../../store/slices/walkdown-management/schedulesSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";

export const AddNewWalkdownSchedule = ({
  closeNewScheduleModal,
  openNewScheduleModal,
}) => {
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startDateClose, setStartDateClose] = useState(false);
  const [completionDateClose, setCompletionDateClose] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const { addWalkdownSchedule, getWalkdownCoordinators, getFieldEngineers } =
    useWalkdownManagement();

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      user: null,
      plannedStartDate: null,
      plannedCompletionDate: null,
    },
  });

  const [formattedUsers, setFormattedUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setIsUsersLoading(true);
      const results = await Promise.allSettled([
        getWalkdownCoordinators(),
        getFieldEngineers(),
      ]);

      if (isMounted) {
        const [coordinatorsResult, engineersResult] = results;
        const coordinators =
          coordinatorsResult.status === "fulfilled"
            ? coordinatorsResult.value || []
            : [];
        const engineers =
          engineersResult.status === "fulfilled"
            ? engineersResult.value || []
            : [];

        const uniqueUsersMap = new Map();
        [...coordinators, ...engineers].forEach((user) => {
          if (!uniqueUsersMap.has(user.id)) {
            uniqueUsersMap.set(user.id, user);
          }
        });
        const allUsers = Array.from(uniqueUsersMap.values());
        const formattedUsers = getWalkdownUserNames(allUsers);
        setFormattedUsers(formattedUsers);
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [getWalkdownCoordinators, getFieldEngineers]);

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
      value: {
        userObjectId: user.id,
        firstName: user.givenName,
        lastName: user.surname,
        email: user.userPrincipalName,
      },
      label: `${user.givenName} ${user.surname}`,
    }));
    return allUsers;
  };

  return (
    <div className="w-[400px]" data-testid="add-walkdown-schedule-container">
      <h6 className="text-xl font-fira font-bold leading-6">
        Add new schedule
      </h6>
      <form
        onSubmit={handleSubmit(handleAdd)}
        data-testid="walkdown-schedule-form"
      >
        <div className="flex flex-col w-full gap-4 mt-6">
          <Controller
            control={control}
            name="user"
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Autocomplete
                  disabled={isPending}
                  size="small"
                  disablePortal
                  options={formattedUsers}
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
                  loading={isUsersLoading}
                  loadingText="Loading users..."
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
                            data-testid="planned-end-date-input"
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
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              sx={{ width: "90px" }}
              variant="contained"
              color="primary"
              type="submit"
              disabled={isPending}
              data-testid="submit-button"
            >
              {isPending ? (
                <CircularProgress size={20} data-testid="submit-loading" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
