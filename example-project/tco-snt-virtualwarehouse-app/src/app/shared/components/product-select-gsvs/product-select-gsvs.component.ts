import { Component, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ProductDto} from 'src/app/api/GCPClient';
import { GSVSTableDataSource } from 'src/app/model/dataSources/GSVSTableDataSource';
import { GsvsExpandedListComponent } from '../gsvs-expanded-list/gsvs-expanded-list.component';
import { GsvsFilter } from '../gsvs-filters/gsvsFilter.model';

@Component({
    selector: 'app-product-select',
    templateUrl: './product-select-gsvs.component.html',
    styleUrls: ['./product-select-gsvs.component.scss'],
    providers: [GSVSTableDataSource],
    standalone: false
})

export class ProductSelectGsvsComponent{

  @ViewChild(GsvsExpandedListComponent) gsvsExpandedListComponent: GsvsExpandedListComponent;

  constructor(
    public dialogRef: MatDialogRef<ProductSelectGsvsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){}  

  selectProduct(product: ProductDto): void{
      this.dialogRef.close(product);    
  }

  closeDialog(): void{
    this.dialogRef.close();
  }

  onGsvsFilter(filter: GsvsFilter) {
    this.gsvsExpandedListComponent.filterProducts(filter);
  }
}
