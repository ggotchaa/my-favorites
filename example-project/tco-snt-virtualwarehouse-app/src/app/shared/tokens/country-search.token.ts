import { InjectionToken } from "@angular/core";
import { CountryDto } from "src/app/api/GCPClient";
import { IFilliable } from "src/app/model/interfaces/IFillable";
import { IFilliableNonOption } from "src/app/model/interfaces/IFillableNonOption";
import { ISearchable } from "src/app/model/interfaces/ISearchable";

export const CountrySearchToken = new InjectionToken<ISearchable<CountryDto, string>>('CountrySearchToken');
export const CountryFillableToken = new InjectionToken<IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>>('CountryFillableToken');
