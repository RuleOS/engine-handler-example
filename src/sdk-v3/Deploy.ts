// @ts-nocheck

import {
  AllocateHandler,
  ClusterArea,
  ClusterHandlerArea,
  ClusterMountingArea,
  ClusterRuleAreaUtil,
  Engine,
  EngineOutput,
  EngineView,
  PoolContract,
  PoolToken,
  PoolTokenAllocation,
  ProxyIntakeAdmin,
  RestrictHandler,
  Snippet,
  StateCounter,
  Transfer,
  WhiteListHandler
} from "../../engine-typechain";
import { Contract } from "../chain/contract";
import { Signer } from "ethers";
import { EngineInput } from "../../engine-typechain/EngineInput";
import { FULL_POOL_TOKEN_ROLES, HANDLER_STATE, MINTER_ROLE, TRANSFER_ROLE } from "./struct";
import { getLogger, ILogger } from "./util";
import {getProgress, saveProgress} from "../../task/deploy";

let log: ILogger = getLogger();

///
/// ============ deploy ============
///
export async function deployEngine(deployer: Signer, folder?: string = undefined, override?: boolean = true) {
  log.info("--------------------- deploy Engine ---------------------------");
  let overrides = { gasLimit: 10000000,gasPrice: 1500000000};
  let proxyIntakeAdmin = <ProxyIntakeAdmin>await Contract.deploy("ProxyIntakeAdmin", deployer, [overrides], { folder: folder, override: override });

  ///
  /// ============ PoolToken ============
  ///
  let poolTokenAllocationImpl = <PoolTokenAllocation>await Contract.deploy("PoolTokenAllocation", deployer, [overrides], { folder: folder, override: override });
  let poolTokenImpl = <PoolToken>await Contract.deploy("PoolToken", deployer, [overrides], { folder: folder, override: override });

  let poolTokenAllocationInputProxy = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Input", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
  let poolTokenInputProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationInputProxy.address, "ChaosInput", "CI", overrides], { folder: folder, saveName: "Input", override: override }, proxyIntakeAdmin.address, poolTokenImpl);

  let poolTokenAllocationMintProxy = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Mint", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
  let poolTokenMintProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationMintProxy.address, "ChaosMint", "CM", overrides], { folder: folder, saveName: "Mint", override: override }, proxyIntakeAdmin.address, poolTokenImpl);

  let poolTokenAllocationTransferProxy = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Transfer", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
  let poolTokenTransferProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationTransferProxy.address, "ChaosTransfer", "CT", overrides], { folder: folder, saveName: "Transfer", override: override }, proxyIntakeAdmin.address, poolTokenImpl);

  ///
  /// ============ Engine ============
  ///
  let poolContract = <PoolContract>await Contract.deploy("PoolContract", deployer, [overrides], { folder: folder, override: override });
  let randomGenerator = <PoolContract>await Contract.deploy("RandomGenerator", deployer, [overrides], { folder: folder, override: override });

  let clusterHandlerAreaProxy = <ClusterHandlerArea>await Contract.deployProxy("ClusterHandlerArea", deployer, [overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);

  let transfer = <Transfer>await Contract.deploy("Transfer", deployer, [overrides], { folder: folder, override: override });

  let tokenHandlerUtil = <TokenHandlerLib>await Contract.deploy("TokenHandlerUtil", deployer, [overrides], { folder: folder, override: override });

  let engineAttribute = <EngineUtil>await Contract.deploy("EngineAttribute", deployer, [overrides], { folder: folder, override: override });

  let engineUtil = <EngineUtil>await Contract.deployWithLib("EngineUtil",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
    },
    deployer, [overrides], { folder: folder, override: override });

  let engineCheck = <EngineCheck>await Contract.deploy("EngineCheck", deployer, [overrides], { folder: folder, override: override });
  let engineOutput = <EngineOutput>await Contract.deployWithLib("EngineOutput",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
    },
    deployer, [overrides], { folder: folder, override: override });
  let engineInput = <EngineInput>await Contract.deployWithLib("EngineInput",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address,
      "contracts/V3/EngineCheck.sol:EngineCheck": engineCheck.address
    },
    deployer, [overrides], { folder: folder, override: override });

  let engineView = <EngineView>await Contract.deployWithLib("EngineView",
    {
      "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address,
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address
    },
    deployer, [overrides], { folder: folder, override: override });

  let engineProxy = <Engine>await Contract.deployProxyWithLib("Engine",
    {
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/EngineInput.sol:EngineInput": engineInput.address,
      "contracts/V3/EngineOutput.sol:EngineOutput": engineOutput.address
    }, deployer, [overrides], {
      folder: folder,
      override: override
    }, proxyIntakeAdmin.address, null, false);

  log.debug("poolTokenInputProxy: grantRole[TRANSFER_ROLE] to Engine");
  let tx = await poolTokenInputProxy.grantRole(TRANSFER_ROLE, engineProxy.address, overrides);
  await tx.wait();
  log.debug("poolTokenTransferProxy: grantRole[TRANSFER_ROLE] to Engine");
  tx = await poolTokenTransferProxy.grantRole(TRANSFER_ROLE, engineProxy.address, overrides);
  await tx.wait();
  log.debug("poolTokenMintProxy: grantRole[MINTER_ROLE] to Engine");
  tx = await poolTokenMintProxy.grantRole(MINTER_ROLE, engineProxy.address, overrides);
  await tx.wait();

  let stateCounterProxy = <StateCounter>await Contract.deployProxy("StateCounter", deployer, [engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);

  let poolFeeProxy = <PoolFee>await Contract.deployProxy("PoolFee", deployer, [engineProxy.address, clusterHandlerAreaProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);

  let clusterRuleAreaUtil = <ClusterRuleAreaUtil>await Contract.deploy("ClusterRuleAreaUtil", deployer, [overrides], { folder: folder, override: override });
  let clusterRuleAreaProcess = <ClusterRuleAreaProcess>await Contract.deploy("ClusterRuleAreaProcess", deployer, [overrides], { folder: folder, override: override });

  let clusterAreaProxy = <ClusterArea>await Contract.deployProxyWithLib(
    "ClusterArea",
    {
      "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
    }, deployer, [overrides], {
      folder: folder,
      override: override
    }, proxyIntakeAdmin.address, null, false);

  let clusterRuleAreaProxy = <ProxyIntake>await Contract.deployProxyWithLib(
    "ClusterRuleArea",
    {
      "contracts/V3/ClusterRuleAreaUtil.sol:ClusterRuleAreaUtil": clusterRuleAreaUtil.address,
      "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
    }, deployer, [clusterAreaProxy.address, poolContract.address, poolFeeProxy.address, engineProxy.address, overrides], {
      folder: folder,
      override: override
    }, proxyIntakeAdmin.address);

  let clusterRuleAreaHandlerProxy = <ClusterRuleAreaHandler>await Contract.deployProxyWithLib(
    "ClusterRuleAreaHandler",
    {
      "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
    }, deployer, [clusterAreaProxy.address, poolContract.address, poolFeeProxy.address, engineProxy.address, overrides], {
      folder: folder,
      override: override
    }, proxyIntakeAdmin.address);

  let clusterAttributeAreaProxy = <ClusterAttributeArea>await Contract.deployProxy("ClusterAttributeArea", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
  let clusterAttributeAreaTokenProxy = <ClusterAttributeAreaToken>await Contract.deployProxy("ClusterAttributeAreaToken", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, clusterAttributeAreaProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
  let clusterMountingAreaProxy = <ClusterMountingArea>await Contract.deployProxy("ClusterMountingArea", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);

  tx = await clusterAreaProxy.initialize(poolContract.address, engineProxy.address, poolFeeProxy.address, clusterRuleAreaProxy.address, clusterRuleAreaHandlerProxy.address, clusterAttributeAreaProxy.address, clusterAttributeAreaTokenProxy.address, clusterMountingAreaProxy.address);
  await tx.wait();

  //engine
  tx = await engineProxy.initialize(poolTokenInputProxy.address, poolFeeProxy.address);
  await tx.wait();


  log.info("clusterHandlerArea.add...");

  //------------------------------ others ------------------------------
  tx = await clusterHandlerAreaProxy.add("Engine", "Engine", engineProxy.address, overrides);
  await tx.wait();
  tx = await clusterHandlerAreaProxy.updateState(engineProxy.address, HANDLER_STATE.ACCEPTED);
  await tx.wait();
  let hs = (await clusterHandlerAreaProxy.get(engineProxy.address));
  log.debug("add engineProxy", "state", hs[1].state);

  tx = await clusterHandlerAreaProxy.add("ClusterArea", "ClusterArea", clusterAreaProxy.address, overrides);
  await tx.wait();
  tx = await clusterHandlerAreaProxy.updateState(clusterAreaProxy.address, HANDLER_STATE.ACCEPTED);
  await tx.wait();
  hs = (await clusterHandlerAreaProxy.get(clusterAreaProxy.address));
  log.debug("add clusterAreaProxy", "state", hs[1].state);
  log.debug();
  log.debug(proxyIntakeAdmin.address, "(proxyIntakeAdmin address)");
  log.debug(clusterHandlerAreaProxy.address, "(clusterHandlerAreaProxy address)");
  log.debug(clusterAreaProxy.address, "(clusterAreaProxy address)");
  log.debug(clusterRuleAreaProxy.address, "(clusterRuleAreaProxy address)");
  log.debug(clusterRuleAreaHandlerProxy.address, "(clusterRuleAreaHandlerProxy address)");
  log.debug(clusterAttributeAreaProxy.address, "(clusterAttributeAreaProxy address)");
  log.debug(clusterAttributeAreaTokenProxy.address, "(clusterAttributeAreaTokenProxy address)");
  log.debug(clusterMountingAreaProxy.address, "(clusterMountingAreaProxy address)");
  log.debug(stateCounterProxy.address, "(stateCounterProxy address)");
  log.debug(poolFeeProxy.address, "(poolFeeProxy address)");
  log.debug(engineView.address, "(engineView address)");
  log.debug(engineProxy.address, "(engineProxy address)");
  log.debug(poolTokenInputProxy.address, "(poolTokenInputProxy system address)");
  log.debug(poolTokenMintProxy.address, "(poolTokenMintProxy system address)");
  log.debug(poolTokenTransferProxy.address, "(poolTokenTransferProxy system address)");
  log.debug(poolContract.address, "(poolContract address)");
  log.debug(randomGenerator.address, "(randomGenerator address)");
  log.debug();

  return {
    proxyIntakeAdminAddress: proxyIntakeAdmin.address,
    clusterHandlerAreaProxyAddress: clusterHandlerAreaProxy.address,
    clusterAreaProxyAddress: clusterAreaProxy.address,
    clusterRuleAreaProxyAddress: clusterRuleAreaProxy.address,
    clusterRuleAreaHandlerProxyAddress: clusterRuleAreaHandlerProxy.address,
    clusterAttributeAreaProxyAddress: clusterAttributeAreaProxy.address,
    clusterAttributeAreaTokenProxyAddress: clusterAttributeAreaTokenProxy.address,
    clusterMountingAreaProxyAddress: clusterMountingAreaProxy.address,
    stateCounterProxyAddress: stateCounterProxy.address,
    poolFeeProxyAddress: poolFeeProxy.address,
    engineViewAddress: engineView.address,
    engineProxyAddress: engineProxy.address,
    poolContractAddress: poolContract.address,
    randomGeneratorAddress: randomGenerator.address,
    poolTokenInputAddress: poolTokenInputProxy.address,
    poolTokenMintAddress: poolTokenMintProxy.address,
    poolTokenTransferAddress: poolTokenTransferProxy.address,
  };
}

export async function deployEnginePessimistic(deployer: Signer,chainId:number, folder?: string = undefined, override?: boolean = true) {
  log.info("--------------------- deploy Engine ---------------------------");
  let overrides = { gasLimit: 10000000,gasPrice: 1500000000};
  let lastProgress=await getProgress(chainId,folder)
  let proxyIntakeAdmin:ProxyIntakeAdmin
  //1
  if(lastProgress<=0){
    proxyIntakeAdmin = <ProxyIntakeAdmin>await Contract.deploy("ProxyIntakeAdmin", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,1);
  }else{
    console.log("load ProxyIntakeAdmin");
    proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder }));
  }

  //2
  let poolTokenAllocationImpl:PoolTokenAllocation
  if(lastProgress<=1){
    poolTokenAllocationImpl = <PoolTokenAllocation>await Contract.deploy("PoolTokenAllocation", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,2);
  }else{
    console.log("load PoolTokenAllocation");
    poolTokenAllocationImpl=<PoolTokenAllocation>(await Contract.getByDeployment(chainId, "PoolTokenAllocation", deployer, { folder: folder }));
  }

  //3
  let poolTokenImpl:PoolToken
  if(lastProgress<=2){
    poolTokenImpl = <PoolToken>await Contract.deploy("PoolToken", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,3);
  }else{
    console.log("load PoolToken");
    poolTokenImpl=<PoolToken>(await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder }));
  }
  //4
  let poolTokenAllocationInputProxy
  if(lastProgress<=3){
    poolTokenAllocationInputProxy = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Input", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
    await saveProgress(folder,chainId,4);
  }else{
    console.log("load PoolTokenAllocation Input");
    poolTokenAllocationInputProxy=<PoolTokenAllocation>(await Contract.getByDeployment(chainId, "PoolTokenAllocation", deployer, { folder: folder , saveName: "Input"},true));
  }

  //5
  let poolTokenInputProxy
  if(lastProgress<=4){
     poolTokenInputProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationInputProxy.address, "ChaosInput", "CI", overrides], { folder: folder, saveName: "Input", override: override }, proxyIntakeAdmin.address, poolTokenImpl);
    await saveProgress(folder,chainId,5);
  }else{
    console.log("load PoolToken Input");
    poolTokenInputProxy=<PoolToken>(await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder , saveName: "Input"},true));

  }

  //6
  let poolTokenAllocationMintProxy:PoolTokenAllocation
  if(lastProgress<=5){
    poolTokenAllocationMintProxy= <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Mint", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
    await saveProgress(folder,chainId,6);
  }else{
    console.log("load PoolTokenAllocation Mint");
    poolTokenAllocationMintProxy=<PoolTokenAllocation>(await Contract.getByDeployment(chainId, "PoolTokenAllocation", deployer, { folder: folder , saveName: "Mint"},true));
  }

  //7
  let poolTokenMintProxy:PoolToken
  if(lastProgress<=6){
    poolTokenMintProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationMintProxy.address, "ChaosMint", "CM", overrides], { folder: folder, saveName: "Mint", override: override }, proxyIntakeAdmin.address, poolTokenImpl);
    await saveProgress(folder,chainId,7);
  }else{
    console.log("load PoolToken Mint");
    poolTokenMintProxy=<PoolToken>(await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder , saveName: "Mint"},true));
  }

  //8
  let poolTokenAllocationTransferProxy
  if(lastProgress<=7){
    poolTokenAllocationTransferProxy = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", deployer, [overrides], { folder: folder, saveName: "Transfer", override: override }, proxyIntakeAdmin.address, poolTokenAllocationImpl, false);
    await saveProgress(folder,chainId,8);
  }else{
    console.log("load PoolTokenAllocation Transfer");
    poolTokenAllocationTransferProxy=<PoolTokenAllocation>(await Contract.getByDeployment(chainId, "PoolTokenAllocation", deployer, { folder: folder , saveName: "Transfer"},true));
  }

  //9
  let poolTokenTransferProxy
  if(lastProgress<=8){
     poolTokenTransferProxy = <PoolToken>await Contract.deployProxy("PoolToken", deployer, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationTransferProxy.address, "ChaosTransfer", "CT", overrides], { folder: folder, saveName: "Transfer", override: override }, proxyIntakeAdmin.address, poolTokenImpl);
    await saveProgress(folder,chainId,9);
  }else{
    console.log("load PoolToken Transfer");
    poolTokenTransferProxy=<PoolToken>(await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder , saveName: "Transfer"},true));
  }




  ///
  /// ============ Engine ============
  ///

  //10
  let poolContract
  if(lastProgress<=9) {
    poolContract = <PoolContract>await Contract.deploy("PoolContract", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,10);
  }else{
    console.log("load PoolContract");
    poolContract=<PoolContract>(await Contract.getByDeployment(chainId, "PoolContract", deployer, { folder: folder }));
  }

  //11
  let randomGenerator
  if(lastProgress<=10) {
    randomGenerator = <PoolContract>await Contract.deploy("RandomGenerator", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,11);
  }else{
    console.log("load RandomGenerator");
    randomGenerator=<PoolContract>(await Contract.getByDeployment(chainId, "RandomGenerator", deployer, { folder: folder }));
  }

  //12
  let clusterHandlerAreaProxy
  if(lastProgress<=11){
    clusterHandlerAreaProxy = <ClusterHandlerArea>await Contract.deployProxy("ClusterHandlerArea", deployer, [overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,12);
  }else{
    console.log("load ClusterHandlerArea");
    clusterHandlerAreaProxy=<ClusterHandlerArea>(await Contract.getByDeployment(chainId, "ClusterHandlerArea", deployer, { folder: folder },true));
  }
  //13
  let transfer
  if(lastProgress<=12){
    transfer = <Transfer>await Contract.deploy("Transfer", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,13);
  }else{
    console.log("load Transfer");
    transfer=<Transfer>(await Contract.getByDeployment(chainId, "Transfer", deployer, { folder: folder }));
  }
  //14
  let tokenHandlerUtil
  if(lastProgress<=13){
    tokenHandlerUtil = <TokenHandlerLib>await Contract.deploy("TokenHandlerUtil", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,14);
  }else{
    console.log("load TokenHandlerUtil");
    tokenHandlerUtil=<TokenHandlerLib>(await Contract.getByDeployment(chainId, "TokenHandlerUtil", deployer, { folder: folder }));
  }
  //15
  let engineAttribute
  if(lastProgress<=14) {
    engineAttribute = <EngineUtil>await Contract.deploy("EngineAttribute", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,15);
  }else{
    console.log("load EngineAttribute");
    engineAttribute=<EngineUtil>(await Contract.getByDeployment(chainId, "EngineAttribute", deployer, { folder: folder }));
  }

  //16
  let engineUtil
  if(lastProgress<=15){
    engineUtil = <EngineUtil>await Contract.deployWithLib("EngineUtil",
        {
          "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
          "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
        },
        deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,16);
  }else{
    console.log("load EngineUtil");
    engineUtil=<EngineUtil>(await Contract.getByDeployment(chainId, "EngineUtil", deployer, { folder: folder }));
  }


  let engineCheck
  if(lastProgress<=16){
     engineCheck = <EngineCheck>await Contract.deploy("EngineCheck", deployer, [overrides], { folder: folder, override: override });
     await saveProgress(folder,chainId,17);
  }else{
    console.log("load EngineCheck");
    engineCheck=<EngineCheck>(await Contract.getByDeployment(chainId, "EngineCheck", deployer, { folder: folder }));
  }

  let engineOutput
  if(lastProgress<=17){
     engineOutput = <EngineOutput>await Contract.deployWithLib("EngineOutput",
        {
          "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
          "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
          "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address,
          "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
        },
        deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,18);
  }else{
    console.log("load EngineOutput");
    engineOutput=<EngineOutput>(await Contract.getByDeployment(chainId, "EngineOutput", deployer, { folder: folder }));
  }

  let engineInput
  if(lastProgress<=18){
     engineInput = <EngineInput>await Contract.deployWithLib("EngineInput",
        {
          "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
          "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
          "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address,
          "contracts/V3/EngineCheck.sol:EngineCheck": engineCheck.address
        },
        deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,19);

  }else{
    console.log("load EngineInput");
    engineInput=<EngineInput>(await Contract.getByDeployment(chainId, "EngineInput", deployer, { folder: folder }));
  }

  let engineView
  if(lastProgress<=19){
     engineView = <EngineView>await Contract.deployWithLib("EngineView",
        {
          "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address,
          "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address
        },
        deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,20);

  }else{
    console.log("load EngineView");
    engineView=<EngineView>(await Contract.getByDeployment(chainId, "EngineView", deployer, { folder: folder }));
  }

  let engineProxy
  if(lastProgress<=20){
    engineProxy = <Engine>await Contract.deployProxyWithLib("Engine",
        {
          "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
          "contracts/V3/EngineInput.sol:EngineInput": engineInput.address,
          "contracts/V3/EngineOutput.sol:EngineOutput": engineOutput.address
        }, deployer, [overrides], {
          folder: folder,
          override: override
        }, proxyIntakeAdmin.address, null, false);
    await saveProgress(folder,chainId,21);

  }else{
    console.log("load Engine");
    engineProxy=<Engine>(await Contract.getByDeployment(chainId, "Engine", deployer, { folder: folder },true));
  }



  if(lastProgress<=21){
    log.debug("poolTokenInputProxy: grantRole[TRANSFER_ROLE] to Engine");
    let tx = await poolTokenInputProxy.grantRole(TRANSFER_ROLE, engineProxy.address, overrides);
    await tx.wait();
    await saveProgress(folder,chainId,22);

  }

  if(lastProgress<=22){
    log.debug("poolTokenTransferProxy: grantRole[TRANSFER_ROLE] to Engine");
    let tx = await poolTokenTransferProxy.grantRole(TRANSFER_ROLE, engineProxy.address, overrides);
    await tx.wait();
    await saveProgress(folder,chainId,23);
  }

  if(lastProgress<=23){
    log.debug("poolTokenMintProxy: grantRole[MINTER_ROLE] to Engine");
    let tx = await poolTokenMintProxy.grantRole(MINTER_ROLE, engineProxy.address, overrides);
    await tx.wait();
    await saveProgress(folder,chainId,24);
  }

  let stateCounterProxy
  if(lastProgress<=24){
     stateCounterProxy = <StateCounter>await Contract.deployProxy("StateCounter", deployer, [engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,25);

  }else{
    console.log("load StateCounter");
    stateCounterProxy=<StateCounter>(await Contract.getByDeployment(chainId, "StateCounter", deployer, { folder: folder },true));
  }

  let poolFeeProxy
  if(lastProgress<=25){
    poolFeeProxy = <PoolFee>await Contract.deployProxy("PoolFee", deployer, [engineProxy.address, clusterHandlerAreaProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,26);

  }else{
    console.log("load PoolFee");
    poolFeeProxy=<PoolFee>(await Contract.getByDeployment(chainId, "PoolFee", deployer, { folder: folder },true));
  }

  let clusterRuleAreaUtil
  if(lastProgress<=26){
    clusterRuleAreaUtil = <ClusterRuleAreaUtil>await Contract.deploy("ClusterRuleAreaUtil", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,27);
  }else{
    console.log("load ClusterRuleAreaUtil");
    clusterRuleAreaUtil=<ClusterRuleAreaUtil>(await Contract.getByDeployment(chainId, "ClusterRuleAreaUtil", deployer, { folder: folder }));
  }

  let clusterRuleAreaProcess
  if(lastProgress<=27){
    clusterRuleAreaProcess = <ClusterRuleAreaProcess>await Contract.deploy("ClusterRuleAreaProcess", deployer, [overrides], { folder: folder, override: override });
    await saveProgress(folder,chainId,28);
  }else{
    console.log("load ClusterRuleAreaProcess");
    clusterRuleAreaProcess=<ClusterRuleAreaProcess>(await Contract.getByDeployment(chainId, "ClusterRuleAreaProcess", deployer, { folder: folder }));
  }

  let clusterAreaProxy
  if(lastProgress<=28){
    clusterAreaProxy = <ClusterArea>await Contract.deployProxyWithLib(
        "ClusterArea",
        {
          "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
        }, deployer, [overrides], {
          folder: folder,
          override: override
        }, proxyIntakeAdmin.address, null, false);
    await saveProgress(folder,chainId,29);

  }else{
    console.log("load ClusterArea");
    clusterAreaProxy=<ClusterArea>(await Contract.getByDeployment(chainId, "ClusterArea", deployer, { folder: folder },true));
  }

  let clusterRuleAreaProxy
  if(lastProgress<=29){
    clusterRuleAreaProxy = <ProxyIntake>await Contract.deployProxyWithLib(
        "ClusterRuleArea",
        {
          "contracts/V3/ClusterRuleAreaUtil.sol:ClusterRuleAreaUtil": clusterRuleAreaUtil.address,
          "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
        }, deployer, [clusterAreaProxy.address, poolContract.address, poolFeeProxy.address, engineProxy.address, overrides], {
          folder: folder,
          override: override
        }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,30);

  }else{
    console.log("load ClusterRuleArea");
    clusterRuleAreaProxy=<ProxyIntake>(await Contract.getByDeployment(chainId, "ClusterRuleArea", deployer, { folder: folder },true));
  }

  let clusterRuleAreaHandlerProxy
  if(lastProgress<=30){
    clusterRuleAreaHandlerProxy = <ClusterRuleAreaHandler>await Contract.deployProxyWithLib(
        "ClusterRuleAreaHandler",
        {
          "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
        }, deployer, [clusterAreaProxy.address, poolContract.address, poolFeeProxy.address, engineProxy.address, overrides], {
          folder: folder,
          override: override
        }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,31);
  } else{
    console.log("load ClusterRuleAreaHandler");
    clusterRuleAreaHandlerProxy=<ClusterRuleAreaHandler>(await Contract.getByDeployment(chainId, "ClusterRuleAreaHandler", deployer, { folder: folder },true));
  }

  let clusterAttributeAreaProxy
  if(lastProgress<=31){
    clusterAttributeAreaProxy = <ClusterAttributeArea>await Contract.deployProxy("ClusterAttributeArea", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,32);

  }else{
    console.log("load ClusterRuleAreaHandler");
    clusterAttributeAreaProxy=<ClusterAttributeArea>(await Contract.getByDeployment(chainId, "ClusterAttributeArea", deployer, { folder: folder },true));
  }

  let clusterAttributeAreaTokenProxy
  if(lastProgress<=32){
    clusterAttributeAreaTokenProxy = <ClusterAttributeAreaToken>await Contract.deployProxy("ClusterAttributeAreaToken", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, clusterAttributeAreaProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,33);

  }else{
    console.log("load ClusterRuleAreaHandler");
    clusterAttributeAreaTokenProxy=<ClusterAttributeAreaToken>(await Contract.getByDeployment(chainId, "ClusterAttributeAreaToken", deployer, { folder: folder },true));
  }

  let clusterMountingAreaProxy
  if(lastProgress<=33){
    clusterMountingAreaProxy = <ClusterMountingArea>await Contract.deployProxy("ClusterMountingArea", deployer, [clusterAreaProxy.address, poolContract.address, engineProxy.address, overrides], { folder: folder, override: override }, proxyIntakeAdmin.address);
    await saveProgress(folder,chainId,34);

  }else{
    console.log("load ClusterMountingArea");
    clusterMountingAreaProxy=<ClusterMountingArea>(await Contract.getByDeployment(chainId, "ClusterMountingArea", deployer, { folder: folder },true));
  }

  if(lastProgress<=34){
    let tx = await clusterAreaProxy.initialize(poolContract.address, engineProxy.address, poolFeeProxy.address, clusterRuleAreaProxy.address, clusterRuleAreaHandlerProxy.address, clusterAttributeAreaProxy.address, clusterAttributeAreaTokenProxy.address, clusterMountingAreaProxy.address);
    await tx.wait();
    await saveProgress(folder,chainId,35);
  }

  if(lastProgress<=35){
    //engine
    let tx = await engineProxy.initialize(poolTokenInputProxy.address, poolFeeProxy.address);
    await tx.wait();
    await saveProgress(folder,chainId,36);

  }

  if(lastProgress<=36){
    log.info("clusterHandlerArea.add...");

    //------------------------------ others ------------------------------
    let tx = await clusterHandlerAreaProxy.add("Engine", "Engine", engineProxy.address, overrides);
    await tx.wait();
    await saveProgress(folder,chainId,37);

  }

  if(lastProgress<=37){
    let tx = await clusterHandlerAreaProxy.updateState(engineProxy.address, HANDLER_STATE.ACCEPTED);
    await tx.wait();
    await saveProgress(folder,chainId,38);
  }

  let hs = (await clusterHandlerAreaProxy.get(engineProxy.address));
  log.debug("add engineProxy", "state", hs[1].state);

  if(lastProgress<=38){
    let tx = await clusterHandlerAreaProxy.add("ClusterArea", "ClusterArea", clusterAreaProxy.address, overrides);
    await tx.wait();
    await saveProgress(folder,chainId,39);
  }

  if(lastProgress<=39){
    let tx = await clusterHandlerAreaProxy.updateState(clusterAreaProxy.address, HANDLER_STATE.ACCEPTED);
    await tx.wait();
    await saveProgress(folder,chainId,40);
  }


  hs = (await clusterHandlerAreaProxy.get(clusterAreaProxy.address));
  log.debug("add clusterAreaProxy", "state", hs[1].state);

  log.debug();
  log.debug(proxyIntakeAdmin.address, "(proxyIntakeAdmin address)");
  log.debug(clusterHandlerAreaProxy.address, "(clusterHandlerAreaProxy address)");
  log.debug(clusterAreaProxy.address, "(clusterAreaProxy address)");
  log.debug(clusterRuleAreaProxy.address, "(clusterRuleAreaProxy address)");
  log.debug(clusterRuleAreaHandlerProxy.address, "(clusterRuleAreaHandlerProxy address)");
  log.debug(clusterAttributeAreaProxy.address, "(clusterAttributeAreaProxy address)");
  log.debug(clusterAttributeAreaTokenProxy.address, "(clusterAttributeAreaTokenProxy address)");
  log.debug(clusterMountingAreaProxy.address, "(clusterMountingAreaProxy address)");
  log.debug(stateCounterProxy.address, "(stateCounterProxy address)");
  log.debug(poolFeeProxy.address, "(poolFeeProxy address)");
  log.debug(engineView.address, "(engineView address)");
  log.debug(engineProxy.address, "(engineProxy address)");
  log.debug(poolTokenInputProxy.address, "(poolTokenInputProxy system address)");
  log.debug(poolTokenMintProxy.address, "(poolTokenMintProxy system address)");
  log.debug(poolTokenTransferProxy.address, "(poolTokenTransferProxy system address)");
  log.debug(poolContract.address, "(poolContract address)");
  log.debug(randomGenerator.address, "(randomGenerator address)");
  log.debug();

  return {
    proxyIntakeAdminAddress: proxyIntakeAdmin.address,
    clusterHandlerAreaProxyAddress: clusterHandlerAreaProxy.address,
    clusterAreaProxyAddress: clusterAreaProxy.address,
    clusterRuleAreaProxyAddress: clusterRuleAreaProxy.address,
    clusterRuleAreaHandlerProxyAddress: clusterRuleAreaHandlerProxy.address,
    clusterAttributeAreaProxyAddress: clusterAttributeAreaProxy.address,
    clusterAttributeAreaTokenProxyAddress: clusterAttributeAreaTokenProxy.address,
    clusterMountingAreaProxyAddress: clusterMountingAreaProxy.address,
    stateCounterProxyAddress: stateCounterProxy.address,
    poolFeeProxyAddress: poolFeeProxy.address,
    engineViewAddress: engineView.address,
    engineProxyAddress: engineProxy.address,
    poolContractAddress: poolContract.address,
    randomGeneratorAddress: randomGenerator.address,
    poolTokenInputAddress: poolTokenInputProxy.address,
    poolTokenMintAddress: poolTokenMintProxy.address,
    poolTokenTransferAddress: poolTokenTransferProxy.address,
  };
}

export async function loadEngine(deployer: Signer, folder?: string = undefined) {
  let chainId = await deployer.getChainId();
  log.info(`--------------------- load Engine from ${chainId} ---------------------------`);

  let poolTokenInput = <PoolToken>await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder, saveName: "Input" }, true);
  let poolTokenMint = <PoolToken>await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder, saveName: "Mint" }, true);
  let poolTokenTransfer = <PoolToken>await Contract.getByDeployment(chainId, "PoolToken", deployer, { folder: folder, saveName: "Transfer" }, true);

  let poolContract = <PoolContract>await Contract.getByDeployment(chainId, "PoolContract", deployer, { folder: folder });
  let randomGenerator = <PoolContract>await Contract.getByDeployment(chainId, "RandomGenerator", deployer, { folder: folder });

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder }));

  let clusterRuleAreaUtil = <ClusterRuleAreaUtil>await Contract.getByDeployment(chainId, "ClusterRuleAreaUtil", deployer, { folder: folder });
  let clusterAreaProxy = <ClusterArea>(await Contract.getByDeployment(chainId, "ClusterArea", deployer, { folder: folder }, true));
  let clusterRuleAreaProxy = <ClusterRuleArea>(await Contract.getByDeployment(chainId, "ClusterRuleArea", deployer, { folder: folder }, true));
  let clusterRuleAreaHandlerProxy = <ClusterRuleAreaHandler>(await Contract.getByDeployment(chainId, "ClusterRuleAreaHandler", deployer, { folder: folder }, true));
  let clusterAttributeAreaProxy = <ClusterAttributeArea>(await Contract.getByDeployment(chainId, "ClusterAttributeArea", deployer, { folder: folder }, true));
  let clusterAttributeAreaTokenProxy = <ClusterAttributeAreaToken>(await Contract.getByDeployment(chainId, "ClusterAttributeAreaToken", deployer, { folder: folder }, true));
  let clusterMountingAreaProxy = <ClusterMountingArea>(await Contract.getByDeployment(chainId, "ClusterMountingArea", deployer, { folder: folder }, true));

  let clusterHandlerAreaProxy = <ClusterHandlerArea>(await Contract.getByDeployment(chainId, "ClusterHandlerArea", deployer, { folder: folder }, true));

  let engineOutput = <EngineOutput>await Contract.getByDeployment(chainId, "EngineOutput", deployer, { folder: folder });
  let engineInput = <EngineInput>await Contract.getByDeployment(chainId, "EngineInput", deployer, { folder: folder });

  let engineProxy = <Engine>(await Contract.getByDeployment(chainId, "Engine", deployer, { folder: folder }, true));

  let engineView = <EngineView>(await Contract.getByDeployment(chainId, "EngineView", deployer, { folder: folder }));

  let stateCounterProxy = <StateCounter>await Contract.getByDeployment(chainId, "StateCounter", deployer, { folder: folder }, true);

  let poolFeeProxy = <PoolFee>await Contract.getByDeployment(chainId, "PoolFee", deployer, { folder: folder }, true);


  log.debug();
  log.debug(clusterHandlerAreaProxy.address, "(clusterHandlerAreaProxy address)");
  log.debug(clusterAreaProxy.address, "(clusterAreaProxy address)");
  log.debug(clusterRuleAreaProxy.address, "(clusterRuleAreaProxy address)");
  log.debug(clusterRuleAreaHandlerProxy.address, "(clusterRuleAreaHandlerProxy address)");
  log.debug(clusterAttributeAreaProxy.address, "(clusterAttributeAreaProxy address)");
  log.debug(clusterAttributeAreaTokenProxy.address, "(clusterAttributeAreaTokenProxy address)");
  log.debug(clusterMountingAreaProxy.address, "(clusterMountingAreaProxy address)");
  log.debug(stateCounterProxy.address, "(stateCounterProxy address)");
  log.debug(poolFeeProxy.address, "(poolFeeProxy address)");
  log.debug(engineProxy.address, "(engineProxy address)");
  log.debug(engineView.address, "(engineView address)");
  log.debug(randomGenerator.address, "(randomGenerator address)");
  log.debug(poolContract.address, "(poolContract address)");
  log.debug(poolTokenInput.address, "(poolTokenInput system address)");
  log.debug(poolTokenMint.address, "(poolTokenMint system address)");
  log.debug(poolTokenTransfer.address, "(poolTokenTransfer system address)");

  return {
    proxyIntakeAdminAddress: proxyIntakeAdmin.address,
    clusterHandlerAreaProxyAddress: clusterHandlerAreaProxy.address,
    clusterAreaProxyAddress: clusterAreaProxy.address,
    clusterRuleAreaProxyAddress: clusterRuleAreaProxy.address,
    clusterRuleAreaHandlerProxyAddress: clusterRuleAreaHandlerProxy.address,
    clusterAttributeAreaProxyAddress: clusterAttributeAreaProxy.address,
    clusterAttributeAreaTokenProxyAddress: clusterAttributeAreaTokenProxy.address,
    clusterMountingAreaProxyAddress: clusterMountingAreaProxy.address,
    stateCounterProxyAddress: stateCounterProxy.address,
    poolFeeProxyAddress: poolFeeProxy.address,
    engineProxyAddress: engineProxy.address,
    engineViewAddress: engineView.address,
    poolContractAddress: poolContract.address,
    randomGeneratorAddress: randomGenerator.address,
    poolTokenInputAddress: poolTokenInput.address,
    poolTokenMintAddress: poolTokenMint.address,
    poolTokenTransferAddress: poolTokenTransfer.address
  };
}

