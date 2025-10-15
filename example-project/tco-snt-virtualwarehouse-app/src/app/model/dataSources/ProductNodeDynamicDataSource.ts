import { CollectionViewer, SelectionChange } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import { FlatTreeControl } from "@angular/cdk/tree";
import { BehaviorSubject, merge, Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { DictionariesClient } from "../../api/GCPClient";
import { ProductNode } from "../entities/Product/ProductNode";
import { ProductNodeDynamicData } from "../entities/Product/ProductNodeDynamicData";

export class ProductNodeDynamicDataSource implements DataSource<ProductNode> {

  public dynamicData: ProductNodeDynamicData;
  dataChange = new BehaviorSubject<ProductNode[]>([]);

  constructor(
    private _treeControl: FlatTreeControl<ProductNode>,
    public client: DictionariesClient) {
    this.dynamicData = new ProductNodeDynamicData(client);
  }

  get data(): ProductNode[] { return this.dataChange.value; }

  set data(value: ProductNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  connect(collectionViewer: CollectionViewer): Observable<ProductNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if ((change as SelectionChange<ProductNode>).added ||
        (change as SelectionChange<ProductNode>).removed) {
        this.handleTreeControl(change as SelectionChange<ProductNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void { 
    this.dataChange.complete();
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<ProductNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: ProductNode, expand: boolean) {

    const index = this.data.indexOf(node);

    if (!expand) {
      let count = 0;
      for (let i = index + 1; i < this.data.length
        && this.data[i].level > node.level; i++, count++) { }
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);

      return;
    }

    node.isLoading = true;

    this.dynamicData.getChildren(node.fixedId, node.level)
      .subscribe(nodes => {

        if (!nodes || index < 0) { // If no children, or cannot find the node, no op
          return;
        }

        this.data.splice(index + 1, 0, ...nodes);

        // notify the change
        this.dataChange.next(this.data);
        node.isLoading = false;
      })
  }
}
