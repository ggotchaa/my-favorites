import { FormControl, FormGroup } from "@angular/forms";
import { AwpWorkDto, AwpWorksPerformedDto } from "src/app/api/GCPClient";

export interface IAwpWorksPerformedMapable {
    mapAwpWorkToInvoiceProduct(awpWorkDtos: AwpWorkDto[]): void

    mapAwpWorkSetToProductsSet(awpWorksPerformedDto: AwpWorksPerformedDto): void
}