import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { DictionariesClient, SntClient, TaxpayerStoreClient } from "src/app/api/GCPClient";
import { COMPANY, KzCountry } from "src/app/model/GlobalConst";
import { RoleAccessService } from "src/app/shared/services/role-access.service";
import { CommonDataService } from "../../../../shared/services/common-data.service";
import { SntSectionAValidators } from "../../snt-sections/snt-section-a/snt-section-a.validators";
import { SntSectionBValidators } from "../../snt-sections/snt-section-b/snt-section-b.validators";
import { SntSectionCValidators } from "../../snt-sections/snt-section-c/snt-section-c.validators";
import { SntSectionCurrencyValidators } from "../../snt-sections/snt-section-currency/snt-section-currency.validators";
import { SntSectionDValidators } from "../../snt-sections/snt-section-d/snt-section-d.validators";
import { SntSectionEValidators } from "../../snt-sections/snt-section-e/snt-section-e.validators";
import { SntSectionFValidators } from "../../snt-sections/snt-section-f/snt-section-f.validators";
import { SntFacade } from "../../snt.facade";
import { SntSectionGValidators } from "../../snt-sections/snt-section-g/snt-section-g.validators";
import { SntSectionG6Validators } from "../../snt-sections/snt-section-g6/snt-section-g6.validators";
import { SntSectionG10Validators } from "../../snt-sections/snt-section-g10/snt-section-g10.validators";

@Injectable({ providedIn: 'root' })
export class SntActionsDependenciesBase {
  draftSntForm: UntypedFormGroup;
  constructor(
    public sntClient: SntClient,
    public titleService: Title,
    public router: Router,
    public formBuilder: UntypedFormBuilder,
    public roleAccessService: RoleAccessService,
    public taxPayerApi: TaxpayerStoreClient,
    public measureUnitApi: DictionariesClient,
    public sntFacade: SntFacade,
    public dialog: MatDialog,
    public route: ActivatedRoute,
    public commonDataService: CommonDataService
  ) {

    this.draftSntForm = this.formBuilder.group({
      id: [null],
      number: ['', Validators.required],
      sntCreationDate: [{ value: formatDate(new Date(), 'dd.MM.yyyy', 'en'), disabled: true }],
      shippingDate: ['', [SntSectionAValidators.shippingDateCantBeEarlierThanFiveYears, SntSectionAValidators.shippingDateRequired]],
      registrationNumber: [{ value: '', disabled: true }],
      relatedRegistrationNumber: [{ value: '', disabled: true }],
      date: [{ value: '', disabled: true }],
      digitalMarkingNotificationNumber: [],
      digitalMarkingNotificationDate: [null, SntSectionAValidators.digitalMarkingNotificationDateRequired],
      importType: ['', [SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation]],
      exportType: ['', [SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation]],
      transferType: ['',
        [
          SntSectionAValidators.transferTypeCountryMustBeKz,
          SntSectionAValidators.transferTypeCustomerMustBeEAEU,
          SntSectionAValidators.transferTypeSellerMustBeEAEU,
        ]
      ],
      seller: this.formBuilder.group({
        tin: [COMPANY.tin, [Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        nonResident: [false],
        name: [COMPANY.name, [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        branchTin: [],
        reorganizedTin: [],
        registerCountryCode: [{ value: KzCountry, disabled: false }, [Validators.required]],
        countryCode: [KzCountry, [Validators.required, SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation]],
        actualAddress: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        taxpayerStoreId: [null],
        statuses: [[]],
        sharingAgreementParticipantCheckBox: ['']
      }, {
        validators:
          [
            SntSectionBValidators.isNonResidentCheck,
            SntSectionBValidators.registerCountryCode,
            SntSectionBValidators.isTCOTin
          ]
      }),
      customer: this.formBuilder.group({
        tin: ['', [Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        nonResident: [false],
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        branchTin: [],
        reorganizedTin: [],
        registerCountryCode: [{ value: KzCountry, disabled: false }, [Validators.required]],
        countryCode: [KzCountry, [Validators.required, SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation]],
        actualAddress: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(450)]],
        taxpayerStoreId: [{ value: null, disabled: false }]
      }, {
        validators: [
          SntSectionCValidators.isNonResidentCheck,
          SntSectionCValidators.registerCountryCode
        ]
      }),
      consignor: this.formBuilder.group({
        tin: [COMPANY.tin, [Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        nonResident: [false],
        name: [COMPANY.name, Validators.required],
        countryCode: [{ value: KzCountry, disabled: false }, Validators.required]
      }, {
        validators: [
          SntSectionDValidators.isNonResidentConsignorCheck
        ]
      }),
      consignee: this.formBuilder.group({
        tin: ['', [Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        nonResident: [false],
        name: ['', Validators.required],
        countryCode: [{ value: KzCountry, disabled: false }, Validators.required]
      }, {
        validators: [
          SntSectionDValidators.isNonResidentConsigneeCheck
        ]
      }),
      shippingInfo: this.formBuilder.group({
        name: [''],
        nonResident: [false],
        tin: ['',
          SntSectionEValidators.tinValidation
        ],
        transportTypes: this.formBuilder.array([]),
        carCheckBox: [''],
        carStateNumber: [{ value: '', disabled: true }, [Validators.pattern(/^[а-яА-Яa-zA-Z0-9Ëё]+$/i)]],
        trailerStateNumber: [{ value: '', disabled: true }, [Validators.pattern(/^[а-яА-Яa-zA-Z0-9Ëё]+$/i)]],
        carriageCheckBox: [''],
        carriageNumber: [{ value: '', disabled: true }],
        boardCheckBox: [''],
        boardNumber: [{ value: '', disabled: true }],
        shipCheckBox: [''],
        shipNumber: [{ value: '', disabled: true }],
        pipelineCheckBox: [''],
        multimodalCheckBox: [''],
        otherCheckBox: [''],

      }, {
        validators: [
          SntSectionEValidators.nameValidation
        ],
      }),
      contract: this.formBuilder.group({
        isContract: ['true'],
        number: [''],
        date: [''],
        termOfContractPayment: [''],
        deliveryCondition: ['']
      }, {
        validators: [
          SntSectionFValidators.isCheckedWithContract
        ]
      }),
      currencyCode: ['', Validators.required],
      currencyRate: [null],
      comment: [''],
      hasOilProducts: [false],
      hasExportControlProducts: [false],
      oilSet: this.formBuilder.group({
        kogdOfRecipient: [''],
        kogdOfSender: [''],
        operationCode: [''],
        productSellerType: ['']
      }),
      oilProducts: this.formBuilder.array([]),
      exportControlProducts: this.formBuilder.array([]),
      products: this.formBuilder.array([], Validators.required)
    },
      {
        validators:
          [
            SntSectionEValidators.isTransportTypeRequired,
            SntSectionEValidators.isEmptyFields,
            SntSectionBValidators.countryCodeImportType,
            SntSectionCValidators.countryCodeExportType,
            SntSectionCurrencyValidators.currencyCodeCheck,
            SntSectionBValidators.checkEAES,
            SntSectionCValidators.checkEAES,
            SntSectionAValidators.transferTypeMustBeSameIINBIN
          ]
      })
  }
}
