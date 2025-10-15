import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useUserData } from "../hooks/useUserData";
import { CircularProgress } from "@mui/material";

import {
  setUserRole,
  setAllowedActionsByUser,
  setUserPolicyId,
  setUser,
  setPrincipalId,
} from "../store/slices/global/userSlice";
import { setColumns } from "../store/slices/jde-data/columnsSlice";
import { setColumns as mesSetColumns } from "../store/slices/mes-data/columnsSlice";
import { setColumns as mmSetColumns } from "../store/slices/materials-management/columnsSlice";

import {
  DEFAULT_JDE_COLUMNS,
  SME_USER_JDE_COLUMNS,
} from "../constants/jde-data";
import {
  DEFAULT_MES_COLUMNS,
  SME_USER_MES_COLUMNS,
} from "../constants/mes-data";
import { TABLE_COLUMNS as MM_TABLE_COLUMNS } from "../constants/materials-management";
import {
  USER_POLICY_ID,
  USER_ROLE,
  USER_ROLE_BY_ID,
} from "../constants/environment";

import { Container, Header, Main } from "./layout";

export const App = () => {
  const dispatch = useDispatch();
  const { getUserRoleAndAllowedActions, loading } = useUserData();

  const setDefaultTableColumns = useCallback(
    (userRole) => {
      if (userRole === USER_ROLE.SME) {
        dispatch(setColumns(SME_USER_JDE_COLUMNS));
        dispatch(mesSetColumns(SME_USER_MES_COLUMNS));
      } else {
        dispatch(setColumns(DEFAULT_JDE_COLUMNS));
        dispatch(mesSetColumns(DEFAULT_MES_COLUMNS));
      }
      dispatch(mmSetColumns(MM_TABLE_COLUMNS));
    },
    [dispatch]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = () => {
      getUserRoleAndAllowedActions().then((response) => {
        const user = response?.user;
        const principalId = response?.principalId;
        const actions = response?.actions;
        if (isMounted && user) {
          dispatch(setUser(user));
          dispatch(setPrincipalId(principalId));
          dispatch(setUserRole(USER_ROLE_BY_ID[user.id]));
          setDefaultTableColumns(USER_ROLE_BY_ID[user.id]);
          dispatch(setUserPolicyId(USER_POLICY_ID[user.id]));
          dispatch(setAllowedActionsByUser(actions));
        } else {
          dispatch(setUserRole(USER_ROLE.RESTRICTED));
          setDefaultTableColumns(USER_ROLE.RESTRICTED);
          dispatch(
            setAllowedActionsByUser({
              jde: false,
              mes: false,
              wm: false,
              mm: false,
              monitor: false,
              all: false,
              em: false,
            })
          );
        }
      });
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, getUserRoleAndAllowedActions, setDefaultTableColumns]);

  return (
    <Container>
      {loading ? (
        <div
          className="flex items-center justify-center h-screen"
          data-testid="loading-container"
        >
          <CircularProgress size={50} data-testid="loading-spinner" />
        </div>
      ) : (
        <>
          <Header />
          <Main />
        </>
      )}
    </Container>
  );
};
