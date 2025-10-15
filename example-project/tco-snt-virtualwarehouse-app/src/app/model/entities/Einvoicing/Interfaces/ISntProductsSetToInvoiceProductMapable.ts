import { GetSntProductBySntIdResponseDto, SntOilProductDto, SntProductFullDto } from "src/app/api/GCPClient"

export interface ISntProductSetToInvoiceProductMapable {
    mapSntData(snt: GetSntProductBySntIdResponseDto): void

    mapSntProductsToInvoiceProducts(sntProducts: SntProductFullDto[]): void

    mapSntOilProductToInvoiceProducts(sntOilProducts: SntOilProductDto[]): void
}