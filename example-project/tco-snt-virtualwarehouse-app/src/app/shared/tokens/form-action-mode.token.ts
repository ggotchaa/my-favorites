import { InjectionToken } from "@angular/core";
import { UFormType } from "src/app/api/GCPClient";
import { FormActionMode } from "src/app/model/enums/UForms/FormActionMode";

export const FORMACTIONMODE = new InjectionToken<FormActionMode>('FORM- ACTION-MODE');
export const FORMTYPE = new InjectionToken<UFormType>('FORMTYPE')
