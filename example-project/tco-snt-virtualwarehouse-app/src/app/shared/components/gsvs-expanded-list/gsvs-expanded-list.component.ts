import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { DictionariesClient, GsvsType, ProductDto } from '../../../api/GCPClient';
import { ProductNodeDynamicDataSource } from '../../../model/dataSources/ProductNodeDynamicDataSource';
import { ProductNode } from '../../../model/entities/Product/ProductNode';
import { ProductNodeDynamicData } from '../../../model/entities/Product/ProductNodeDynamicData';
import { GsvsFilter } from '../gsvs-filters/gsvsFilter.model';
import { ProductSelectGsvsComponent } from '../product-select-gsvs/product-select-gsvs.component';

@Component({
    selector: 'app-gsvs-expanded-list',
    templateUrl: './gsvs-expanded-list.component.html',
    styleUrls: ['./gsvs-expanded-list.component.scss'],
    standalone: false
})

export class GsvsExpandedListComponent implements OnInit {
  loading = true;
  @Input() canSelectProduct = false;
  @Output() selectProductEvent = new EventEmitter<ProductDto>();

  dataSource: ProductNodeDynamicDataSource;

  constructor(
    private client: DictionariesClient) {
    this.treeControl = new FlatTreeControl<ProductNode>(this.getLevel, this.isExpandable);
    this.dataSource = new ProductNodeDynamicDataSource(this.treeControl, client);
  }
  ngOnInit(): void {
    this.loadProducts();
  }

  treeControl: FlatTreeControl<ProductNode>;

  getLevel = (node: ProductNode) => node.level;

  isExpandable = (_node: ProductNode) => true;

  hasChild = (_: number, _nodeData: ProductNode) => true;


  selectProduct(node: ProductNode) {
    this.selectProductEvent.emit(<ProductDto>node);
  }

  loadProducts() {
    this.dataSource.dynamicData.load()
      .subscribe(productNodes => {
        this.dataSource.data = productNodes;
        this.loading = false;
      });
  }

  filterProducts(filter: GsvsFilter) {
    this.loading = true;

    this.dataSource.dynamicData.search(filter)
      .subscribe(productNodes => {
        this.treeControl = new FlatTreeControl<ProductNode>(this.getLevel, this.isExpandable);
        this.dataSource = new ProductNodeDynamicDataSource(this.treeControl, this.client)
        this.dataSource.data = productNodes;
        this.loading = false;
      })
  }

  nodeBackgroundColorClass(node: ProductNode) {
    if (node.isGtinNode) return 'gtin-node';
    if (node.isTnvedNode) return 'tnved-node';
    if (this.treeControl.isExpanded(node)) return 'open-node';
    return '';
  }
}
