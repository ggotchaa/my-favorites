import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SharedModule } from "src/app/shared/shared.module";
import { DictionariesClient } from "../../../api/GCPClient";
import { GsvsFilter } from "../../../shared/components/gsvs-filters/gsvsFilter.model";
import { ProductNode } from "./ProductNode";

@Injectable()
export class ProductNodeDynamicData {

  constructor(private client: DictionariesClient) 
  { 
  }

  /** Initial data from database */
  load(): Observable<ProductNode[]> {
    return this.client.searchProducts()
      .pipe(map(products => products.map(product => new ProductNode(product, 0))));
  }

  getChildren(fixedId: number, level: number): Observable<ProductNode[]> | undefined {
    return this.client.getChildrenProducts(fixedId)
      .pipe(map(products => products.map(product => new ProductNode(product, level + 1, false))));
  }

  search(filter: GsvsFilter): Observable<ProductNode[]> {
    let isUseInVstore = filter.isUseInVstore === '' ? null : filter.isUseInVstore === true;
    let unique = filter.isUnique === '' ? null : filter.isUnique === true;
    let withdrawal = filter.isWithdrawal === '' ? null : filter.isWithdrawal === true;
    let twofoldPurpose = filter.isTwofoldPurpose === '' ? null : filter.isTwofoldPurpose === true;
    let sociallySignificant = filter.isSociallySignificant === '' ? null : filter.isSociallySignificant === true;
    let excisable = filter.isExcisable === '' ? null : filter.isExcisable === true;
    
    return this.client.searchProducts(filter.code, filter.name, isUseInVstore, unique, withdrawal, twofoldPurpose, sociallySignificant, excisable)
      .pipe(map(products => products.map(product => new ProductNode(product, 0))));
  }
}
