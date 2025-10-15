import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { DictionariesClient, TaxpayerStoreClient, UFormClient, UserClient } from "src/app/api/GCPClient";
import { RoleAccessService } from "src/app/shared/services/role-access.service";
import { CommonDataService } from "../../../../shared/services/common-data.service";
import { FormSectionDValidators } from "../../form-sections/form-section-d/form-section-d.validators";
import { FormsFacade } from '../../forms.facade';
import { FormsService } from "../../forms.service";

@Injectable({ providedIn: 'root' })
export class FormsActionsDependenciesBase {
  formsForm: UntypedFormGroup;

  constructor(
    public uFormClient: UFormClient,
    public titleService: Title,
    public formBuilder: UntypedFormBuilder,
    public taxPayerApi: TaxpayerStoreClient,
    public measureUnitApi: DictionariesClient,
    public roleAccessService: RoleAccessService,
    public userApi: UserClient,
    public dialog: MatDialog,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public router: Router,
    public formsFacade: FormsFacade,
    public commonDataService: CommonDataService) {
    this.formsForm = this.formBuilder.group({
      id: [null],
      typeForm: ['', Validators.required],
      writeOffReason: ['', Validators.required],
      registrationNumber: [{ value: '', disabled: true }],
      dateFormation: [{ value: formatDate(new Date(), 'dd.MM.yyyy', 'en'), disabled: true }],
      numberDocument: ['', [Validators.required, Validators.maxLength(30)]],
      dateCreation: [new Date()],
      comment: [''],
      requisites: this.formBuilder.group({
        tin: [{ value: '', disabled: true }],
        name: [{ value: '', disabled: true }],
        address: [{ value: '', disabled: true }]
      }),
      warehouse: this.formBuilder.group({
        warehouseSelector: ['', Validators.required],
        receiverWarehouseSelector: ['', [Validators.required, FormSectionDValidators.receiverSameAsSenderWarehouse]],
        warehouseIdForm: [{ value: '', disabled: true }],
        receiverWarehouseIdForm: [{ value: '', disabled: true }],
        warehouseNameForm: [{ value: '', disabled: true }],
        receiverWarehouseNameForm: [{ value: '', disabled: true }],
      }),
      products: this.formBuilder.array([], [Validators.required]),
      sectionE2Products: this.formBuilder.array([], []),
      detailingType: []
    });
  }  
}
