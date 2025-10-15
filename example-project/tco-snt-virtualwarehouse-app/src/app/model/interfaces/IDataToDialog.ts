import { GroupRolesDto } from "src/app/api/GCPClient";
import { SelectedView } from "./ISelectedView";

export interface IDataToDialog {
    roleGroup?: GroupRolesDto,
    action: SelectedView
  }
