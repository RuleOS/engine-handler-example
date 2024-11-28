/*
 * @Author: syf
 * @Date: 2024-11-25 17:15:16
 * @LastEditors: syf
 * @LastEditTime: 2024-11-26 16:36:54
 * @Description: 
 * @FilePath: /engine-handler-example/src/sdk-v3/util/RLP.ts
 */
//@ts-nocheck

import { ILogger } from "./log/ILogger";
import { getLogger } from "./Log";
import { encode } from "rlp";

let log: ILogger = getLogger();
let rlp = require("rlp");

export class RLP {

  public static to(name: string, value: any) {

    let eleValue = RLP.toElementValue(value);
    return [name,eleValue.type,eleValue.value];

  }

  private static toElementValue(value: any) {

    let typeValue = typeof value;

    let type;// = typeof value === 'number' ? 'number/boolean' : Array.isArray(value) ? 'array' : 'string';

    if (typeValue === 'number') {
      type = 'number/boolean';
    } else if (Array.isArray(value)) {
      type = 'array';
    } else if (typeValue == 'object') {
      if (value._isBigNumber && value._isBigNumber == true) {
        type = 'bigNumber';
      }
    } else {
      type = "string";
    }

    if (type == 'number/boolean') {
      return {type:"uint", value:value};
    } else if (type == "string") {
      if (value.startsWith("0x") && value.length == 42) {
        return {type:"address", value:value};
      }
      return {type:"string", value:value};
    } else if (type == "array") {

      let aList = [];
      for(let k = 0; k < value.length; ++k){
          let eValue = RLP.toElementValue(value[k]);
          aList.push(eValue.value);
      }

      return {type:"list", value:aList};
    } else if (type == "bigNumber") {
      return {type:"uint", value:value.toHexString()};
    }
  }


  //[ ["trialOut","uint",3], ["user","string","bob"]
  public static fromList(args: string): [] {
    let decodeArgsList = rlp.decode(args);
    let resList = [];
    for (let i = 0; i < decodeArgsList.length; ++i) {

      let args = decodeArgsList[i];

      let argVal = RLP.from(args);

      resList.push([argVal.name, argVal.type, argVal.value]);
    }

    return resList;
  }

  public static from(args: string) {
    let hname = args[0].toString();
    let type = args[1].toString();
    let value;
    if (type == "uint") {
      let hexv = args[2].toString('hex');
      if (hexv == "") {
        hexv = "0x0";
      }
      value = parseInt(hexv, 16);
    } else if (type == "string") {
      value = args[2].toString();
    } else if (type == "address") {
      value = "0x" + args[2].toString('hex');
    } else if (type == "bool") {
      value = Boolean(parseInt(args[2].toString('hex'), 16));
    } else if (type == "uintList") {
      value = [];
      for (let j = 2; j < args.length; ++j) {
        let hexv = args[j].toString('hex');
        if (hexv == "") {
          hexv = "0x0";
        }
        value.push(parseInt(hexv, 16));
      }
    } else if (type == "stringList") {
      value = [];
      for (let j = 2; j < args.length; ++j) {
        value.push(args[j].toString());
      }
    } else if (type == "addressList") {
      value = [];
      for (let j = 2; j < args.length; ++j) {
        value.push("0x" + args[j].toString('hex'));
      }
    } else if (type == "boolList") {
      value = [];
      for (let j = 2; j < args.length; ++j) {
        value.push(Boolean(parseInt(args[j].toString('hex'), 16)));
      }
    }

    return {
      name: hname,
      type: type,
      value: value
    }

  }


}
