import { Injectable } from '@angular/core';
import { BalanceFormProduct } from 'src/app/model/entities/FormProduct/BalanceFormProduct';
import { FormProductBase } from 'src/app/model/entities/FormProduct/FormProductBase';
import { ManufactureFormProduct } from 'src/app/model/entities/FormProduct/ManufactureFormProduct';
import { MovementFormProduct } from 'src/app/model/entities/FormProduct/MovementFormProduct';
import { WriteOffFormProduct } from 'src/app/model/entities/FormProduct/WriteOffFormProduct';
import { IFormProductBase } from 'src/app/model/interfaces/Form/FormProduct/IFormProductBase';
import { NotificationService } from 'src/app/services/notification.service';
import { RoleAccessService } from 'src/app/shared/services/role-access.service';
import { UFormSimpleDto, UFormType } from '../../api/GCPClient';
import { DetailingFormProduct } from 'src/app/model/entities/FormProduct/DetailingFormProduct';

@Injectable({ providedIn: 'root' })
export class FormsFacade {
  constructor(
    private notificationService: NotificationService,
    public roleAccessService: RoleAccessService
  ) {}

  displayErrors(errorMessage: any): void {
    this.notificationService.error(errorMessage);
  }

  displaySuccess(successMessage: string): void {
    this.notificationService.success(successMessage);
  }

  displayNotification(notificationMessage: string): void {
    this.notificationService.notify(notificationMessage);
  }

  compareForms(a: UFormSimpleDto, b: UFormSimpleDto) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

  getFormProductType(formType): IFormProductBase {
    let formProductType:FormProductBase;
    switch (formType) {
      case UFormType.MANUFACTURE:
        formProductType = new ManufactureFormProduct();
        break;
      case UFormType.MOVEMENT:
        formProductType = new MovementFormProduct();
        break;
      case UFormType.WRITE_OFF:
        formProductType = new WriteOffFormProduct();
        break;
      case UFormType.BALANCE:
        formProductType = new BalanceFormProduct();
        break;
      case UFormType.DETAILING:
        formProductType = new DetailingFormProduct();
        break;
      default: 
        formProductType = new FormProductBase();
    }

    return formProductType;
  }
}
