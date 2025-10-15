import axios from "axios";
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "react-toastify";

const source = axios.CancelToken.source();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL,
});

export const useMaterialsManagement = () => {
  const { instance, accounts } = useMsal();

  const getAccessToken = useCallback(async () => {
    if (accounts.length === 0) {
      console.log("User is not signed in");
    }
    const request = {
      scopes: [process.env.REACT_APP_BACKEND_SCOPE],
      account: accounts[0],
    };
    const authResult = await instance.acquireTokenSilent(request);
    return authResult.accessToken;
  }, [accounts, instance]);

  const getMaterialsManagement = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          "/api/MaterialsManagement/GetMaterialsManagementData",
          {
            params,
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getElementsByColumn = useCallback(
    async (columnName) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get("/api/Equipment/GetAllDataByColumn", {
          params: { columnName },
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          cancelToken: source.token,
        });
        return response.data;
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  return {
    getElementsByColumn,
    getMaterialsManagement,
  };
};
