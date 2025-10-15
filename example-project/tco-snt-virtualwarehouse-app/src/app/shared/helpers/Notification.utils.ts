import {
  NotificationDocumentType,
  NotificationStatus,
} from 'src/app/model/enums/NotificationEnum';

export class NotificationUtilities {
  static convertNotificationStatus(
    status: NotificationStatus | string
  ): string {
    const statusMap = {
      [NotificationStatus.Successful]: 'Successful',
      [NotificationStatus.Failed]: 'Failed',
      [NotificationStatus.Queued]: 'Queued',
    };

    return statusMap[status] || status;
  }

  static convertNotificationDocumentType(
    documentType: NotificationDocumentType | string
  ): string {
    const documentTypeMap = {
      [NotificationDocumentType.SNT]: 'SNT',
      [NotificationDocumentType.Invoice]: 'Invoice',
      [NotificationDocumentType.Form]: 'Form',
    };

    return documentTypeMap[documentType] || documentType;
  }
}
