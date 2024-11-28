//@ts-nocheck
import { BaseHandler } from "../BaseHandler";

import { getLogger, ILogger } from "../../util";
import { Signer } from "ethers";
import { Engine } from "../../Engine";
import {RedPacketHandler} from "../../../../typechain/RedPacketHandler";
import {RedPacketHandler__factory} from "../../../../typechain/factories/RedPacketHandler__factory";

let log: ILogger = getLogger();

export class LRedPacketHandler extends BaseHandler {

    constructor(owner: Signer, engine: Engine, folder: string) {
        super(owner, engine, folder);
        this.name = "RedPacketHandler";
    }


    /**
     *
     * @param address : proxy address
     */
    public async load(address?: string): LRedPacketHandler {

        this.handler = <RedPacketHandler>await RedPacketHandler__factory.connect(address, this.owner);
        this.address = address;
        this.folder = "";

        return this;
    }

}
