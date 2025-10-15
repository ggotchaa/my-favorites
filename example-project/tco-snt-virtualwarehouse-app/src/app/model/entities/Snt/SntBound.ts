import { COMPANY } from "../../GlobalConst";

export class SntBound {
    isOutbound(tin: string): boolean {
        return tin && tin === COMPANY.tin;
    }
    isInbound(tin: string): boolean {
        return !this.isOutbound(tin) && tin == COMPANY.tin
    }
}