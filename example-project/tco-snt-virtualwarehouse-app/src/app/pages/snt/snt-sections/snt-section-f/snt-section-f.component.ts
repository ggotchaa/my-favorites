import {Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { SntSectionsNames } from '../SntSectionsNames';
export const DELIVERY_CONDITION = [
  {
    code: "CFR",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанный порт назначения",
    nameKz: "ҚҰНЫ ЖӘНЕ ЖҮК",
    nameRu: "СТОИМОСТЬ И ФРАХТ",
  },
  {
    code: "CIF",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанный порт назначения",
    nameKz: "ҚҰНЫ, САҚТАНДЫРУ ЖӘНЕ ЖҮК",
    nameRu: "СТОИМОСТЬ, СТРАХОВАНИЕ И ФРАХТ",
  },
  {
    code: "CIP",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанное место назначения",
    nameKz: "ТАСЫМАЛДАУ ЖӘНЕ САҚТАНДЫРУ ТӨЛЕНДІ ... ДЕЙІН",
    nameRu: "ПЕРЕВОЗКА И СТРАХОВАНИЕ ОПЛАЧЕНЫ ДО...",
  },
  {
    code: "CPT",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанное место назначения",
    nameKz: "ТАСЫМАЛДАУ ТӨЛЕНДІ ... ДЕЙІН",
    nameRu: "ПЕРЕВОЗКА ОПЛАЧЕНА ДО...",
  },
  {
    code: "DAF",
    descriptionKz: "Көрсетілген орын",
    descriptionRu: "Указанное место",
    nameKz: "ФРАНКО-ШЕКАРА",
    nameRu: "ФРАНКО-ГРАНИЦА",
  },
  {
    code: "DAP",
    descriptionKz: "Көрсетілген бекет",
    descriptionRu: "Указанный пункт",
    nameKz: "БЕКЕТТЕ ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА В ПУНКТЕ",
  },
  {
    code: "DAT",
    descriptionKz: "Көрсетілген терминал",
    descriptionRu: "Указанный терминал",
    nameKz: "ТЕРМИНАЛДА ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА НА ТЕРМИНАЛЕ",
  },
  {
    code: "DDP",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанное место назначения",
    nameKz: "БАЖ САЛЫҒЫН ТӨЛЕУМЕН ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА С ОПЛАТОЙ ПОШЛИНЫ",
  },
  {
    code: "DDU",
    descriptionKz: "Белгіленген жеткізу орны",
    descriptionRu: "Указанное место назначения",
    nameKz: "БАЖ САЛЫҒЫН ТӨЛЕМЕЙ ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА БЕЗ ОПЛАТЫ ПОШЛИНЫ",
  },
  {
    code: "DEQ",
    descriptionKz: "Көрсетілген жеткізілу порты",
    descriptionRu: "Указанный порт назначения",
    nameKz: "КЕМЕЖАЙДАН ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА С ПРИСТАНИ",
  },
  {
    code: "DES",
    descriptionKz: "Көрсетілген жеткізілу порты",
    descriptionRu: "Указанный порт назначения",
    nameKz: "КЕМЕДЕН ЖЕТКІЗУ",
    nameRu: "ПОСТАВКА С СУДНА",
  },
  {
    code: "EXW",
    descriptionKz: "Зауыт орналасуы",
    descriptionRu: "Местонахождение завода",
    nameKz: "ФРАНКО - ЗАУЫТ",
    nameRu: "ФРАНКО - ЗАВОД",
  },
  {
    code: "FAS",
    descriptionKz: "Көрсетілген тиеу порты",
    descriptionRu: "Указанный порт погрузки",
    nameKz: "КЕМЕ БОРТЫНЫҢ БОЙЫНДА ЕРКІН",
    nameRu: "СВОБОДНО ВДОЛЬ БОРТА СУДНА",
  },
  {
    code: "FCA",
    descriptionKz: "Көрсетілген орын",
    descriptionRu: "Указанное место",
    nameKz: "ФРАНКО - ЖҮК ТАСУШЫ",
    nameRu: "ФРАНКО - ПЕРЕВОЗЧИК",
  },
  {
    code: "FOB",
    descriptionKz: "Көрсетілген тиеу порты",
    descriptionRu: "Указанный порт погрузки",
    nameKz: "КЕМЕ БОРТЫНДА ЕРКІН",
    nameRu: "СВОБОДНО НА БОРТУ СУДНА",
  },
  {
    code: "XXX",
    descriptionKz: "Келісімшартта көрсетілген жеткізу шарттарын сипаттау",
    descriptionRu: "Описание условий поставки, приведенное в контракте",
    nameKz: "БАСҚА ДА ЖЕТКІЗУ ЖАҒДАЙЫНЫҢ АТАУЫ",
    nameRu: "ИНОЕ НАИМЕНОВАНИЕ УСЛОВИЯ	ПОСТАВКИ",
  }
]
@Component({
    selector: 'app-snt-section-f',
    templateUrl: './snt-section-f.component.html',
    styleUrls: ['./snt-section-f.component.scss'],
    standalone: false
})
export class SntSectionFComponent implements OnInit{

  delivery_condition;

  sntSectionsNames = SntSectionsNames
  @Input()draftSntForm: UntypedFormGroup;  

  ngOnInit(): void {
    this.delivery_condition = DELIVERY_CONDITION;
  }


}
