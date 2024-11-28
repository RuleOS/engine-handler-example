export const protocolJson =
  {
    chainId: 1,
    clusterId: 1,
    delayTimestamp: 0,
    delayBlockNumber: 0,
    deployerList: ["0xe1625667f3435b3dc4d6a0a9bcf3438e1e2098b5"],
    adminList: ["0xe1625667f3435b3dc4d6a0a9bcf3438e1e2098b5"],
    description: "",
    state: 1,
    attrList: [],
    attrStateList: [],
    ruleList: [
      {
        ruleSlotIndexInput: 0,
        ruleSlotIndexOutput: 1,
        totalCount: 100,
        state: 1,
        durationType: 0,
        delayTimestamp: 0,
        delayBlockNumber: 0,
        snippet: "0x0000000000000000000000000000000000000000",
        preHandlerList: [],
        processHandlerList: [
          {
            handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
            handlerPool: "0x6205F05408F589F0E45FCF712BFDedbf27A92F49",
            args: [
              ["execute100", "uint", 0],
              ["trialCount", "uint", 3]
            ]
          }
        ],
        postHandlerList: [],
        groupSlotIOList: [
          {
            groupSlotListInput: [
              {
                branch: 1,
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      ["percent", "uint", 10000]
                    ]
                  }
                ],
                poolToken: "0x187bdf2f44896e7E2678902Ba32819Bd84bBf9D8",
                tokenSlotList: [
                  {
                    tokenIO: {},
                    tokenTemplate: {
                      erc: 1,
                      token: "0xDbF0A536ed84Ce4015cd6229597b063719E9fF9f",
                      id: "0",
                      idEnd: "0",
                      idList: [
                        "0",
                        "0"
                      ],
                      amount: "999999999",
                      amountEnd: "999999999",
                      attributeRangeList: [],
                      idType: 0,
                      idRequired: 0,
                      idFormula: "0x00",
                      amountFormula: "0x00",
                      amountRequired: 1,
                      mountingTokenSlotIndex: 0,
                      swapRouter01: "0x0000000000000000000000000000000000000000",
                      swapToken: "0x0000000000000000000000000000000000000000"
                    }
                  }
                ]
              }
            ],
            groupSlotListOutput: [
              {
                branch: 2,
                handlerList: [
                  {
                    handler: "0xf52Ae15026a2E55E14C608E6ca5E930B743b03C6",
                    args: [
                      ["percent", "uint", 10000]
                    ]
                  }
                ],
                poolToken: "0x187bdf2f44896e7E2678902Ba32819Bd84bBf9D8",
                groupSlotListInput: [
                  {
                    tokenSlotList: [
                      {
                        tokenIO: {
                          durationType: 0,
                          durationBegin: 0,
                          durationEnd: 0,
                          ioType: 0,
                          ioAddress: "0x0000000000000000000000000000000000000002",
                          business: 1,
                          mountingTokenSlotIndex: 0,
                          allocationId: 0
                        },
                        tokenTemplate: {
                          erc: 1,
                          token: "0xDbF0A536ed84Ce4015cd6229597b063719E9fF9f"
                        }
                      }
                    ]
                  }
                ],
                tokenSlotList: [
                  {
                    tokenIO: {
                      durationType: 0,
                      durationBegin: 0,
                      durationEnd: 0,
                      ioType: 0,
                      ioAddress: "0x0000000000000000000000000000000000000002",
                      business: 1,
                      mountingTokenSlotIndex: 0,
                      allocationId: 0
                    },
                    tokenTemplate: {
                      erc: 1,
                      token: "0x7876D1e63f3d234f178458B4f0BF514101a0048e",
                      id: "0",
                      idEnd: "0",
                      idList: [
                        "0",
                        "0"
                      ],
                      amount: "99999999999",
                      amountEnd: "99999999999",
                      attributeRangeList: [],
                      idType: 0,
                      idRequired: 0,
                      idFormula: "0x00",
                      amountFormula: "0x00",
                      amountRequired: 0,
                      mountingTokenSlotIndex: 0,
                      swapRouter01: "0x0000000000000000000000000000000000000000",
                      swapToken: "0x0000000000000000000000000000000000000000"
                    }
                  }
                ]
              }
            ]
          }
        ],

        executionStateList:[
          {
            name:"State1",
            branch:0,
            taskId:0,
            cmd:0,
            args:[
              {
                key: "owner",
                type: "address",
                value: "0xDC23a3B2d1cCA6fD386AF9AB8eEA3ef9899510da",
                rangeType:"enum",
                range: [0, 0]
              },
              {
                key: "execute",
                type: "uint",
                value: 1,
                rangeType:"enum",
                range: [0, 0]
              },
            ],
            response:{}
          },
          {
            name:"State2",
            branch:0,
            taskId:0,
            cmd:0,
            args:[
              {
                key: "mineCount",
                type: "uint",
                value: 1,
                rangeType:"enum",
                range: [0, 0]
              },
            ],
            response:{}
          },
          {
            name:"Random State",
            func:"getRandomState",
            taskId:0,
            response:{}
          },
          {
            name:"Claim State",
            func:"getClaimIOAddressBranchTokenList",
            taskId:0,
            args:[],
            roundList:[0],
            hashList:[],
            response:{}
          },
          {
            name:"Task State",
            func:"getTask",
            taskId:0,
            response:{}
          }
        ],

        executionFlowList: [
          {
            name:"Input",
            commandList:[
              {
                command:"input",
                branch: 1,
                taskId: 0,//-1
                multiple: {
                  rangeType:"fixed",
                  range: [10000],
                  key: "multiple",
                  vpModeList: ["publisher"],
                },
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      {
                        key: "execute100",
                        type: "uint",
                        value: 2323,
                        rangeType:"enum",
                        range: [10000, 20000],
                        vpModeList: ["publisher"],
                      }
                    ]
                  }
                ]
              },
              {
                command:"execute",
                taskId: 0,
                stateCondition:"execute100 == 100",
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      {
                        name: "execute100",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      },
                      {
                        name: "random",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      }
                    ],
                  },
                ],
                roundList: [0, "latest"]
              },
              {
                command:"execute",
                taskId: 0,
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      {
                        name: "Command",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      },
                      {
                        name: "Command",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      }
                    ],
                  },
                ],
                roundList: [0, "latest"]
              },
              {
                command:"claim",
                taskId: 0,
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      {
                        name: "Command",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      },
                      {
                        name: "Command",
                        type: "uint",
                        rangeType:"enum",
                        range: [10000, 20000],
                      }
                    ],
                  },
                ],
                roundList: [0, "latest"]
              }
            ]
          },

          {
            name:"Claim",
            commandList:[
              {
                command:"input",
                branch: 1,
                taskId: 0,//-1
                multiple: {
                  range: [10000, 20000],
                  enum: [100, 200, 300],
                  name: "multiple",
                  vpModeList: ["publisher"],
                },
                handlerList: [
                  {
                    handler: "0x6940d4e026d41d2310293B426370B0B19c906867",
                    args: [
                      {
                        name: "input",
                        type: "uint",
                        value: 2323,
                        rangeType:"enum",
                        range: [10000, 20000],
                        vpModeList: ["publisher"],
                      }
                    ]
                  }
                ]
              }
            ]
          }

        ]

      }
    ]
  }
;
