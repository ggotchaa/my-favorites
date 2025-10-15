import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { COMPANY, KzCountry, KztCurrencyCode, KZPublicOfficeBik } from "src/app/model/GlobalConst";
import { CommonDataService } from "src/app/shared/services/common-data.service";
import { CustomDateValidators } from "src/app/shared/validators/CustomDateValidators";
import { InvoiceSectionAValidators } from "../../components/invoice-sections/invoice-section-a/invoice-section-a.validators";
import { InvoiceSectionBValidators } from "../../components/invoice-sections/invoice-section-b/invoice-section-b.validators";
import { InvoiceSectionCValidators } from "../../components/invoice-sections/invoice-section-c/invoice-section-c.validators";
import { InvoiceSectionC1Validators } from "../../components/invoice-sections/invoice-section-c1/invoice-section-c1.validators";
import { InvoiceSectionDValidators } from "../../components/invoice-sections/invoice-section-d/invoice-section-d.validators";
import { InvoiceSectionEValidators } from "../../components/invoice-sections/invoice-section-e/invoice-section-e.validators";
import { InvoiceSectionGValidators } from "../../components/invoice-sections/invoice-section-g/invoice-section-g.validators";
import { InvoiceFacade } from "../../invoice.facade";

@Injectable({ providedIn: 'root' })
export class InvoiceActionsDependenciesBase {
  draftInvoiceForm: UntypedFormGroup;
  constructor(
    public titleService: Title,
    public router: Router,
    public formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public route: ActivatedRoute,
    public commonDataService: CommonDataService,    
    public facade: InvoiceFacade
  ) {

    this.draftInvoiceForm = this.formBuilder.group({
      regNum : [''],
      num: ['', Validators.required],
      date: [
      { value: ''},
        [InvoiceSectionAValidators.dateRequired]
      ],
      turnoverDate: [
        '',
        [
          InvoiceSectionAValidators.dateRequired,
          CustomDateValidators.dateCantBeEarlierThanFiveYearsAndInFuture
        ]
      ],
      related: this.formBuilder.group({
        fixedInvoiceCheckBox: [{value: '', disabled: true}],
        additionalInvoiceCheckBox: [{value: '', disabled: true}],
        date : [{value: '', disabled: true}],
        num : [{value: '', disabled: true}],
        regNum : [{value: '', disabled: true}]
      }),
      deliveryTerm: this.formBuilder.group({
        contractNum: [''],
        contractDate: [''],
        accountNumber: [''],
        term: [''],
        transportTypeCode: [''],
        destination: [''],
        deliveryConditionCode: [''],
        hasContract: ['true'],
        warrant: [''],
        warrantDate: ['']
      }, {
        validators: [
          InvoiceSectionEValidators.hasContract,
        ]
      }),
      seller: this.formBuilder.group({
        tin: [{ value: COMPANY.tin, disabled: true }, [Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        name: [{ value: COMPANY.name, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        address: [{ value: COMPANY.address, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        certificateSeries: [{ value: COMPANY.certificateSeries, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        certificateNum: [{ value: COMPANY.certificateNum, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        commitentCheckBox: [''],
        brokerCheckBox: [''],
        forwarderCheckBox: [''],
        lessorCheckBox: [''],
        sharingAgreementParticipantCheckBox: [''],
        jointActivityParticipantCheckBox: [''],
        exporterCheckBox: [''],
        transporterCheckBox: [''],
        principalCheckBox: [''],
        statuses: [[]],
        trailer: [null],
        kbe: ['', [Validators.pattern(/^[0-9]{2}$/)]],
        iik: ['', [Validators.pattern(/^[A-Z0-9]{20}/)]],
        bik: ['', [Validators.pattern(/^[A-Z0-9]{8}/)]],
        bank: ['']
      }),
      customer: this.formBuilder.group({
        tin: ['', [Validators.pattern(/^[0-9]*$/), InvoiceSectionCValidators.residentLength, InvoiceSectionCValidators.nonResidentLength, InvoiceSectionCValidators.tinRequired]],
        branchTin: [],
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        countryCode: [{ value: KzCountry, disabled: true }, [Validators.required]],
        trailer: [null],
        commitentCheckBox: [''],
        brokerCheckBox: [''],
        lesseeCheckBox: [''],
        publicOfficeCheckBox: [''],
        sharingAgreementCheckBox: [''],
        jointActivityCheckBox: [''],
        nonresidentCheckBox: [''],
        principalCheckBox: [''],
        retailCheckBox: [''],
        individualCheckBox: [''],
        lawyerCheckBox: [''],
        bailiffCheckBox: [''],
        mediatorCheckBox: [''],
        notaryCheckBox: [''],
        statuses: [[]],
      }, {
        validators: [

        ]
      }),

      publicOffice: this.formBuilder.group({
        iik: ['', [Validators.pattern(/^[A-Z0-9]{20}/), InvoiceSectionC1Validators.iikAndPayPurposeFilledTogether, InvoiceSectionC1Validators.iikRequired]],
        productCode: ['', [Validators.pattern(/^[0-9]{6}$/)]],
        payPurpose: ['', [InvoiceSectionC1Validators.iikAndPayPurposeFilledTogether, InvoiceSectionC1Validators.payPurposeRequired]],
        bik: [KZPublicOfficeBik]
      }),
      consignor: this.formBuilder.group({
        tin: [COMPANY.tin, [Validators.pattern(/^[0-9]*$/)]],
        name: [COMPANY.name, [Validators.minLength(3), Validators.maxLength(450)]],
        address: [COMPANY.address, [Validators.minLength(3), Validators.maxLength(450)]],
      }),
      consignee: this.formBuilder.group({
        tin: ['', [Validators.pattern(/^[0-9]*$/)]],
        name: ['', [Validators.minLength(3), Validators.maxLength(450), InvoiceSectionDValidators.consigneeNameRequired]],
        address: ['', [Validators.minLength(3), Validators.maxLength(450), InvoiceSectionDValidators.consigneeAddressRequired]],
        countryCode: [{ value: KzCountry, disabled: false }, [Validators.required]],
      }, {
        validators: [InvoiceSectionDValidators.consigneeTinRequired]
      }),
      requisites: this.formBuilder.group({
        deliveryDocNum: ['', []],
        deliveryDocDate: ['', []],
      }),
      currencyCode: [{ value: KztCurrencyCode, disabled: true }, [Validators.required]],
      currencyRate: [null, InvoiceSectionGValidators.currencyRateRequired],
      calculationDirection: ['1'],
      calculationWay: ['1'],
      productsSet : this.formBuilder.group({
        totalSumWithoutTax: [''],
        totalTurnoverSize: [''],
        totalNdsSum: [''],
        totalSumWithTax: [''],
      }),
     
      products: this.formBuilder.array([], [Validators.required])

    }, {
      validators: [
        InvoiceSectionDValidators.countryCodeRule2,
        InvoiceSectionDValidators.countryCodeRule3,
        InvoiceSectionGValidators.currencyCodeUpdate,
        InvoiceSectionGValidators.kzCustomerMustBeKzt,
        CustomDateValidators.invoiceDateMustBeChecked,
      ]
    }
    )
  }
}
