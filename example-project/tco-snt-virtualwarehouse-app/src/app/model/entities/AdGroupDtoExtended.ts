import { Inject, Injectable } from "@angular/core";
import { AdGroupDto, IAdGroupDto, RoleType } from "src/app/api/GCPClient";
import { IAdapter } from "../interfaces/IAdapter";
import { IAdGroupDtoExtended } from "../interfaces/IAdGroupDtoExtended";

export class AdGroupDtoExtended extends AdGroupDto implements IAdGroupDtoExtended {
    roles: RoleType[];

    constructor(data?: IAdGroupDtoExtended) {
        super(data);
    }
}
export class AdGroupDtoExtendedAdapter implements IAdapter<AdGroupDtoExtended, AdGroupDto>{
    adapt(item: AdGroupDto): AdGroupDtoExtended {
        const data: IAdGroupDtoExtended = {
            name: item.name,
            id: item.id,
            roles: []
        }
        return new  AdGroupDtoExtended(data)
    }
   
    
}
