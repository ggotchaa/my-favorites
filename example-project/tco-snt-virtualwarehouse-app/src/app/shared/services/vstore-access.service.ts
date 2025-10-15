import { Injectable } from '@angular/core';
import { TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';

@Injectable({
  providedIn: 'root'
})
export class VStoreAccessService {
  public isUserAllowedSntWithStores(userWarehouses: TaxpayerStoreSimpleDto[], storeIds: number[] | null[]): boolean {

    // if any storeId is not allowed for user then whole SNT is not allowed (null storeId means allowed)

    for (let i = 0; i < storeIds.length; i++) {      

      const storeId = storeIds[i];
      if (storeId == null) {
        continue;
      }

      let isFound = false;
      for (let k = 0; k < userWarehouses.length; k++) {
        if (userWarehouses[k].id == storeId) {
          isFound = true;
        }
      }

      if (!isFound) {
        return false;
      }
    }

    return true;
  };

}

