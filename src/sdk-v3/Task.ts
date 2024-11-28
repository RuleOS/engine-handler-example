// @ts-nocheck

import * as chainHub from "@ruleos/chain-hub";
import { DateUtil } from "@ruleos/chain-hub";
import networkConfig from "../../networks";
import { loadEngine } from "./Deploy";
import { Engine } from "./Engine";
import { Task } from "./struct/Task";

let hubChain, hubContract;

async function main() {
  printTitle(20);

  let cmdStr = "";
  let commands = process.argv.splice(2);
  for (let i = 0; i < commands.length; ++i) {
    cmdStr += commands[i] + " - ";
  }
  cmdStr = cmdStr.substring(0, cmdStr.length - 1);
  console.log("-----------------------------", cmdStr, "-----------------------------");

  let network = commands[0];//"eth50";//networkConfig.defaultNetwor;
  let folder = commands[1];//"2022-06-23";

  console.log();
  console.log("----------- time", DateUtil.getNowDate(), "folder", folder, "-----------");
  console.log();

  networkConfig.defaultNetwork = network;
  var url = networkConfig.networks[network].url;
  var chainId = networkConfig.networks[network].chainId;

  hubChain = new chainHub.Chain(url);
  let user1 = hubChain.keyToSigner("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

  // let [user1, user2, user3, user4] = await ethers.getSigners();

  let contracts = await loadEngine(user1, folder);
  let engine = await Engine.create(user1, contracts);

  console.log();
  console.log("---------------------------------------------------------------------------------------------------------------------------------------");
  console.log();


  //ts-node  ./src/sdk-v3/Task.ts cluster 1[clusterId]
  if (commands[2] == "cluster") {
    let cluster: Cluster = await engine.getCluster(commands[3], commands[4], commands[5]);
    cluster.print();
  } else if (commands[2] == "ruleSlot") {
    let ruleSlotIndexList = commands[4].split(",");
    let cluster: Cluster = await engine.getRuleSlot(commands[3], ruleSlotIndexList);
  } else if (commands[2] == "task") {
    let task: Task = await engine.getTask(commands[3]);
    await task.print();
  }
  // ts-node  ./src/sdk-v3/Task.ts checkOutput 1[clusterId]
  else if (commands[2] == "checkOutput") {
    let cluster: Cluster = await engine.getCluster(commands[3]);
    if (commands[4] != undefined && commands[5] != undefined) {
      await engine.checkOutput(cluster, commands[4], commands[5]);
    } else {
      await engine.checkOutput(cluster);
    }

  }
    // ts-node  ./src/sdk-v3/Task.ts out user2 1[taskId] 0[round]
  // ts-node  ./src/sdk-v3/Task.ts out 0x123 1[taskId] 0[round]
  else if (commands[2] == "out") {

    let addr = commands[3];
    if (commands[3] == ("user1")) addr = user1.address;


    let branch = await engine.getOutputAddressRoundBranch(addr, commands[4],[], commands[5]);
    await engine.getBranchOutputTokenList(addr, commands[4], [],commands[5],"0x", branch);
  }
    // ts-node  ./src/sdk-v3/Task.ts poolContractDeployer 0x123[contractAddress]
  // ts-node  ./src/sdk-v3/Task.ts poolContractDeployer 0xD7a5A59261b60e45a729DA17801411A0581d4050
  else if (commands[2] == "poolContractDeployer") {
    await engine.getPoolContractDeployer(commands[3]);
  }
    // ts-node  ./src/sdk-v3/Task.ts poolTokenRole 0x123[poolTokenAddress] MINTER_ROLE[role] 0x123[userAddress]
    // ts-node  ./src/sdk-v3/Task.ts poolTokenRole 0x397C458fe1F4f994B8553f337c75ee84488F689A MINTER_ROLE 0xF6afaa606BE0C184c56bBA47F5d228382599FB3D
  // ts-node  ./src/sdk-v3/Task.ts poolTokenRole 0x720b08875E45Db73e73D39C46213D5aB54064E6b APP_ROLE 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  else if (commands[2] == "poolTokenRole") {
    await engine.checkPoolTokenRole(commands[3], commands[4], commands[5]);
  }

  console.log("");
}


function printTitle(n) {
  let n1 = n / 2;
  for (let i = 1; i <= n1; i++) {
    for (let j = 1; j <= n1 - i; j++) {
      process.stdout.write(" ");
    }
    for (let k = 1; k <= 2 * i - 1; k++) {
      process.stdout.write("*");
    }
    console.log();
  }
  for (let i = n1 - 1; i >= 1; i--) {
    for (let j = 1; j <= n1 - i; j++) {
      process.stdout.write(" ");
    }
    for (let k = 1; k <= 2 * i - 1; k++) {
      process.stdout.write("*");
    }
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
