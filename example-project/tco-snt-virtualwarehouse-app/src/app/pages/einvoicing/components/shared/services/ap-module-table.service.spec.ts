import { TestBed } from "@angular/core/testing"
import { IEsfJdeApMatchItemBaseDto, InvoiceType } from "src/app/api/GCPClient";
import { ApModuleTableService } from "./ap-module-table.service";

describe('ApModuleTableService', () => {
    let service: ApModuleTableService
    beforeEach(
        () => { service = new ApModuleTableService(); }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    })

    it('#formMatchStatusField should return Fixed (0|2)', () => {
        const data: IEsfJdeApMatchItemBaseDto[] = [
            {
                esfType: InvoiceType.FIXED_INVOICE,
                jdeSupplierNumber: '',
                esfNumber: '5555'
            },
            {
                esfType: InvoiceType.FIXED_INVOICE,
                jdeSupplierNumber: '',
                esfNumber: '5556'
            },
           
        ]

        let result = service.formMatchStatusField(data)

        expect(result).toEqual('Fixed (0|2)')
    })

    it('#formMatchStatusField should return Additional (2|2)', () => {
        const data: IEsfJdeApMatchItemBaseDto[] = [
            {
                esfType: InvoiceType.ADDITIONAL_INVOICE,
                jdeSupplierNumber: '5555',
                esfNumber: '5555'
            },
            {
                esfType: InvoiceType.ADDITIONAL_INVOICE,
                jdeSupplierNumber: '5556',
                esfNumber: '5556'
            },
           
        ]

        let result = service.formMatchStatusField(data)

        expect(result).toEqual('Additional (2|2)')
    })

    it('#formMatchStatusField should return Additional (1|1),Ordinary (1|1)', () => {
        const data: IEsfJdeApMatchItemBaseDto[] = [
            {
                esfType: InvoiceType.ADDITIONAL_INVOICE,
                jdeSupplierNumber: '5555',
                esfNumber: '5555'
            },
            {
                esfType: InvoiceType.ORDINARY_INVOICE,
                jdeSupplierNumber: '5556',
                esfNumber: '5556'
            },
           
        ]

        let result = service.formMatchStatusField(data)

        expect(result).toEqual('Additional (1|1),Ordinary (1|1)')
    })

    it('#formMatchStatusField should return Fixed (0|1),Ordinary (1|1)', () => {
        const data: IEsfJdeApMatchItemBaseDto[] = [
            {
                esfType: InvoiceType.FIXED_INVOICE,
                jdeSupplierNumber: '',
                esfNumber: '5555'
            },
            {
                esfType: InvoiceType.ORDINARY_INVOICE,
                jdeSupplierNumber: '5556',
                esfNumber: '5556'
            },
           
        ]

        let result = service.formMatchStatusField(data)

        expect(result).toEqual('Fixed (0|1),Ordinary (1|1)')
    })
})