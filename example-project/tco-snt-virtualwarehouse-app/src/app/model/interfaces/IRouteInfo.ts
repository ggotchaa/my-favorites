import { RoleType } from "src/app/api/GCPClient";

export interface IRouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    roles?: RoleType[]
}