export enum SntButtonActions {
    CREATE = "CREATE",
    IMPORT = "IMPORT",
    VIEW = "VIEW",
    EDIT = "EDIT",
    CORRECT = "CORRECT",
    ACCEPT = "ACCEPT",
    REJECT = "REJECT",
    REVOKE = "REVOKE",
    REPORT = "REPORT",
    COPY = "COPY"
}

export type SntButtonVisibility = {
    [key in SntButtonActions]: boolean;
};