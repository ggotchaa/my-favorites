import { Injectable } from "@angular/core";
import { UntypedFormArray } from "@angular/forms";

@Injectable()
export class SntProductFormService {
    getVadSum(element) {
        const vadRate = element.get('vadRate').value;
        if (!vadRate) return 0;
    
        return this.getSum(element) * vadRate / 100;
      }

      getExciseSum(element) {
        const exciseRate = element.get('exciseRate').value;
        if (!exciseRate) return 0;
        
        return element.get('quantity').value * exciseRate;
      }

      getTotalSumWithIndirectTaxes(element) {
        return this.getSum(element) + this.getVadSum(element);
      }

      getTotalSumWithIndirectTaxesAndExciseSum(element) {
        return this.getSum(element) + this.getVadSum(element) + this.getExciseSum(element);
      }
    
      getSum(element) {
        return element.get('quantity').value * element.get('price').value;
      }

      calculateTotal(formControlName: string, productsArrayForm: UntypedFormArray): number | string {
              let sum = 0;
              
              if (formControlName == 'sum') {
                  productsArrayForm.controls.forEach(p => { sum +=  +(p.get('sum').value) });
              }
              else if (formControlName == 'vadSum') {
                  productsArrayForm.controls.forEach(p => { sum += +(p.get('vadSum').value) }); 
              }
              else if (formControlName == 'exciseSum') {
                productsArrayForm.controls.forEach(p => { sum += +(p.get('exciseSum').value) }); 
              } 
              else if (formControlName == 'totalSumWithIndirectTaxes') {
                  productsArrayForm.controls.forEach(p => { sum += +(p.get('totalSumWithIndirectTaxes').value) });
              }
              return sum > 0 ? sum.toFixed(2) : "";
          }
}