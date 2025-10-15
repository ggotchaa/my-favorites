import { Observable, Subject } from "rxjs";
import { UFormClient } from "src/app/api/GCPClient";
import { DataSourceBaseEntity } from "src/app/model/DataSourceBaseEntity";
import { IFormProduct } from "src/app/model/interfaces/IFormProduct";

export class UFormProductTableDataSource extends DataSourceBaseEntity<IFormProduct, UFormClient> {
  subscription$: Subject<void> = new Subject<void>();
  
  private products: IFormProduct[];

  public loading = this.loadingSubject.asObservable();
  constructor(){
    super()
  }

  loadSubjects(): Observable<IFormProduct[]> {
    throw new Error("Method not implemented.");
  }

  loadProducts(products: IFormProduct[]){
    this.products = products;
    this.passProducts()
  }

  passProducts(){
    this.dataSourceSubjects.next(this.products);
    this.allSourceSubjects = this.dataSourceSubjects.value;
  }

  clearProducts() {
    this.products = [];
    this.passProducts();
  }  
}
