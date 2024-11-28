# engine-handler-example
 An example of [RuleOS](https://dev-docs.ruleos.com/) that implements both RedPacket and Mystery Box.

## Requirements
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an output like: `vx.x.x`
- [hardhat](https://hardhat.org/) 
  - It's recommended that you've gone through the [hardhat getting started documentation](https://hardhat.org/getting-started/) before proceeding here. 

## Quick Start

1. Clone and install dependencies

After installing all the requirements, run the following:

```bash
git clone https://github.com/RuleOS/engine-handler-example.git
cd engine-handler-example
```
Then:
```
npm install
```
2. Compile smart contracts and import resources

```
npm run compile(npx hardhat compile && npx hardhat syncV3Artifacts)
```

3. Open the `network.ts` file in the root directory and fill in approximately ten private keys at the indicated prompts.

4. Run a hardhat node
 ```
 npx hardhat node
 ```
5. Test
 ```
 npx ts-node ./engine-test/sdk-plugin/testSDKV3RedPacket.ts
 npx ts-node ./engine-test/sdk-plugin/testSDKV3Allocate.ts
 ```