export async function loadEngineContractList(deployer: Signer, folder?: string = undefined) {
  let chainId = await deployer.getChainId();
  log.info(`--------------------- load Engine from ${chainId} ---------------------------`);

  let contractList = [];

  contractList.push(await Contract.getDeployment(chainId, "PoolToken", deployer, { name: "PoolTokenInput", folder: folder, saveName: "Input" }));
  contractList.push(await Contract.getDeployment(chainId, "PoolToken", deployer, { name: "PoolTokenMint", folder: folder, saveName: "Mint" }));
  contractList.push(await Contract.getDeployment(chainId, "PoolToken", deployer, {
    name: "PoolTokenTransfer",
    folder: folder,
    saveName: "Transfer"
  }));

  contractList.push(await Contract.getDeployment(chainId, "PoolContract", deployer, { name: "PoolContract", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "RandomGenerator", deployer, { name: "RandomGenerator", folder: folder, saveName: "" }));

  contractList.push(await Contract.getDeployment(chainId, "ProxyIntakeAdmin", deployer, { name: "proxyIntakeAdmin", folder: folder, saveName: "" }));

  contractList.push(await Contract.getDeployment(chainId, "ClusterRuleAreaUtil", deployer, {
    name: "ClusterRuleAreaUtil",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterArea", deployer, { name: "ClusterArea", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterAreaProxy",
    folder: folder,
    saveName: "ClusterAreaProxy"
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterRuleArea", deployer, { name: "ClusterRuleArea", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterRuleAreaProxy",
    folder: folder,
    saveName: "ClusterRuleAreaProxy"
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterRuleAreaHandler", deployer, {
    name: "ClusterRuleAreaHandler",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterRuleAreaHandlerProxy",
    folder: folder,
    saveName: "ClusterRuleAreaHandlerProxy"
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterAttributeArea", deployer, {
    name: "ClusterAttributeArea",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterAttributeAreaProxy",
    folder: folder,
    saveName: "ClusterAttributeAreaProxy"
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterAttributeAreaToken", deployer, {
    name: "ClusterAttributeAreaToken",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterAttributeAreaTokenProxy",
    folder: folder,
    saveName: "ClusterAttributeAreaTokenProxy"
  }));
  contractList.push(await Contract.getDeployment(chainId, "ClusterMountingArea", deployer, {
    name: "ClusterMountingArea",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterMountingAreaProxy",
    folder: folder,
    saveName: "ClusterMountingAreaProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "ClusterHandlerArea", deployer, {
    name: "ClusterHandlerArea",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "clusterHandlerAreaProxy",
    folder: folder,
    saveName: "ClusterHandlerAreaProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "EngineOutput", deployer, { name: "EngineOutput", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "EngineInput", deployer, { name: "EngineInput", folder: folder, saveName: "" }));

  contractList.push(await Contract.getDeployment(chainId, "Engine", deployer, { name: "Engine", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, { name: "engineProxy", folder: folder, saveName: "EngineProxy" }));

  contractList.push(await Contract.getDeployment(chainId, "EngineView", deployer, { name: "EngineView", folder: folder, saveName: "" }));

  contractList.push(await Contract.getDeployment(chainId, "StateCounter", deployer, { name: "StateCounter", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "stateCounterProxy",
    folder: folder,
    saveName: "StateCounterProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "PoolFee", deployer, { name: "PoolFee", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "poolFeeProxy",
    folder: folder,
    saveName: "PoolFeeProxy"
  }));


  contractList.push(await Contract.getDeployment(chainId, "WhiteListHandler", deployer, { name: "WhiteListHandler", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "WhiteListHandlerProxy",
    folder: folder,
    saveName: "WhiteListHandlerProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "AllocateHandler", deployer, { name: "AllocateHandler", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "AllocateHandlerProxy",
    folder: folder,
    saveName: "AllocateHandlerProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "AllocateLayerHandler", deployer, {
    name: "AllocateLayerHandler",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "AllocateLayerHandlerProxy",
    folder: folder,
    saveName: "AllocateLayerHandlerProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "RestrictHandler", deployer, { name: "RestrictHandler", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "RestrictHandlerProxy",
    folder: folder,
    saveName: "RestrictHandlerProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "MineHandler", deployer, { name: "MineHandler", folder: folder, saveName: "" }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "MineHandlerProxy",
    folder: folder,
    saveName: "MineHandlerProxy"
  }));

  contractList.push(await Contract.getDeployment(chainId, "AllocateLimitHandler", deployer, {
    name: "AllocateLimitHandler",
    folder: folder,
    saveName: ""
  }));
  contractList.push(await Contract.getDeployment(chainId, "ProxyIntake", deployer, {
    name: "AllocateLimitHandlerProxy",
    folder: folder,
    saveName: "AllocateLimitHandlerProxy"
  }));

  for (let i = 0; i < contractList.length; ++i) {
    log.debug(contractList[i].contractAddress, "(" + contractList[i].contractName + ")", contractList[i].name);
  }

  return contractList;
}

///
/// ============ upgrade ============
///
export async function upgradeEngine(engineProxyAddress, deployer, folder?: string = undefined) {
  let overrides = { gasLimit: 8000000 };
  let chainId = await deployer.getChainId();
  let transfer = <Transfer>await Contract.deploy("Transfer", deployer, [overrides], { name: "Transfer", folder: folder, saveName: "" });
  let engineAttribute = await Contract.getByDeployment(chainId, "EngineAttribute", deployer, { folder: folder, });
  let engineCheck = await Contract.getByDeployment(chainId, "EngineCheck", deployer, { name: "EngineCheck", folder: folder, saveName: "" });
  let engineUtil = <EngineUtil>await Contract.deployWithLib("EngineUtil",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
    },
    deployer, [overrides], { folder: folder });
  let tokenHandlerUtil = <TokenHandlerLib>await Contract.deploy("TokenHandlerUtil", deployer, [overrides], { folder: folder });

  let engineOutput = <EngineOutput>await Contract.deployWithLib("EngineOutput",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
    },
    deployer, [overrides], { folder: folder });

  let engineInput = <EngineInput>await Contract.deployWithLib("EngineInput",
    {
      "contracts/V3/util/Transfer.sol:Transfer": transfer.address,
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/EngineCheck.sol:EngineCheck": engineCheck.address,
      "contracts/V3/EngineAttribute.sol:EngineAttribute": engineAttribute.address
    },
    deployer, [overrides], { folder: folder });
  let engineView = <EngineView>await Contract.deployWithLib("EngineView",
    {
      "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
      "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil": tokenHandlerUtil.address
    },
    deployer, [overrides], { folder: folder });
  let engine = <Engine>(await Contract.deployWithLib("Engine",
      {
        "contracts/V3/EngineUtil.sol:EngineUtil": engineUtil.address,
        "contracts/V3/EngineInput.sol:EngineInput": engineInput.address,
        "contracts/V3/EngineOutput.sol:EngineOutput": engineOutput.address
      },
      deployer, [overrides], { folder: folder })
  );

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder, }));
  log.debug("----------------------------- engineProxy before impl", await proxyIntakeAdmin.getProxyImplementation(engineProxyAddress), "owner", await proxyIntakeAdmin.owner());

  await proxyIntakeAdmin.upgradeTo(engineProxyAddress, engine.address);

  log.debug("----------------------------- engineProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(engineProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();
  return engine;
}

export async function upgradeClusterArea(clusterAreaProxyAddress, clusterRuleAreaProxyAddress, clusterRuleAreaHandlerProxyAddress, clusterAttributeAreaProxyAddress, clusterAttributeAreaTokenProxyAddress, deployer, folder?: string = undefined) {
  let overrides = { gasLimit: 8000000 };
  let chainId = await deployer.getChainId();

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder, }));

  //pool cluster
  let clusterRuleAreaUtil = <ClusterRuleAreaUtil>await Contract.deploy("ClusterRuleAreaUtil", deployer, [overrides], { folder: folder });
  let clusterRuleAreaProcess = <ClusterRuleAreaProcess>await Contract.deploy("ClusterRuleAreaProcess", deployer, [overrides], { folder: folder });
  let clusterArea = <ClusterArea>(await Contract.deployWithLib("ClusterArea",
      {
        "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
      },
      deployer, [overrides], { folder: folder })
  );

  log.debug();
  log.debug("----------------------------- clusterAreaProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  await proxyIntakeAdmin.upgradeTo(clusterAreaProxyAddress, clusterArea.address);

  log.debug("----------------------------- clusterAreaProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();


  //pool cluster rule
  let clusterRuleArea = <ClusterRuleArea>(await Contract.deployWithLib("ClusterRuleArea",
      {
        "contracts/V3/ClusterRuleAreaUtil.sol:ClusterRuleAreaUtil": clusterRuleAreaUtil.address,
        "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
      },
      deployer, [overrides], { folder: folder })
  );

  log.debug();
  log.debug("----------------------------- clusterRuleAreaProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterRuleAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  await proxyIntakeAdmin.upgradeTo(clusterRuleAreaProxyAddress, clusterRuleArea.address);
  log.debug("----------------------------- clusterRuleAreaProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterRuleAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();


  //pool cluster handler
  let clusterRuleAreaHandler = <ClusterRuleArea>(await Contract.deployWithLib("ClusterRuleAreaHandler",
      {
        "contracts/V3/ClusterRuleAreaProcess.sol:ClusterRuleAreaProcess": clusterRuleAreaProcess.address
      },
      deployer, [overrides], { folder: folder })
  );

  log.debug();
  log.debug("----------------------------- clusterRuleAreaHandlerProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterRuleAreaHandlerProxyAddress), "owner", await proxyIntakeAdmin.owner());
  await proxyIntakeAdmin.upgradeTo(clusterRuleAreaHandlerProxyAddress, clusterRuleAreaHandler.address);
  log.debug("----------------------------- clusterRuleAreaHandlerProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterRuleAreaHandlerProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();


  //pool cluster attribute
  let clusterAttributeArea = <ClusterAttributeArea>(await Contract.deployWithLib("ClusterAttributeArea",
      {
      },
      deployer, [overrides], { folder: folder })
  );

  log.debug();
  log.debug("----------------------------- clusterAttributeAreaProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterAttributeAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  await proxyIntakeAdmin.upgradeTo(clusterAttributeAreaProxyAddress, clusterAttributeArea.address);
  log.debug("----------------------------- clusterAttributeAreaProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterAttributeAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();

  //pool cluster attribute token
  let clusterAttributeAreaToken = <ClusterAttributeAreaToken>(await Contract.deployWithLib("ClusterAttributeAreaToken",
      {},
      deployer, [overrides], { folder: folder })
  );

  log.debug();
  log.debug("----------------------------- clusterAttributeAreaTokenProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterAttributeAreaTokenProxyAddress), "owner", await proxyIntakeAdmin.owner());
  await proxyIntakeAdmin.upgradeTo(clusterAttributeAreaTokenProxyAddress, clusterAttributeAreaToken.address);
  log.debug("----------------------------- clusterAttributeAreaTokenProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterAttributeAreaTokenProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();

  return clusterArea;
}

export async function upgradeStateCounter(stateCounterProxyAddress, deployer, folder?: string = undefined) {
  let overrides = { gasLimit: 8000000 };
  let chainId = await deployer.getChainId();

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder, }));

  let stateCounter = <StateCounter>await Contract.deploy("StateCounter", deployer, [overrides], { folder: folder, });

  log.debug();
  log.debug("----------------------------- stateCounterProxy before impl", await proxyIntakeAdmin.getProxyImplementation(stateCounterProxyAddress), "owner", await proxyIntakeAdmin.owner());

  await proxyIntakeAdmin.upgradeTo(stateCounterProxyAddress, stateCounter.address);

  log.debug("----------------------------- stateCounterProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(stateCounterProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();

  stateCounter = stateCounter.attach(stateCounterProxyAddress);
  return stateCounter;
}

export async function upgradePoolFee(poolFeeProxyAddress, deployer, folder?: string = undefined) {
  let overrides = { gasLimit: 8000000 };
  let chainId = await deployer.getChainId();

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder }));
  let poolFee = <PoolFee>await Contract.deploy("PoolFee", deployer, [overrides], { folder: folder });

  log.debug();
  log.debug("----------------------------- poolFeeProxy before impl", await proxyIntakeAdmin.getProxyImplementation(poolFeeProxyAddress), "owner", await proxyIntakeAdmin.owner());

  await proxyIntakeAdmin.upgradeTo(poolFeeProxyAddress, poolFee.address);

  log.debug("----------------------------- poolFeeProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(poolFeeProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();

  poolFee = poolFee.attach(poolFeeProxyAddress);

  return poolFee;
}


export async function upgradeClusterHandlerArea(clusterHandlerAreaProxyAddress, deployer, folder?: string = undefined) {
  let overrides = { gasLimit: 8000000 };
  let chainId = await deployer.getChainId();

  let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", deployer, { folder: folder, }));
  let clusterHandlerArea = <ClusterHandlerArea>await Contract.deploy("ClusterHandlerArea", deployer, [overrides], { folder: folder, });

  log.debug();
  log.debug("----------------------------- clusterHandlerAreaProxy before impl", await proxyIntakeAdmin.getProxyImplementation(clusterHandlerAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());

  await proxyIntakeAdmin.upgradeTo(clusterHandlerAreaProxyAddress, clusterHandlerArea.address);

  log.debug("----------------------------- clusterHandlerAreaProxy after  impl", await proxyIntakeAdmin.getProxyImplementation(clusterHandlerAreaProxyAddress), "owner", await proxyIntakeAdmin.owner());
  log.debug();

  clusterHandlerArea = await clusterHandlerArea.attach(clusterHandlerAreaProxyAddress);
  return clusterHandlerArea;
}

export async function deploySnippet(contractName: string, deployer: Signer, stateCounter: string, clusterArea: string, folder?: string = undefined, override?: boolean = true) {
  let overrides = {
    gasLimit: 10000000
  };

  let snippet = <Snippet>await Contract.deploy(contractName, deployer, [stateCounter, clusterArea, overrides], {
    name: contractName,
    folder: folder,
    saveName: contractName.toLowerCase(),
    override: override
  });
  return snippet;
}
