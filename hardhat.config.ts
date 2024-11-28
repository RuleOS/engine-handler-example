/*
 * @Author: syf
 * @Date: 2024-11-25 14:38:12
 * @LastEditors: syf
 * @LastEditTime: 2024-11-26 16:02:58
 * @Description: 
 * @FilePath: /engine-handler-example/hardhat.config.ts
 */
// @ts-nocheck
import {HardhatUserConfig, task} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";
import networkConfig from "./networks"
import {Type} from "./task/type"

const COMPILER_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1000000,
  },
  metadata: {
    bytecodeHash: "none",
  },
}


function compileSetting(version: string, runs: number) {
  return {
    version: version,
    settings: {
      optimizer: {
        enabled: true,
        runs: runs,
      },
    },
  };
}

let config: HardhatUserConfig = {
  etherscan: {},
  networks: {},
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  solidity: {
    compilers: [
      compileSetting("0.5.12", 200),
        compileSetting("0.5.16", 200),
        compileSetting("0.8.0", 50),
      compileSetting("0.8.4", 50),
      compileSetting("0.8.7", 50),
        compileSetting("0.8.9", 50),
        compileSetting("0.8.10", 50),
        compileSetting("0.8.17", 50),
        compileSetting("0.6.6", 200),
      compileSetting("0.4.24", 200),

    ],
  },
};

for (var key in networkConfig.networks) {
  if (networkConfig.networks.hasOwnProperty(key)) {
    // @ts-ignore
    config.networks[key] = networkConfig.networks[key];
  }
}
config.defaultNetwork = networkConfig.defaultNetwork;


task("syncV3Artifacts", "syncV3Artifacts", async (taskArgs, hre) => {
  Type.syncV3Artifacts();
});



export default config;