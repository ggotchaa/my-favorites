import { USER_ROLE_ID } from "./environment";

export const EQUIPMENT_STATUS = {
  JDE_E1_ORIGINAL: "JDE E1 original",
  IN_SCOPE_OF_DATA_SCRAPPING: "In scope of data scrapping",
  IN_SCOPE_OF_DATA_SCRAPING: "In scope of data scraping", // issue from BE, status comes with typo
  DATA_SCRAPPING_COMPLETED: "Data scrapping completed",
  DATA_SCRAPING_COMPLETED: "Data scraping completed", // issue from BE, status comes with typo
  IN_SCOPE_FOR_ENRICHMENT: "In scope for enrichment",
  ENRICHMENT_COMPLETED: "Enrichment completed",
  UNDER_DISCIPLINE_SME_REVIEW: "Under discipline SME review",
  DISCIPLINE_SME_REVIEW_COMPLETED: "Discipline SME review completed",
  ACD_COMPLETED: "ACD completed",
  ACD_SUBMITTED: "ACD submitted",
  UNCONFIRMED: "Unconfirmed",
  READY_FOR_JDE_UPDATE: "Ready for JDE update",
  UPDATED_BY_DC: "Updated by DS",
  UPDATED_BY_LTI: "Updated by LTI",
  RETURN_TO_DC: "Return to DC",
  REVIEW_BY_LTI: "Review by LTI",
  REVIEW_BY_DC: "Review by DC",
  READY_FOR_QA_QC: "Ready for QA/QC",
  COMPLETED_BY_LTI: "Completed by LTI",
  REVIEW_BY_ARCHIVE: "Review by Archive",
  REVIEW_BY_FV: "Review by FV",
};

export const EQUIPMENT_CRITICALITY = {
  LOW: "Low",
  NORMAL: "Normal",
  CRITICAL: "Critical",
  NOT_APPLICABLE: "Not applicable",
};

export const FILTER_SOURCE = {
  JDE_DATA: "JDE_DATA",
  MATERIALS_MANAGEMENT: "MATERIALS_MANAGEMENT",
};

export const ENTER_KEY = "Enter";

export const FILE_FORMAT = {
  CSV: "csv",
  EXCEL: "xlsx",
};

export const FILTER_FREQUENCY = 3;

export const STATUS_TYPE = {
  ATTRIBUTE_STATUS: "EquipmentCharacteristicStatus",
  EQUIPMENT_STATUS: "EquipmentStatus",
};

export const ALLOWED_ACTIONS_BY_USER_ROLE = {
  [USER_ROLE_ID.RestrictedUser]: {
    jde: false, // jde data tab
    mes: false, // jde data tab
    wm: false, // Walkdown management tab
    monitor: false, // Monitor tab
    mm: false, // Materials Management tab
    all: false, // All actions enabled or disabled
    em: false, // Enrichment Management tab
  },
  [USER_ROLE_ID.Admin]: {
    jde: true,
    mes: true,
    wm: true,
    monitor: true,
    mm: true,
    all: true,
    em: true,
  },
  [USER_ROLE_ID.DataTeamUser]: {
    jde: false,
    mes: false,
    wm: false,
    monitor: true,
    mm: true,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.EnrichmentUser]: {
    jde: true,
    mes: true,
    wm: false,
    monitor: true,
    mm: true,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.MMSystemAnalyst]: {
    jde: false,
    mes: false,
    wm: false,
    monitor: true,
    mm: true,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.SMEUser]: {
    jde: true,
    mes: true,
    wm: false,
    monitor: true,
    mm: true,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.FieldEngineers]: {
    jde: false,
    mes: false,
    wm: false,
    monitor: false,
    mm: false,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.WalkdownCoordinator]: {
    jde: false,
    mes: false,
    wm: true,
    monitor: true,
    mm: false,
    all: false,
    em: false,
  },
  [USER_ROLE_ID.EnrichmentCoordinator]: {
    jde: true,
    mes: true,
    wm: false,
    monitor: true,
    mm: false,
    all: false,
    em: true,
  },
  [USER_ROLE_ID.QAEngineer]: {
    jde: true,
    mes: true,
    wm: false,
    monitor: true,
    mm: false,
    all: false,
    em: false,
  },
};
