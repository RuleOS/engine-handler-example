
export enum PFlowCommandArgRange{
  Fixed="fixed",
  Range="range",
  Enum="enum",
  Address = "address",
  AddressList = "addressList"
}

export class PFlowCommandArg {

  rangeType:PFlowCommandArgRange | undefined;//"range,enum"
  range: any[] | undefined;//[10000, 20000],
  key: string | undefined;//"times",
  value: any;
  // vpModeList: ["publisher"]

}
