import { SntSectionsNames } from "./SntSectionsNames";

export interface SntErrorsInfo{
    section: string;
    errors: Map<string, string>;
}


export const SntFormErrorsDictionary: Record<string, SntErrorsInfo> ={
    "number": {
        section: SntSectionsNames.sectiona,
        errors: new Map<string, string>([
            ['required', 'Поле "Регистрационный номер СНТ учетной системы" отсутствует']
        ])
    },
    "shippingDate": {
        section: SntSectionsNames.sectiona,
        errors: new Map<string, string>([
            ['shippingDateRequired', 'Отсутствует дата отгрузки товара'],
            ['shippingDateEarlierThanFiveYears', 'Дата отгрузки СНТ не может быть раньше пяти лет, начиная с текущей даты']
        ])
    },
    "digitalMarkingNotificationDate": {
        section: SntSectionsNames.sectiona,
        errors: new Map<string, string>([
            ['digitalMarkingNotificationDateRequired', 'Поле 4.2.1 Дата должна быть заполнено']
        ])
    },
    "transferType": {
        section: SntSectionsNames.sectiona,
        errors: new Map<string, string>([
            ['transferTypeCountryMustBeKz', 'При перемещении товаров в пределах одного лица на территории РК, в полях «19. Код страны отправки/отгрузки», «28. Код страны доставки/поставки» должна быть указана страна «Казахстан»'],
            ['transferTypeMustBeSameIINBIN', 'При перемещении товара в пределах одного лица должен быть указан один ИИН/БИН или связь между структурным подразделением и головным предприятием не найдена'],
            ['transferTypeSellerAndCustomerMustBeEAEU', 'При перемещении товаров в пределах одного лица в рамках ЕАЭС, в полях «18. Код страны регистрации поставщика», «27. Код страны регистрации получателя должна быть страна - ЕАЭС»'],
            ['transferTypeSellerOrCustomerMustNotBeEAEU', 'При перемещении товаров в третьи страны, в полях «18. Код страны регистрации поставщика» и «31. Код страны регистрации получателя должна быть указана страна не ЕАЭС».'],
        ])
    },
    "seller-tin": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['maxlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['pattern', 'Надо только ввести числа']
        ])
    },
    "seller-name": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'Наименование поставщика отсутствует'],
            ['minlength', 'Поле \'Наименование поставщика/отправителя\' должно содержать от 3 до 450 символов'],
        ])
    },
    "seller-registerCountryCode": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'Код страны регистрации поставщика отсутствует'],
            ['registerCountryCodeMustBeKZ', 'Страна регистрации поставщика равна значению «Казахстан», в то время как отмечено поле «13.1 Нерезидент»'],
            ['notEqualToEAES', 'Страна регистрации поставщика должно быть из ЕАЭС']
        ])
    },
    "seller-countryCode": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'Код страны отправки/отгрузки отсутствует'],
            ['equalToKZ', 'Страна доставки/поставки получателя не должно быть равно значению «Казахстан»'],
            ['notEqualToEAES', 'Страна отправки/отгрузки получателя должно быть из ЕАЭС']
        ])
    },
    "seller-actualAddress": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'Поле \'Фактический адрес отправки/отгрузки\' отсутствует'],
            ['minlength', 'Поле \'Фактический адрес доставки/поставки\' должно содержать от 3 до 450 символов'],
        ])
    },
    "seller-taxpayerStoreId": {
        section: SntSectionsNames.sectionb,
        errors: new Map<string, string>([
            ['required', 'ID склада отправки/отгрузки отсутствует'],
        ])
    },
    "customer-tin": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['maxlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['pattern', 'Надо только ввести числа']
        ])
    },
    "customer-name": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', 'Наименование получателя отсутствует'],
            ['minlength', 'Поле \'Наименование получателя\' должно содержать от 3 до 450 символов'],
        ])
    },
    "customer-registerCountryCode": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', '27 Код страны регистрации получателя отсутствует'],
            ['registerCountryCodeMustBeKZ', 'Страна регистрации получателя равна значению «Казахстан», в то время как отмечено поле «22.1 Нерезидент»'],
            ['notEqualToEAES', 'Страна регистрации получателя получателя должно быть из ЕАЭС']
        ])
    },
    "customer-countryCode": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', 'Поле \'Код страны доставки/поставки\' отсутствует'],
            ['equalToKZ', 'Страна доставки/поставки получателя не должно быть равно значению «Казахстан»'],
            ['notEqualToEAES', 'Страна доставки/поставки получателя должно быть из ЕАЭС']
        ])
    },
    "customer-actualAddress": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', 'Поле \'Фактический адрес доставки/поставки\' отсутствует'],
            ['minlength', 'Поле \'Фактический адрес отправки/отгрузки\' должно содержать от 3 до 450 символов'],
        ])
    },
    "customer-taxpayerStoreId": {
        section: SntSectionsNames.sectionc,
        errors: new Map<string, string>([
            ['required', 'ID склада доставки/поставки отсутствует'],
        ])
    },
    "consignor-tin": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignor,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['maxlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['pattern', 'Надо только ввести числа']
        ])
    },
    "consignor-name": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignor,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
        ])
    },
    "consignor-countryCode": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignor,
        errors: new Map<string, string>([
            ['required', 'Код страны отправки отсутствует'],
        ])
    },
    "consignee-tin": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignee,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['maxlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['pattern', 'Надо только ввести числа']
        ])
    },
    "consignee-name": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignee,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
        ])
    },
    "consignee-countryCode": {
        section: SntSectionsNames.sectiond+'. '+SntSectionsNames.sectiondConsignee,
        errors: new Map<string, string>([
            ['required', ' Код страны доставки отсутствует'],
        ])
    },
    "shippingInfo-name": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Поле \'Наименование перевозчика\' должно содержать от 1 до 450 символов'],
            ['maxlength', 'Поле \'Наименование перевозчика\' должно содержать от 1 до 450 символов']
        ])
    },
    "shippingInfo-tin": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
            ['minlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['maxlength', 'Проверьте пожалуйста длину ИИН/БИН получателя'],
            ['pattern', 'Надо только ввести числа']
        ])
    },
    "shippingInfo-transportTypes": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['isEmptyFields', 'Проверьте пожйлуйста поле 39.1 Вид транспорта'],
            ['isRequiredTransport', '«Вид транспорта обязателен для заполнения если в поле 19 "Код страны отправки/отгрузки"или в поле 28 "Код страны доставки/поставки" или в поле 33 "Код страны отправки" или в поле 36 "Код страны доставки" не указан код  KZ '],
        ])
    },
    "shippingInfo-carCheckBox": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['isRequiredTransport', '«30 поля с типом «Мобильный склад». Обязательное заполнение'],
        ])
    },
    "shippingInfo-carStateNumber": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поле а1.1 Гос. номер АТС должно быть заполнено'],
            ['pattern', 'Могут быть указаны только цифры и буквы латиницы или кириллицы'],
        ])
    },
    "shippingInfo-trailerStateNumber": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['pattern', 'Могут быть указаны только цифры и буквы латиницы или кириллицы'],
        ])
    },
    "shippingInfo-carriageNumber": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
        ])
    },
    "shippingInfo-boardNumber": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
        ])
    },
    "shippingInfo-pipelineCheckBox": {
        section: SntSectionsNames.sectione,
        errors: new Map<string, string>([
            ['required', 'Поля является обязательным для заполнения'],
        ])
    },
    "contract-number" : {
        section: SntSectionsNames.sectionf,
        errors: new Map<string, string>([
            ['required', '№ Договор (контракт) или приложение к договору должны быть заполнены']
        ])
    },
    "contract-date": {
        section: SntSectionsNames.sectionf,
        errors: new Map<string, string>([
            ['required', 'Дата договора (контракта) или приложения к договору должны быть заполнены']
        ])
    },
    "products":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
           ['required', 'Должен быть добавлен хотя бы один продукт'] 
        ])
    },
    "products-truOriginCode":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
           ['required', 'Признак происхождения товара отсутствует'] 
        ])
    },
    "products-productName":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
           ['required', 'Поле является обязательным для заполнения'],
           ['maxlength', 'Поле \'Наименование товара\' должно содержать от 1 до 2500 символов']
        ])
    },
    "products-measureUnitName":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
           ['required', 'Единица измерения товара отсутствует'],
        ])
    },

    "products-measureUnitId":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
           ['required', 'Единица измерения товара отсутствует'],
        ])
    },
    "products-quantity":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
            ['required', 'Поле является обязательным для заполнения'],
            ['positiveNumber', 'Поле \'Количество\' не может быть отрицательным']
        ])
    },
    "products-price":{
        section: SntSectionsNames.sectiong,
        errors: new Map<string, string>([
            ['required', 'Поле является обязательным для заполнения'],
            ['positiveNumber', 'Поле \'Цена за единицу\' не может быть отрицательным']
        ])
    },

    "oilProducts":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
           ['required', 'Должен быть добавлен хотя бы один продукт'] 
        ])
    },
    "oilProducts-truOriginCode":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
           ['required', 'Признак происхождения товара отсутствует'] 
        ])
    },
    "oilProducts-productName":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
           ['required', 'Поле является обязательным для заполнения'],
           ['maxlength', 'Поле \'Наименование товара\' должно содержать от 1 до 2500 символов']
        ])
    },
    "oilProducts-measureUnitName":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
           ['required', 'Единица измерения товара отсутствует'],
        ])
    },
    "oilProducts-quantity":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
            ['required', 'Поле является обязательным для заполнения'],
            ['positiveNumber', 'Поле \'Количество\' не может быть отрицательным']
        ])
    },
    "oilProducts-price":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
            ['required', 'Поле является обязательным для заполнения'],
            ['positiveNumber', 'Поле \'Цена за единицу\' не может быть отрицательным']
        ])
    },
    "oilProducts-vadRate":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
            ['vadRateRequired', 'Поле \'НДС-ставка\' не заполнено'],
        ])
    },
    "oilSet-kogdOfRecipient":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
            ['required', 'Поле \'Код ОГД адреса доставки/поставки\' не заполнено'],
            ['positiveNumber', 'Поле \'Код ОГД адреса доставки/поставки\' должно содержать от 4 до 4 символов']
        ])
    },
    "oilSet-kogdOfSender":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([
            ['required', 'Поле \'Код ОГД адреса отправки/отгрузки\' не заполнено'],
            ['minlength', 'Поле \'Код ОГД адреса отправки/отгрузки\' должно содержать от 4 до 4 символов']
        ])
    },
    "oilSet-productSellerType":{
        section: SntSectionsNames.sectiong1,
        errors: new Map<string, string>([])
    }


}