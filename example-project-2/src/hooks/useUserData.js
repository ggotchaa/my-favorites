import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { RESOURCE_ID, USER_ROLE_ID } from "../constants/environment";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { ALLOWED_ACTIONS_BY_USER_ROLE } from "../constants/global";

export const useUserData = () => {
  const { instance, accounts } = useMsal();
  const [loading, setLoading] = useState(true);

  const getAccessToken = useCallback(async () => {
    if (accounts.length === 0) {
      throw new Error("User is not signed in");
    }
    const request = {
      scopes: ["https://graph.microsoft.com/User.Read"],
      account: accounts[0],
    };

    const authResult = await instance.acquireTokenSilent(request);

    return authResult.accessToken;
  }, [accounts, instance]);

  const getAppRoleIdAndPrincipalId = useCallback(async (accessToken) => {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/appRoleAssignments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            $filter: `resourceId eq ${RESOURCE_ID}`,
          },
        }
      );

      if (response?.data?.value?.[0]?.appRoleId) {
        return {
          roleId: response.data.value[0].appRoleId,
          principalId: response.data.value[0].principalId,
        };
      } else {
        return USER_ROLE_ID.RestrictedUser;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong or role id is not found");
    }
  }, []);

  const getAppRoles = useCallback(async (accessToken) => {
    try {
      const rolesResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/servicePrincipals/${RESOURCE_ID}?$select=appRoles`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return rolesResponse.data.appRoles;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong or roles not found");
    }
  }, []);

  const getAllowedActions = (user) => {
    return (
      ALLOWED_ACTIONS_BY_USER_ROLE[user.id] || {
        all: false,
        jde: false,
        mes: false,
        mm: false,
        wm: false,
        monitor: false,
        em: false,
      }
    );
  };

  const getUserRoleAndAllowedActions = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      const { roleId, principalId } = await getAppRoleIdAndPrincipalId(
        accessToken
      );
      const appRoles = await getAppRoles(accessToken);
      const user = appRoles.filter((role) => role.id === roleId)[0];
      if (user) {
        setLoading(false);
        const actions = getAllowedActions(user);
        return { user, actions, principalId };
      }
      return null;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong or user role not found");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, getAppRoleIdAndPrincipalId, getAppRoles]);

  return {
    loading,
    getUserRoleAndAllowedActions,
  };
};
