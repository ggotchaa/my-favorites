import axios from "axios";
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "react-toastify";

const source = axios.CancelToken.source();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL,
});

export const useMesData = () => {
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

  const getElements = useCallback(
    async (params) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get("/api/MesEquipment/GetElements", {
          params,
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
          cancelToken: source.token,
        });
        return response.data;
      } catch (error) {
        toast.error("Table data fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getUnifiedEquipmentTagCharacteristics = useCallback(
    async (assetNumberPhk) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          `/api/Equipment/GetUnifiedEquipmentTagCharacteristics?assetNumberPhk=${assetNumberPhk}`,
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
        toast.error("General JDE characteristics fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getEquipmentGeneralStatusDetails = useCallback(
    async (assetNumberPhk) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.get(
          `/api/Equipment/GetEquipmentGeneralStatusDetails?assetNumberPhk=${assetNumberPhk}`,
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
        toast.error("Enrichment status or comment fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getMDSCharacterictics = useCallback(
    async (equipmentTagId, isGeneralChar) => {
      try {
        const accessToken = await getAccessToken();
        // Use URL template literal to avoid automatic encoding of equipmentTagId
        let response = await api.get(
          `/api/Equipment/GetMdsEquipmentTagCharacteristics?equipmentTagId=${equipmentTagId}&isGeneralChar=${isGeneralChar}`,
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
        toast.error("General MDS characteristics fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getPlannerGroupOptions = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get("/api/Dictionaries/GetPlannerGroupOptions", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
      });
      return response.data;
    } catch (error) {
      toast.error("Planner options fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getCostCenterOptions = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get("/api/Dictionaries/GetCostCenterOptions", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
      });
      return response.data;
    } catch (error) {
      toast.error("Cost center options fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getManufacturerOptions = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get(
        "/api/Dictionaries/GetAllEquipmentManufacturers",
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
      toast.error("Manufacturer options fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getEquipmentStatuses = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get(
        "/api/Dictionaries/GetCharacteristicStatus",
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
      toast.error("Enrichment statuses fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getClassSpecificEquipments = useCallback(
    async (equipmentTagId) => {
      try {
        const accessToken = await getAccessToken();
        // Use URL template literal to avoid automatic encoding of equipmentTagId
        let response = await api.get(
          `/api/Characteristics/GetGeneralEquipmentTagId?equipmentTagId=${equipmentTagId}`,
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
        toast.error("Class specific characteristics fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getWalkdownPictures = useCallback(
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
        toast.error("Walkdown pictures fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getAreaAndUnitCodes = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get("/api/Dictionaries/GetAreaCode", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
      });
      return response.data;
    } catch (error) {
      toast.error("Area and unit codes fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getCategoriesList = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get("/api/Dictionaries/GetCategoriesList", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source.token,
      });
      return response.data;
    } catch (error) {
      toast.error("Categories fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getElementsByColumn = useCallback(
    async (columnName) => {
      try {
        const accessToken = await getAccessToken();
        // Use URL template literal to avoid automatic encoding of columnName
        let response = await api.get(
          `/api/Equipment/GetAllDataByColumn?columnName=${columnName}`,
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
        toast.error("Column results fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const addNewManufacturer = useCallback(
    async (bodyParams) => {
      const toastId = toast.loading("Manufacturer is adding...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/Equipment/AddNewEquipmentManufacturer",
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: "Manufacturer added successfully",
          type: "success",
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong or manufacturer already exists",
          type: "error",
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const updateWalkdownEquipmentTagCharacteristics = useCallback(
    async (bodyParams, assetNumberPhk) => {
      let toastId;
      try {
        const accessToken = await getAccessToken();
        toastId = toast.loading("Characteristics are updating...");
        let response = await api.post(
          `/api/Equipment/UpdateWalkdownEquipmentTagCharacteristics/${assetNumberPhk}`,
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        if (response) {
          if (response.status === 200) {
            toast.update(toastId, {
              render: "Equipment data updated successfully",
              type: "success",
              isLoading: false,
              autoClose: 5000,
              closeButton: true,
            });
            return response;
          }
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const updateEquipmentGeneralStatusDetails = useCallback(
    async (bodyParams, userId) => {
      let toastId;
      try {
        const accessToken = await getAccessToken();
        toastId = toast.loading("Equipment data is updating...");
        let response = await api.post(
          `/api/Equipment/UpdateEquipmentGeneralStatusDetails?userId=${userId}`,
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        if (response) {
          if (response.status === 200) {
            toast.update(toastId, {
              render: "Equipment data updated successfully",
              type: "success",
              isLoading: false,
              autoClose: 5000,
              closeButton: true,
            });
            return response;
          }
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const deleteEquipmentTagWithCharacteristics = useCallback(
    async (assetNumberPhk) => {
      let toastId;
      try {
        const accessToken = await getAccessToken();
        toastId = toast.loading("Equipment tag is deleting...");
        await api.delete(
          `/api/Equipment/DeleteEquipmentTagWithCharacteristics/${assetNumberPhk}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        toast.update(toastId, {
          render: "Equipment tag deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const updateMdsEquipmentTagCharacteristics = useCallback(
    async (bodyParams) => {
      let toastId;
      try {
        const accessToken = await getAccessToken();
        toastId = toast.loading("Characteristics are updating...");
        let response = await api.post(
          "/api/Equipment/UpdateMdsEquipmentTagCharacteristics",
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        if (response) {
          if (response.status === 200) {
            toast.update(toastId, {
              render: "Equipment data updated successfully",
              type: "success",
              isLoading: false,
              autoClose: 5000,
              closeButton: true,
            });
            return response;
          }
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const bulkUpdateEquipmentDetails = useCallback(
    async (bodyParams) => {
      let toastId;
      try {
        const accessToken = await getAccessToken();
        toastId = toast.loading("Characteristics are updating...");
        let response = await api.post(
          "/api/Equipment/BulkUpdateEquipmentDetails",
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        if (response) {
          if (response.status === 200) {
            toast.update(toastId, {
              render: "Equipment data updated successfully",
              type: "success",
              isLoading: false,
              autoClose: 5000,
              closeButton: true,
            });
            return response;
          }
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const uploadEquipmentImages = useCallback(
    async (assetNumberPhk, body) => {
      const toastId = toast.loading("Images are uploading...");
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          `/api/EquipmentImage/UploadImages/${assetNumberPhk}`,
          body,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );
        toast.update(toastId, {
          render: "Images uploaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
        });
        return response.data;
      } catch (error) {
        toast.update(toastId, {
          render: "Image upload failed",
          type: "error",
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const deleteWalkdownPictures = useCallback(
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
          render: "Something went wrong when image deletion",
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

  const addNewEquipTagWalkdownCharComment = useCallback(
    async (bodyParams, assetNumberPhk) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          `/api/Equipment/AddNewEquipTagWalkdownCharComment/${assetNumberPhk}`,
          bodyParams,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cancelToken: source.token,
          }
        );

        if (response) {
          if (response.status === 200) {
            toast.success("Equipment comment updated successfully");
            return response;
          }
        }
      } catch (error) {
        toast.error({
          render: "Comments update went wrong",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getClassesAndSubClasses = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      let response = await api.get(
        "/api/Dictionaries/GetClassesAndSubclasses",
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
      toast.error("Classes and sub-classes fetch failed");
      console.error(error);
    }
  }, [getAccessToken]);

  const getFilteredColumnData = useCallback(
    async (data) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          "/api/MesEquipment/GetFilteredColumnData",
          data,
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
        toast.error("Filtered column data fetch failed");
        console.error(error);
      }
    },
    [getAccessToken]
  );

  const getImageLinksBeforeUpload = useCallback(
    async (assetNumberPhk, file) => {
      try {
        const accessToken = await getAccessToken();
        let response = await api.post(
          `/api/EquipmentImage/Upload/${assetNumberPhk}`,
          file,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": file.type || "image/jpeg",
            },
            cancelToken: source.token,
          }
        );
        return response.data;
      } catch (error) {
        if (error.status === 413) {
          toast.error(
            "Some of the attached files exceed 50 Mb file size and cannot be processed"
          );
          return;
        }
        console.error("Failed to get image links:", error);
      }
    },
    [getAccessToken]
  );

  return {
    getElements,
    getCategoriesList,
    addNewManufacturer,
    getAreaAndUnitCodes,
    uploadEquipmentImages,
    deleteWalkdownPictures,
    getElementsByColumn,
    getWalkdownPictures,
    getEquipmentStatuses,
    bulkUpdateEquipmentDetails,
    getUnifiedEquipmentTagCharacteristics,
    getMDSCharacterictics,
    getCostCenterOptions,
    getPlannerGroupOptions,
    getManufacturerOptions,
    getClassSpecificEquipments,
    getEquipmentGeneralStatusDetails,
    updateWalkdownEquipmentTagCharacteristics,
    updateMdsEquipmentTagCharacteristics,
    updateEquipmentGeneralStatusDetails,
    addNewEquipTagWalkdownCharComment,
    getClassesAndSubClasses,
    deleteEquipmentTagWithCharacteristics,
    getFilteredColumnData,
    getImageLinksBeforeUpload,
  };
};
