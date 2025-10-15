import { SntBaseDto, SntDraftDto } from "src/app/api/GCPClient";
import { COMPANY } from "../../GlobalConst";
import { ISntTypeDefine } from "../../interfaces/Snt/ISntTypeDefine";
import { SntBound } from "./SntBound";

export class SntDraftDtoExtended extends SntDraftDto{

    sntBound: SntBound;

    constructor() {
        super();
        this.sntBound = new SntBound()
    }
    
    static fromJS(data: any): SntDraftDtoExtended{
        data = typeof data === 'object' ? data : {};
        let result = new SntDraftDtoExtended();
        result.init(data);
        return result;
    }
    
}
