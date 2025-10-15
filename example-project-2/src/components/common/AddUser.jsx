import z from "zod";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, TextField } from "@mui/material";

import { setIsWalkdownUsersListUpdated } from "../../store/slices/walkdown-management/walkdownUsersSlice";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";
import { toast } from "react-toastify";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "Must be at least 1 character long"),
  lastName: z.string().trim().min(1, "Must be at least 1 character long"),
  email: z.string().trim().email("Email is invalid"),
  password: z.string().trim().min(6, "Must be at least 6 characters long"),
  isAdmin: z.boolean().optional(),
});

export const AddUser = ({ closeAddUserModal }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const { addWalkdownUser } = useWalkdownManagement();

  const handleAdd = (data) => {
    setIsPending(true);
    addWalkdownUser(data)
      .then((response) => {
        if (response) {
          reset();
          setIsPending(false);
          closeAddUserModal();
          dispatch(setIsWalkdownUsersListUpdated());
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(handleAdd)} data-testid="add-user-form">
      <div
        className="flex flex-col gap-4 max-w-[500px]"
        data-testid="add-user-modal"
      >
        <h6 className="text-xl font-fira font-bold leading-6">Add user</h6>
        <div className="flex items-center gap-4 w-full mt-2">
          <TextField
            size="small"
            label="Name"
            error={!!errors.firstName}
            helperText={
              errors.firstName?.message || (errors.lastName?.message ? " " : "")
            }
            disabled={isPending}
            inputProps={{ "data-testid": "name" }}
            {...register("firstName")}
          />
          <TextField
            size="small"
            label="Surname"
            error={!!errors.lastName}
            helperText={
              errors.lastName?.message || (errors.firstName?.message ? " " : "")
            }
            disabled={isPending}
            inputProps={{ "data-testid": "surname" }}
            {...register("lastName")}
          />
        </div>
        <TextField
          size="small"
          label="Email"
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isPending}
          inputProps={{ "data-testid": "email" }}
          {...register("email")}
        />
        <TextField
          size="small"
          label="Password"
          type="password"
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isPending}
          inputProps={{ "data-testid": "password" }}
          {...register("password")}
        />
        <div className="flex items-center">
          <Checkbox
            size="small"
            disabled={isPending}
            inputProps={{ "data-testid": "is-admin-checkbox" }}
            {...register("isAdmin")}
          />
          <span className="text-base font-roboto leading-5">Admin</span>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            sx={{ width: "90px" }}
            variant="outlined"
            onClick={closeAddUserModal}
            disabled={isPending}
            data-testid="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            sx={{ width: "90px" }}
            variant="contained"
            type="submit"
            disabled={isPending}
            data-testid="add-btn"
          >
            Add
          </Button>
        </div>
      </div>
    </form>
  );
};
