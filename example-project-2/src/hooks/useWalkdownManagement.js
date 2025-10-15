import axios from "axios";
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "react-toastify";

const source = axios.CancelToken.source();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL,
});

export const useWalkdownManagement = () => {
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

  const getWalkdownSchedules = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get(
        "/api/WalkDownApp/GetMasterWalkdownSchedule",
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
      toast.error("Walkdown schedules fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getWalkdownScheduleOwnerByScheduleId = useCallback(
    async (scheduleId) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          `/api/WalkDownApp/GetMasterScheduleOwner/${scheduleId}`,
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
        toast.error("Walkdown schedule owner info fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getWalkdownUsers = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get("/api/WalkDownApp/GetWalkDownUsers", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
      });
      return response.data;
    } catch (error) {
      toast.error("Walkdown users fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getWalkdownScheduleEquipment = useCallback(
    async (scheduleMasterId, StartFrom, FetchRecord) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          "/api/WalkDownApp/GetEquipmentWalkdownSchedule",
          {
            params: {
              scheduleMasterId,
              StartFrom,
              FetchRecord,
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
        toast.error("Walkdown schedule equipment fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getWalkdownEquipmentImages = useCallback(
    async (assetNumberPHKs) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/EquipmentImage/GetEquipmentImage",
          assetNumberPHKs,
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
        toast.error("Equipment images fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const deleteWalkdownEquipmentImages = useCallback(
    async (equipmentImageIds) => {
      const imageCount = equipmentImageIds.length;
      const toastId = toast.loading(
        `${imageCount === 1 ? "Image is" : "Images are"} deleting...`
      );
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete(
          "/api/EquipmentImage/DeleteEquipmentImage",
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
              equipmentImageIds,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: `${
            imageCount === 1 ? "Image is " : "Images are"
          } deleted successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Image deletion failed",
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

  const getNotScheduledEquipmentTags = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/WalkDownApp/GetEquipmentsOptions",
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

  const getEquipmentDataFilteredByColumn = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/WalkDownApp/GetEquipmentDataFilteredByColumn",
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
          "/api/WalkDownApp/AddEquipmentTag",
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

  const addWalkdownSchedule = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("Schedule is adding...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/WalkDownApp/CreateSchedule",
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

  const deleteWalkdownSchedule = useCallback(
    async (scheduleId) => {
      const toastId = toast.loading("Schedule is deleting...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete("/api/WalkDownApp/DeleteSchedule", {
          params: {
            scheduleId,
          },
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          cancelToken: source.token,
        });
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
          render: "Walkdown schedule deletion failed",
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

  const addWalkdownUser = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("User is adding...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/WalkDownApp/CreateUser",
          bodyParams,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        if (
          response?.data ===
          "Cannot create user. Please check email or password."
        ) {
          toast.update(toastId, {
            render: response?.data,
            type: "error",
            isLoading: false,
            autoClose: 3000,
            closeButton: true,
          });
          return;
        }
        toast.update(toastId, {
          render: "User added successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render:
            error.response.data ||
            "Cannot create user. Please check email or password.",
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

  const updateWalkdownUser = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("User is updating...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.put(
          "/api/WalkDownApp/UpdateUser",
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
          render: "User updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: error.response?.data || "User update failed",
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

  const deleteWalkdownUser = useCallback(
    async (user) => {
      const toastId = toast.loading("User is deleting...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete("/api/WalkDownApp/DeleteUser", {
          params: {
            user,
          },
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          cancelToken: source.token,
        });
        toast.update(toastId, {
          render: "User deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "User delete failed",
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
    async (equipmentWalkdownId) => {
      const toastId = toast.loading("Scheduled tag is deleting...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.delete(
          "/api/WalkDownApp/DeleteEquipmentFromSchedule",
          {
            params: {
              equipmentWalkdownId,
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

  const updateScheduleStatus = useCallback(
    async (bodyParams) => {
      const notification =
        bodyParams.length === 1
          ? "Status is updating..."
          : "Statuses are updating...";
      const toastId = toast.loading(notification);
      try {
        const accessToken = await getAccessToken();
        let response = await api.put(
          "/api/WalkDownApp/UpdateScheduleStatus",
          bodyParams,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        const notification =
          bodyParams.length === 1
            ? "Status updated successfully"
            : "Statuses updated successfully";
        toast.update(toastId, {
          render: notification,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: `${
            bodyParams.length === 1 ? "Status" : "Statuses"
          } update failed`,
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

  const updateScheduleEquipment = useCallback(
    async (updatedStatuses, equipmentImageIds) => {
      const accessToken = await getAccessToken();
      const toastId = toast.loading("Schedule equipment is updating...");
      axios
        .all([
          api.put("/api/WalkDownApp/UpdateScheduleStatus", updatedStatuses, {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }),
          api.delete("/api/EquipmentImage/DeleteEquipmentImage", {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
              equipmentImageIds,
            },
            cancelToken: source.token,
          }),
        ])
        .then((data) => {
          toast.update(toastId, {
            render: "Schedule equipment updated successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            closeButton: true,
          });
        })
        .catch((error) => {
          toast.update(toastId, {
            render: "Schedule equipment update failed",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            closeButton: true,
          });
          console.log(error);
        });
    },
    [getAccessToken]
  );

  const getFieldEngineers = useCallback(async () => {
    try {
      const accessToken = await getGraphAccessToken();
      const users = await axios.get(
        `https://graph.microsoft.com/v1.0/groups/${process.env.REACT_APP_FIELD_ENGINEERS_GROUP_ID}/members`,
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
      toast.error("Something went wrong or field engineers not found");
    }
  }, [getGraphAccessToken]);

  const getWalkdownCoordinators = useCallback(async () => {
    try {
      const accessToken = await getGraphAccessToken();
      const users = await axios.get(
        `https://graph.microsoft.com/v1.0/groups/${process.env.REACT_APP_WALKDOWN_COORDINATORS_GROUP_ID}/members`,
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
      toast.error("Something went wrong or walkdown coordinators not found");
    }
  }, [getGraphAccessToken]);

  return {
    addWalkdownUser,
    getNotScheduledEquipmentTags,
    addEquipmentTags,
    getWalkdownUsers,
    deleteWalkdownUser,
    updateWalkdownUser,
    addWalkdownSchedule,
    getWalkdownSchedules,
    updateScheduleStatus,
    getFieldEngineers,
    getWalkdownCoordinators,
    deleteWalkdownSchedule,
    deleteScheduleEquipment,
    updateScheduleEquipment,
    getWalkdownEquipmentImages,
    getWalkdownScheduleEquipment,
    deleteWalkdownEquipmentImages,
    getEquipmentDataFilteredByColumn,
    getWalkdownScheduleOwnerByScheduleId,
  };
};
