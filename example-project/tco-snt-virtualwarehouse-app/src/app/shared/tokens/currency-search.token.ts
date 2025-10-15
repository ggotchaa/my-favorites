import { InjectionToken } from "@angular/core";
import { CurrencyDto } from "src/app/api/GCPClient";
import { IFilliable } from "src/app/model/interfaces/IFillable";
import { IFilliableNonOption } from "src/app/model/interfaces/IFillableNonOption";
import { ISearchable } from "src/app/model/interfaces/ISearchable";

export const CurrencySearchToken = new InjectionToken<ISearchable<CurrencyDto, string>>('CurrencySearchToken');
export const CurrencyFillableToken = new InjectionToken<IFilliable<CurrencyDto, string> | IFilliableNonOption<CurrencyDto, string>>('CurrencyFillableToken')
