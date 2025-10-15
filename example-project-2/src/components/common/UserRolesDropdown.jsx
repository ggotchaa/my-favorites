import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormControl, MenuItem, Select } from "@mui/material";
import {
  getUserRoleOptions,
  setUserRole,
} from "../../store/slices/global/userSlice";
import { USER_ROLE, USER_ROLE_BY_ID } from "../../constants/environment";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_JDE_COLUMNS,
  SME_USER_JDE_COLUMNS,
} from "../../constants/jde-data";
import { setColumns } from "../../store/slices/jde-data/columnsSlice";

export const UserRolesDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRoleOptions = useSelector(getUserRoleOptions);
  const [selected, setSelected] = useState(
    USER_ROLE_BY_ID[userRoleOptions?.[0]?.id]
  );

  function handleChange(event) {
    const role = event.target.value;
    switch (role) {
      case USER_ROLE.ADMIN:
      case USER_ROLE.DATA_TEAM:
      case USER_ROLE.ENRICHMENT_TEAM:
      case USER_ROLE.RESTRICTED:
      case USER_ROLE.FIELD_ENGINEERS:
        navigate("/jde-data");
        dispatch(setColumns(DEFAULT_JDE_COLUMNS));
        break;
      case USER_ROLE.SME:
        navigate("/jde-data");
        dispatch(setColumns(SME_USER_JDE_COLUMNS));
        break;
      case USER_ROLE.WALKDOWN_COORDINATOR:
        navigate("/walkdown-management");
        break;
      case USER_ROLE.MM_SYSTEM_ANALYST:
        navigate("/materials-management");
        break;
      default:
        return null;
    }
    dispatch(setUserRole(role));
    setSelected(role);
  }

  return (
    <FormControl>
      {userRoleOptions.length === 1 ? (
        <span
          className="text-white text-sm not-italic font-normal leading-4 mt-1"
          data-testid="single-user-role"
        >
          {USER_ROLE_BY_ID[userRoleOptions[0].id]}
        </span>
      ) : (
        <Select
          value={selected}
          onChange={handleChange}
          variant="standard"
          sx={{
            fontSize: "14px",
            fontFamily: "Fira Sans, sans-serif",
            color: "#fff",
            "& .MuiSvgIcon-root": {
              color: "#fff",
            },
          }}
          data-testid="user-roles-dropdown"
          disableUnderline={true}
        >
          {userRoleOptions.map(({ id }) => {
            return (
              <MenuItem
                sx={{
                  fontSize: "14px",
                  fontFamily: "Fira Sans, sans-serif",
                }}
                key={id}
                value={USER_ROLE_BY_ID[id]}
                data-testid={`user-role-${USER_ROLE_BY_ID[id]}`}
              >
                {USER_ROLE_BY_ID[id]}
              </MenuItem>
            );
          })}
        </Select>
      )}
    </FormControl>
  );
};
