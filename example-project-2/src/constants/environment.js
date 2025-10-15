export const SCOPE = process.env.REACT_APP_BACKEND_SCOPE;

export const USER_ROLE_BY_ID = {
  [process.env.REACT_APP_RESTRICTED]: "Restricted user",
  [process.env.REACT_APP_DATA_TEAM]: "Data team user",
  [process.env.REACT_APP_ENRICHMENT]: "Enrichment user",
  [process.env.REACT_APP_SME]: "SME user",
  [process.env.REACT_APP_WALKDOWN_COORDINATOR]: "Walkdown coordinator",
  [process.env.REACT_APP_ADMIN]: "Admin",
  [process.env.REACT_APP_SYSTEM_ANALYST]: "MM system analyst",
  [process.env.REACT_APP_FIELD_ENGINEERS]: "Field engineer",
  [process.env.REACT_APP_ENRICHMENT_COORDINATOR]: "Enrichment coordinator",
  [process.env.REACT_APP_QA_ENGINEER]: "QA Engineer",
};

export const USER_ROLE_ID = {
  RestrictedUser: [process.env.REACT_APP_RESTRICTED],
  DataTeamUser: [process.env.REACT_APP_DATA_TEAM],
  EnrichmentUser: [process.env.REACT_APP_ENRICHMENT],
  SMEUser: [process.env.REACT_APP_SME],
  WalkdownCoordinator: [process.env.REACT_APP_WALKDOWN_COORDINATOR],
  Admin: [process.env.REACT_APP_ADMIN],
  MMSystemAnalyst: [process.env.REACT_APP_SYSTEM_ANALYST],
  FieldEngineers: [process.env.REACT_APP_FIELD_ENGINEERS],
  EnrichmentCoordinator: [process.env.REACT_APP_ENRICHMENT_COORDINATOR],
  QAEngineer: [process.env.REACT_APP_QA_ENGINEER],
};

export const USER_ROLE = {
  RESTRICTED: "Restricted user",
  DATA_TEAM: "Data team user",
  ENRICHMENT_TEAM: "Enrichment user",
  SME: "SME user",
  WALKDOWN_COORDINATOR: "Walkdown coordinator",
  ADMIN: "Admin",
  MM_SYSTEM_ANALYST: "MM system analyst",
  FIELD_ENGINEERS: "Field engineer",
  ENRICHMENT_COORDINATOR: "Enrichment coordinator",
  QA_ENGINEER: "QA Engineer",
};

export const RESOURCE_ID = process.env.REACT_APP_RESOURCE_ID;

export const STORAGE_ACCOUNT_TOKEN =
  process.env.REACT_APP_STORAGE_ACCOUNT_TOKEN;

export const STORAGE_ACCOUNT_NAME = process.env.REACT_APP_STORAGE_ACCOUNT_NAME;

export const USER_POLICY_ID = {
  [process.env.REACT_APP_SME]: 6,
  [process.env.REACT_APP_ADMIN]: 1,
  [process.env.REACT_APP_DATA_TEAM]: 2,
  [process.env.REACT_APP_ENRICHMENT]: 3,
  [process.env.REACT_APP_RESTRICTED]: 10,
  [process.env.REACT_APP_QA_ENGINEER]: 5,
  [process.env.REACT_APP_SYSTEM_ANALYST]: 8,
  [process.env.REACT_APP_FIELD_ENGINEERS]: 9,
  [process.env.REACT_APP_WALKDOWN_COORDINATOR]: 7,
  [process.env.REACT_APP_ENRICHMENT_COORDINATOR]: 4,
};
