import { Injectable } from "@angular/core";
import { UntypedFormArray } from "@angular/forms";

@Injectable()
export class InvoiceProductFormService {
    getSum(unitPrice: number, quantity: number): number {
        return unitPrice * quantity
    }

    calculateTotal(formControlName: string, productsArrayForm: UntypedFormArray): number | string {
        let sum = 0;
        
        if (formControlName == 'sum') {
            productsArrayForm.controls.forEach(p => { sum +=  +(p.get('sum').value) });
        }
        else if (formControlName == 'vadSum') {
            productsArrayForm.controls.forEach(p => { sum += p.get('vadSum').value }); 
        }
        else if (formControlName == 'sumWithIndirectTaxes') {
            productsArrayForm.controls.forEach(p => { sum += p.get('sumWithIndirectTaxes').value });
        }
        else if (formControlName == 'salesAmount') {
            productsArrayForm.controls.forEach(p => { sum += +p.get('salesAmount').value });
        }

        return sum > 0 ? sum.toFixed(2) : "";
    }

    getVadSum(unitPrice: number, quantity: number, vadRate: number) {
        if (!vadRate) return 0;
        return this.getSum(unitPrice, quantity) * vadRate / 100;
    }

    getSumWithIndirectTaxes(unitPrice: number, quantity: number, vadRate: number) {
        return this.getSum(unitPrice, quantity) + this.getVadSum(unitPrice, quantity, vadRate);
    }
    
    getVadSumWithoutUnit(vadRate: number, sum: number){
        return sum * (vadRate / 100);
    }

    getSumWithIndirectTaxesWithoutUnit(vadRate: number, sum: number) {
        return sum + sum * (vadRate / 100);
    }
}