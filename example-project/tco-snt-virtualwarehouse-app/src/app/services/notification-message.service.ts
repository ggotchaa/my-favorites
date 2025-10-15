import { Injectable } from '@angular/core';
import { NotificationDto } from '../api/GCPClient';

@Injectable({
  providedIn: 'root'
})
export class NotificationMessageService {
  private messageMap: { [key: string]: string[] } = {
    'Invoice:Successful:CREATE': ['Создание счет-фактуры', 'Номер #{doc_no}'],
    'Invoice:Failed:CREATE': ['Создание счет-фактуры', 'Номер #{doc_no}'],
    'Invoice:Queued:CREATE': ['Создание счет-фактуры', 'Номер #{doc_no}'],
    'SNT:Successful:CREATE': ['Создание СНТ', 'Номер #{doc_no}'],
    'SNT:Failed:CREATE': ['Создание СНТ', 'Номер #{doc_no}'],
    'Form:Successful:CREATE': ['Создание формы', 'Номер #{doc_no}'],
    'Form:Failed:CREATE': ['Создание формы', 'Номер #{doc_no}'],
    'SNT:Successful:CONFIRM': ['Подтверждение СНТ', '#{reg_no}'],
    'SNT:Failed:CONFIRM': ['Подтверждение СНТ', '#{reg_no}'],
    'SNT:Successful:DECLINE': ['Отклонение СНТ', '#{reg_no}'],
    'SNT:Failed:DECLINE': ['Отклонение СНТ', '#{reg_no}'],
    'SNT:Successful:REVOKE': ['Отзыв СНТ', '#{reg_no}'],
    'SNT:Failed:REVOKE': ['Отзыв СНТ', '#{reg_no}'],
  };

  generateNotificationMessage(dto: NotificationDto): string[] {
    const key = `${dto.documentType}:${dto.status}:${dto.actionType}`;    

    let messageParts = this.messageMap[key] || ['Сообщение не определено'];

    messageParts = messageParts.map(part => {
      if (dto.documentNumber) {
        part = part.replace('{doc_no}', dto.documentNumber);
      }

      if (dto.registrationNumber) {
        part = part.replace('{reg_no}', dto.registrationNumber);
      }

      return part;
    });

    return messageParts;
  }

}
