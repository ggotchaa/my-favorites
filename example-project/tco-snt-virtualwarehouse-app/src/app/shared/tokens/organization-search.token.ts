import { InjectionToken } from "@angular/core";
import { GetSuppliersResultDto } from "src/app/api/GCPClient";
import { IFilliable } from "src/app/model/interfaces/IFillable";
import { ISearchable } from "src/app/model/interfaces/ISearchable";

export const OrganizationSearchToken = new InjectionToken<ISearchable<GetSuppliersResultDto, string>>('OrganizationSearchToken');
export const OrganizationFillableToken = new InjectionToken<IFilliable<GetSuppliersResultDto, string>>('OrganizationFillableToken');
