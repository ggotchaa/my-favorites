export const SCHEDULES_TABLE_COLUMNS = [
  {
    id: "walkdownScheduleMasterPk",
    label: "Schedule ID",
    width: 120,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "plannedStartDate",
    label: "Planned start date",
    width: 250,
    isVisible: true,
    order: 2,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "plannedCompletionDate",
    label: "Planned end date",
    width: 250,
    isVisible: true,
    order: 3,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "scheduleModifiedDate",
    label: "Modified date",
    width: 250,
    isVisible: true,
    order: 4,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "user",
    label: "User",
    width: 250,
    isVisible: true,
    order: 5,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "numberOfTagsByStatus",
    label: "Number of tags",
    width: 200,
    isVisible: true,
    order: 6,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "actions",
    label: "Actions",
    width: 200,
    isVisible: true,
    order: 7,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
];

export const USERS_TABLE_COLUMNS = [
  {
    id: "userPk",
    label: "User ID",
    width: 100,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "firstName",
    label: "Name",
    width: 250,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "lastName",
    label: "Surname",
    width: 250,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "email",
    label: "E-mail",
    width: 500,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "isAdmin",
    label: "Admin role",
    width: 150,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "center",
  },
  {
    id: "actions",
    label: "Actions",
    width: 120,
    isVisible: true,
    order: 6,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
];

export const WALKDOWN_SCHEDULE_TABLE_COLUMNS = [
  {
    id: "index",
    label: "#",
    width: 50,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "equipmentTag",
    label: "Tag",
    width: 200,
    isVisible: true,
    order: 2,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "pictures",
    label: "Pictures",
    width: 400,
    isVisible: true,
    order: 3,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "equipmentWalkdownStatus",
    label: "Status",
    width: 200,
    isVisible: true,
    order: 4,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "areaName",
    label: "Area",
    width: 120,
    isVisible: true,
    order: 5,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "unitName",
    label: "Unit",
    width: 140,
    isVisible: true,
    order: 6,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "actions",
    label: "Actions",
    width: 80,
    isVisible: true,
    order: 7,
    isChecked: true,
    isDisabled: false,
    align: "center",
  },
];

export const NOT_ASSIGNED_MOCKED_DATA = [
  {
    assetNumberPHK: "1",
    equipmentTag: "51-2200-RC-2204-2A",
    parentEquipmentTag: "51-2200-CD-2204A",
    areaName: "PBF",
    unitCode: "51-2200",
    acRanking: "Low Risk",
    icRanking: ".",
    piD: "0000-BBB-PID-000-HK2-00002-01",
    equipmentStatusName: "JDE E1 Original",
  },
  {
    assetNumberPHK: "2",
    equipmentTag: "91-3200-XGM-3202634",
    parentEquipmentTag: "91-3200-FZ-032",
    areaName: "SS",
    unitCode: "91-3200",
    acRanking: "Normal",
    icRanking: ".",
    piD: "O-3200-J-10128",
    equipmentStatusName: "JDE E1 Original",
  },
];

export const ASSIGN_TAGS_TABLE_COLUMNS = [
  {
    id: "equipmentTag",
    label: "Equipment tag",
    width: 100,
  },
  {
    id: "parentEquipmentTag",
    label: "Parent tag",
    width: 100,
  },
  {
    id: "areaName",
    label: "Area name",
    width: 100,
  },
  {
    id: "unitCode",
    label: "Unit code",
    width: 100,
  },
  {
    id: "ecRanking",
    label: "Equipment criticality",
    width: 100,
  },
  {
    id: "acRanking",
    label: "Asset criticality",
    width: 100,
  },
  {
    id: "icRanking",
    label: "Integrity criticality",
    width: 100,
  },
  {
    id: "piD",
    label: "PID",
    width: 160,
  },
  {
    id: "equipmentStatusName",
    label: "Enrichment status",
    width: 120,
  },
  {
    id: "checkbox",
    label: "",
    width: 40,
  },
];

export const TAG_SCHEDULE_STATUS = {
  IS_NOT_SCHEDULED: "tag is not scheduled",
  IS_SCHEDULED: "tag is scheduled",
  DOES_NOT_EXIST: "tag does not exist",
};

export const SCHEDULE_EQUIPMENT_STATUS = {
  PLANNED: "planned",
  SUBMITTED: "submitted",
  COMPLETED: "completed",
};

export const SCHEDULE_STATUS_OPTIONS = [
  {
    value: "planned",
    label: "planned",
  },
  {
    value: "submitted",
    label: "submitted",
  },
];

export const NOT_ASSIGNED_TAGS_FIELDS = {
  equipmentTag: "equipmentTag",
  parentEquipmentTag: "parentEquipmentTag",
  areaName: "areaCodeId",
  unitCode: "unitCodeId",
  acRanking: "acRanking",
  ecRanking: "ecRanking",
  icRanking: "icRanking",
  piD: "piD",
  equipmentStatusName: "equipmentStatusId",
};

export const FILTER_CRITERIA_FIELDS = {
  equipmentTag: "EQUIPMENT_TAG",
  parentEquipmentTag: "PARENT_EQUIPMENT_TAG",
  areaName: "AREA_NAME",
  unitCode: "UNIT_CODE_BK",
  acRanking: "AC_RANKING",
  icRanking: "IC_RANKING",
  piD: "PID",
  equipmentStatusName: "STATUS_NAME",
};

export const SPECIAL_FILTER_FIELDS = {
  ecRanking: "eC_RANKING",
  acRanking: "aC_RANKING",
  icRanking: "iC_RANKING",
  equipmentStatusName: "equipmenT_STATUS",
};

export const EXCLUDED_STATUSES = [
  "Review by LTI",
  "Completed by LTI",
  "Internal QA/QC",
  "Ready for QA/QC",
  "Ready for JDE update",
  "ACD submitted",
  "ACD completed"
];
