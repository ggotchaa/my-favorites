import { Inject, InjectionToken } from "@angular/core";
import { MeasureUnitDto } from "src/app/api/GCPClient";
import { IFilliable } from "src/app/model/interfaces/IFillable";
import { IFilliableNonOption } from "src/app/model/interfaces/IFillableNonOption";
import { ISearchable } from "src/app/model/interfaces/ISearchable";

export const MeasureUnitSearchToken = new InjectionToken<ISearchable<MeasureUnitDto, number>>('MeasureUnitSearchToken');
export const MeasureUnitFillableToken = new InjectionToken<IFilliable<MeasureUnitDto, number> | IFilliableNonOption<MeasureUnitDto, number>>('MeasureUnitFillableToken')