import { ITaxpayerStoreDescriptionDto, TaxpayerStoreDescriptionDto, TaxpayerStoreSimpleDto } from "src/app/api/GCPClient";
import { IAdapter } from "../interfaces/IAdapter";

export class TaxpayerDescriptionDtoAdapter extends TaxpayerStoreSimpleDto implements IAdapter<TaxpayerStoreDescriptionDto, TaxpayerStoreSimpleDto>{
    adapt(item: TaxpayerStoreSimpleDto): TaxpayerStoreDescriptionDto {
        const data: ITaxpayerStoreDescriptionDto = {
            id: item.id,
            externalId: item.externalId,
            name: item.name,

        }
        return new TaxpayerStoreDescriptionDto(data)
    }
    
}
