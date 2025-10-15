import { EQUIPMENT_STATUS, STATUS_TYPE } from "../constants/global";
import { StatusAlert } from "../components/common/StatusAlert";
import Looks3Icon from "@mui/icons-material/Looks3Rounded";
import LooksOneIcon from "@mui/icons-material/LooksOneRounded";
import Looks2Icon from "@mui/icons-material/LooksTwoRounded";
import Looks4Icon from "@mui/icons-material/Looks4Rounded";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { write, utils } from "xlsx";
import {
  STORAGE_ACCOUNT_NAME,
  STORAGE_ACCOUNT_TOKEN,
} from "../constants/environment";

export const getFormattedDate = (date) => {
  if (date) {
    return dayjs(date).format("DD/MM/YYYY");
  } else {
    return <StatusAlert value="Not Found" severity="warning" />;
  }
};

export const getFormattedCategories = (data = []) => {
  return data.reduce((result, row) => {
    let category = result.find((item) => item.id === row.mdsCategoryPhk);

    if (!category) {
      category = {
        id: row.mdsCategoryPhk,
        title: row.mdsCategoryName,
        children: [],
      };
      result.push(category);
    }

    let objectType = category.children.find(
      (item) => item.id === row.mdsClassificationPhk
    );

    if (!objectType) {
      objectType = {
        id: row.mdsClassificationPhk,
        title: row.mdsClassificationName,
        children: [],
      };
      category.children.push(objectType);
    }

    let classification = objectType.children.find(
      (item) => item.id === row.mdsSubClassificationPhk
    );

    if (!classification) {
      classification = {
        id: row.mdsSubClassificationPhk,
        title: row.mdsSubClassificationName,
        children: [],
      };
      objectType.children.push(classification);
    }

    return result;
  }, []);
};

export const getStatusSeverity = (value) => {
  switch (value) {
    case EQUIPMENT_STATUS.ACD_COMPLETED:
    case EQUIPMENT_STATUS.DATA_SCRAPPING_COMPLETED:
    case EQUIPMENT_STATUS.DATA_SCRAPING_COMPLETED:
    case EQUIPMENT_STATUS.DISCIPLINE_SME_REVIEW_COMPLETED:
    case EQUIPMENT_STATUS.ENRICHMENT_COMPLETED:
    case EQUIPMENT_STATUS.UPDATED_BY_DC:
    case EQUIPMENT_STATUS.UPDATED_BY_LTI:
    case EQUIPMENT_STATUS.COMPLETED_BY_LTI:
    case EQUIPMENT_STATUS.READY_FOR_JDE_UPDATE:
    case EQUIPMENT_STATUS.READY_FOR_QA_QC:
    case "completed":
      return "success";
    case "submitted":
      return "info";
    case EQUIPMENT_STATUS.JDE_E1_ORIGINAL:
    case EQUIPMENT_STATUS.UNDER_DISCIPLINE_SME_REVIEW:
    case EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPPING:
    case EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPING:
    case EQUIPMENT_STATUS.IN_SCOPE_FOR_ENRICHMENT:
    case "postponed":
      return "warning";
    case EQUIPMENT_STATUS.UNCONFIRMED:
    case "planned":
      return "error";
    default:
      return "warning";
  }
};

export const displayCellLabel = (label) => {
  if (typeof label === "string") {
    switch (label.trim()) {
      case ".":
      case "":
        return "Empty";
      default:
        return label;
    }
  } else {
    if (label === null || label === undefined) {
      return "Empty";
    }
    return label;
  }
};

export const displayCriticalily = (value) => {
  switch (value?.toLowerCase()) {
    case "low":
    case "low risk":
      return (
        <div className="flex items-center gap-1">
          <Looks3Icon htmlColor="#2e7d32" />
          {value}
        </div>
      );
    case "normal":
      return (
        <div className="flex items-center gap-1">
          <Looks2Icon htmlColor="#ed6c02" />
          {value}
        </div>
      );
    case "critical":
    case "high":
      return (
        <div className="flex items-center gap-1">
          <LooksOneIcon htmlColor="#f44336" />
          {value}
        </div>
      );
    case "not applicable":
      return (
        <div className="flex items-center gap-1">
          <Looks4Icon htmlColor="#e0e0e0" />
          {value}
        </div>
      );
    default:
      return displayCellLabel(value);
  }
};

export const capitalizeLetter = (word) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const groupImagesByEquipmentTag = (allImages) => {
  const tagImages = {};
  allImages.forEach((item) => {
    if (!tagImages[item.jdeEquipmentTag]) {
      tagImages[item.jdeEquipmentTag] = [item.equipmentImageInfo];
    } else {
      tagImages[item.jdeEquipmentTag].push(item.equipmentImageInfo);
    }
  });
  return tagImages;
};

