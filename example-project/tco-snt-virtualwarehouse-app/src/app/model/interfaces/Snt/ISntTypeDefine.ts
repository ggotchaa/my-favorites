import { ISntBaseDto } from "src/app/api/GCPClient";

export interface ISntTypeDefine  {
    isOutboundSnt(): boolean
    isInboundSnt(): boolean
}