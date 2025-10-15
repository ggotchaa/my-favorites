import axios from "axios";
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "react-toastify";

const source = axios.CancelToken.source();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL,
});

export const useEnrichmentManagement = () => {
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

  const getGraphAccessToken = useCallback(async () => {
    if (accounts.length === 0) {
      throw new Error("User is not signed in");
    }
    const request = {
      scopes: [
        "https://graph.microsoft.com/GroupMember.Read.All",
        "https://graph.microsoft.com/Group.Read.All",
      ],
      account: accounts[0],
    };

    const authResult = await instance.acquireTokenSilent(request);

    return authResult.accessToken;
  }, [accounts, instance]);

  const getEnrichmentSchedules = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get(
        "/api/EnrichmentPlanning/GetMasterEnrichmentSchedules",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          cancelToken: source.token,
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Enrichment schedules fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getEnrichmentUsers = useCallback(async () => {
    try {
      const accessToken = await getGraphAccessToken();
      const users = await axios.get(
        `https://graph.microsoft.com/v1.0/groups/${process.env.REACT_APP_ENRICHMENT_USERS_GROUP_ID}/members`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (users) {
        return users.data.value;
      }

      return [];
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong or enrichment users not found");
    }
  }, [getGraphAccessToken]);

  const getEnrichmentScheduleEquipment = useCallback(
    async (scheduleMasterFk, startFrom, fetchRecord) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          "/api/EnrichmentPlanning/GetEnrichmentScheduleEquipments",
          {
            params: {
              scheduleMasterFk,
              startFrom,
              fetchRecord,
            },
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        toast.error("Enrichment schedule equipment fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getEnrichmentScheduleOwnerByScheduleId = useCallback(
    async (scheduleId) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          `/api/EnrichmentPlanning/GetMasterScheduleOwner/${scheduleId}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        toast.error("Enrichment schedule owner info fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getNotScheduledEquipmentTags = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/EnrichmentPlanning/GetEnrichmentPlanningTags",
          params,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        toast.error("Equipment tags fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const validateNewEquipmentTag = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          `/api/Equipment/ValidateEquipmentTag/${params.tagNumber}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response;
      } catch (error) {
        if (error.response) {
          return error.response;
        }

        console.error(error);
      }
    },
    [getAccessToken]
  );

  const createNewEquipmentTag = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/Equipment/CreateEquipmentTagWithCharacteristics",
          params,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.success("New equipment tag created successfully");
        return response
      } catch (error) {
        toast.error("Equipment tag creation failed");
        if (error.response) {
          return error.response.status;
        }

        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getEquipmentDataFilteredByColumn = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/EnrichmentPlanning/GetEnrichmentTagsDataFilteredByColumn",
          params,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        toast.error("Equipment data fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const addEquipmentTags = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("Equipment is adding...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/EnrichmentPlanning/AssignTags",
          bodyParams,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        if (response) {
          toast.update(toastId, {
            render: "Equipment added successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            closeButton: true,
          });
          return response.data;
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const addEnrichmentSchedule = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("Schedule is adding...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/EnrichmentPlanning/CreateEnrichmentPlanningMasterSchedule",
          bodyParams,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: "Schedule added successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Schedule add failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const deleteEnrichmentSchedule = useCallback(
    async (scheduleId) => {
      const toastId = toast.loading("Schedule is deleting...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete(
          "/api/EnrichmentPlanning/DeleteEnrichmentPlanningSchedule",
          {
            params: {
              scheduleId,
            },
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: "Schedule deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Enrichment schedule deletion failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const deleteScheduleEquipment = useCallback(
    async (equipmentId) => {
      const toastId = toast.loading("Scheduled tag is deleting...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete(
          "/api/EnrichmentPlanning/DeleteEquipmentFromEnrichmentSchedule",
          {
            params: {
              equipmentId,
            },
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: "Scheduled tag deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Scheduled tag delete failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  return {
    getNotScheduledEquipmentTags,
    addEquipmentTags,
    getEnrichmentUsers,
    addEnrichmentSchedule,
    getEnrichmentSchedules,
    deleteEnrichmentSchedule,
    deleteScheduleEquipment,
    validateNewEquipmentTag,
    getEnrichmentScheduleEquipment,
    getEquipmentDataFilteredByColumn,
    createNewEquipmentTag,
    getEnrichmentScheduleOwnerByScheduleId,
  };
};
