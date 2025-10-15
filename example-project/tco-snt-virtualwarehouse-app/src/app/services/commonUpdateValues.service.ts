import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// Common service, which unites functionality about work with values from components logic
export class CommonUpdateValuesService {         
    public yesNoFromBoolean(boolValue){
        if (boolValue) return 'Да';
        return 'Нет'
      }
}