export const getFormattedImageLink = (imageLink) => {
  return imageLink?.includes(STORAGE_ACCOUNT_NAME)
    ? `${imageLink}${STORAGE_ACCOUNT_TOKEN}`
    : imageLink;
};

export const getFilterColumns = (columns, filterColumns) => {
  const tableColumns = columns.filter((column) => column.isVisible);
  filterColumns.forEach((column) => {
    const match = tableColumns.find((item) => item.id === column.value);
    if (match) {
      column.isChecked = match.isChecked;
    }
  });
  return filterColumns.filter((column) => column.isChecked);
};

export const getAccessToken = async (accounts, instance, scope) => {
  if (accounts.length === 0) {
    console.error("User is not signed in");
  }
  const request = {
    scopes: [scope],
    account: accounts[0],
  };
  const authResult = await instance.acquireTokenSilent(request);
  return authResult.accessToken;
};

// export const getStatusesByUserRole = (userRole, statuses) => {
//   switch (userRole) {
//     case USER_ROLE.DATA_TEAM:
//       return statuses.filter(
//         (option) =>
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.DATA_SCRAPPING_COMPLETED ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.DATA_SCRAPING_COMPLETED
//       );
//     case USER_ROLE.SME:
//       return statuses.filter(
//         (option) =>
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.DISCIPLINE_SME_REVIEW_COMPLETED ||
//           option.characteristicStatusName === EQUIPMENT_STATUS.ACD_COMPLETED ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPPING ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPING ||
//           option.characteristicStatusName === EQUIPMENT_STATUS.UNCONFIRMED ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.DATA_SCRAPPING_COMPLETED ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.DATA_SCRAPING_COMPLETED
//       );
//     case USER_ROLE.ENRICHMENT_TEAM:
//       return statuses.filter(
//         (option) =>
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.ENRICHMENT_COMPLETED ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPPING ||
//           option.characteristicStatusName ===
//             EQUIPMENT_STATUS.IN_SCOPE_OF_DATA_SCRAPING ||
//           option.characteristicStatusName === EQUIPMENT_STATUS.UNCONFIRMED
//       );
//     default:
//       return statuses;
//   }
// };

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export const getStatusValue = (value, statuses) => {
  const status = statuses.find((option) => option.label === value);
  return status ? status.value : "";
};

export const getUpdatedCharsState = (equipmentTag, rows, state, statuses) => {
  const attributes = [];
  rows.forEach((field, index) => {
    const data = state[index];

    if (
      field.walkdownValue !== data.walkdownValue ||
      field.walkdownAttrStatusName !== data.walkdownAttrStatusName
    ) {
      attributes.push({
        statusCode: getStatusValue(data.walkdownAttrStatusName, statuses),
        characteristicsValue: data.walkdownValue,
        characteristicsName: data.jdeAttrName,
      });
    }
  });

  return attributes 
};

export const getUpdatedCommentsState = (commentsState, state) => {
  return commentsState.reduce((acc, newComment, index) => {
    const data = state[index];
    const originalComment =
      data.comments.find((comment) => comment.current)?.comment || "";
    if (originalComment !== newComment) {
      acc.push({
        commentHistoryPhk: data.jdeAttrCode,
        commentHistoryBk: data.walkdownAttrBk,
        comment: newComment,
      });
    } else {
      acc.push({
        commentHistoryPhk: data.jdeAttrCode,
        commentHistoryBk: data.walkdownAttrBk,
        comment: "",
      });
    }
    return acc;
  }, []);
};

export const getUpdatedMDSState = (rows, state, statuses) => {
  const params = [];
  rows.forEach((field, index) => {
    const data = state[index];
    for (const item in field) {
      if (field[item] !== data[item]) {
        params.push({
          mdsCharacteristicsPhk: data.mdsEquipmentTagCharPhk,
          characteristicsValue: data.characteristicValue,
          statusCode: getStatusValue(data.characteristicStatusName, statuses),
        });
      }
    }
  });
  return params;
};

export const getUpdatedSchedule = (initialState, updatedState) => {
  const changedItems = [];
  updatedState.forEach((updatedItem) => {
    const originalItem = initialState.find(
      (item) =>
        item.equipmentWalkdownSchedulePk ===
        updatedItem.equipmentWalkdownSchedulePk
    );
    if (
      originalItem &&
      originalItem.equipmentWalkdownStatus !==
        updatedItem.equipmentWalkdownStatus
    ) {
      changedItems.push({
        equipmentAssetNumberFhk: updatedItem.assetNumber,
        walkDownStatus: updatedItem.equipmentWalkdownStatus,
      });
    }
  });

  return changedItems;
};

