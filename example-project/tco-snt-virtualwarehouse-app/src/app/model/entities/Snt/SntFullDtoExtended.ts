import { SntFullDto } from "src/app/api/GCPClient";
import { SntBound } from "./SntBound";
import { ISntfullDtoExtended } from "../../interfaces/Snt/ISntFullDtoExtended";

export class SntFullDtoExtended extends SntFullDto implements ISntfullDtoExtended{
    sntBound: SntBound;

    constructor() {
        super();
        this.sntBound = new SntBound()
    }
    static fromJS(data: any): SntFullDtoExtended{
        data = typeof data === 'object' ? data : {};
        let result = new SntFullDtoExtended();
        result.init(data);
        return result;
    }
}
