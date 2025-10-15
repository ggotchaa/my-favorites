import { IAdGroupDto, RoleType } from "src/app/api/GCPClient";

export interface IAdGroupDtoExtended extends IAdGroupDto{
    roles: RoleType[]
}
