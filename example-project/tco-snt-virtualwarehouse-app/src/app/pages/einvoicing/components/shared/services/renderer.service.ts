import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { ApReconciliationStatus, ReconciliationStatus } from "src/app/api/GCPClient";
import { ApReconciliationStatusesEnum } from "src/app/model/enums/ApReconciliationStatusesEnum";
import { ArReconciliationStatusesEnum } from "src/app/model/enums/ArReconciliationStatusesEnum";
import { InvoiceModuleMode } from "src/app/model/enums/InvoiceModuleTypes";
import { Utilities } from "src/app/shared/helpers/Utils";
import { SharedInvoiceModule } from '../../shared/shared-invoice.module';

@Injectable(
)
export class RendererService {

    private renderer: Renderer2

    constructor(
        private rendererFactory: RendererFactory2,
    ) {
        this.renderer = rendererFactory.createRenderer(null, null)
    }

    public defineColourForReconcilationStatusFilter(val : string, htmlElement: HTMLElement, mode: InvoiceModuleMode, index: number): void{
        /**
         * IMPORTANT!!! The order of cssClassesForAr and cssClassesForAp must be the same as in 
         * ArReconciliationStatusesEnum and ApReconciliationStatusesEnum respectively
         */
        const cssClassesForAr = ['noMatchAr', 'nonReconciled', 'reconciled'];
        const cssClassesForAp = ['noMatchAp', 'matchReconciled', 'allMatchReconciled', 'matchDiffCurrency', 'allMatchDiffCurrency', 'matchNotReconciled', 'allMatchNotReconciled'];
        // IMPORTANT!!!

        if (!Utilities.isEmptyValue(val) &&
            mode == InvoiceModuleMode.ARModule) {
            if(val == ArReconciliationStatusesEnum[index]){
                this.renderer.addClass(htmlElement, cssClassesForAr[index])
            }
        }  
        
        if (!Utilities.isEmptyValue(val) &&
        mode != InvoiceModuleMode.ARModule){
            if(val == ApReconciliationStatusesEnum[index]){
                this.renderer.addClass(htmlElement, cssClassesForAp[index]);
            }
        }
            
    }
}