export const getMMFilteredColumns = (tableFilter, filterParams) => {
  const tableFilters = tableFilter.map(({ column, operator, value }) => ({
    column: column.value,
    operator,
    value,
  }));
  const tableFilteredColums = tableFilters
    .map((item) => `${item.column}{,}${item.operator}{,}${item.value}`)
    .join("{;}");

  if (filterParams.FilteredColums) {
    return Array.from(
      new Set(
        (filterParams.FilteredColums + "{;}" + tableFilteredColums).split("{;}")
      )
    ).join("{;}");
  } else {
    return Array.from(new Set(tableFilteredColums.split("{;}"))).join("{;}");
  }
};

export const displayEmptyValue = (value) => {
  const emptyValues = [null, " ", ".", ""];
  if (
    emptyValues.includes(value) ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && !value.length)
  ) {
    return "Empty";
  }
  return value;
};

export const getJDEFilteredColumns = (tableFilter, filterParams) => {
  const tableFilters = tableFilter.map(({ column, operator, value }) => ({
    ColumnName: column.value,
    Operator: operator,
    Value: value,
  }));

  if (filterParams.FilteredColums) {
    const allFilteredColums = [...filterParams.FilteredColums, ...tableFilters];
    return Array.from(
      new Set(allFilteredColums.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item));
  } else {
    return Array.from(
      new Set(tableFilters.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item));
  }
};

const getMaterialsManagementDataToDownload = (response, columns) => {
  const dataToDownload = response.map((item) => {
    const data = {};
    columns.forEach((column) => {
      if (column.id === "manufacturerAndPartNumber") {
        data["Manufacturer"] = item.manufacturer;
        data["Part number"] = item.manufacturerPartNumber;
      }
      if (column.id in item) {
        data[column.label] = item[column.id];
      }
    });
    return data;
  });
  return dataToDownload;
};

const getJdeDataToDownload = (response, columns) => {
  const dataToDownload = response.map((item) => {
    const data = {};
    columns.forEach((column) => {
      if (column.id === "equipmenT_TAG_DESCRIPTION") {
        data["Description EN"] = item.equipmenT_TAG_DESCRIPTION;
      }
      if (column.id === "equipmenT_TAG_DESCRIPTION_RU") {
        data["Description RU"] = item.equipmenT_TAG_DESCRIPTION_RU;
      }
      if (column.id in item) {
        data[column.label] = item[column.id];
      }
    });
    return data;
  });
  return dataToDownload;
};

const downloadData = (dataToDownload, fileName, format) => {
  const worksheet = utils.json_to_sheet(dataToDownload);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = write(workbook, { bookType: format, type: "buffer" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.${format}`);
};

export const downloadMaterialsManagement = (
  response,
  columns,
  fileName,
  format
) => {
  const filteredColumns = columns.filter((column) => column.isChecked);
  const dataToDownload = getMaterialsManagementDataToDownload(
    response,
    filteredColumns
  );
  downloadData(dataToDownload, fileName, format);
};

export const downloadJdeData = (response, columns, fileName, format) => {
  const filteredColumns = columns.filter((column) => column.isChecked);
  const dataToDownload = getJdeDataToDownload(response, filteredColumns);
  downloadData(dataToDownload, fileName, format);
};

export const unitCodesGrouppedByArea = (response) => {
  return response.reduce(
    (acc, { areaCode, areaCodePhk, unitCode, unitName, unitCodePhk }) => {
      if (!acc[areaCode]) {
        acc[areaCode] = {
          areaCodePhk,
          unitCodes: [],
        };
      }
      acc[areaCode].unitCodes.push({
        value: unitCodePhk,
        label: `${unitCode} ${unitName}`,
      });
      return acc;
    },
    {}
  );
};

export const formatAreaCodes = (formattedResponse) => {
  return Object.keys(formattedResponse).map((areaCode) => ({
    label: areaCode,
    value: formattedResponse[areaCode].areaCodePhk,
  }));
};

export const getFormattedStatusList = (response) => {
  const equipmentStatusList = response.filter(
    (item) => item.statusType === STATUS_TYPE.EQUIPMENT_STATUS
  );
  const attrStatusList = response.filter(
    (item) => item.statusType === STATUS_TYPE.ATTRIBUTE_STATUS
  );
  const equipmentStatuses = equipmentStatusList.map((item) => ({
    label: item.characteristicStatusName,
    value: item.characteristicStatusPhk,
  }));
  const attrStatuses = attrStatusList.map((item) => ({
    label: item.characteristicStatusName,
    value: item.characteristicStatusPhk,
  }));

  return {
    equipmentStatuses,
    attrStatuses,
  };
};
