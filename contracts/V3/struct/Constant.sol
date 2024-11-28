pragma solidity ^0.8.0;


address constant ZERO_ADDRESS = address(0);
address constant MINT_DESTROY_ADDRESS = address(1);
address constant SELF_ADDRESS = address(2);

address constant DEAD_ADDRESS = address(0x000000000000000000000000000000000000dEaD);

uint constant UINT256_MAX = 2**256 - 1;
uint constant UINT256_18 = 10 ** 18;

uint8 constant CLUSTER_ADMIN_ROLE = 1;
uint8 constant CLUSTER_DEPLOYER_ROLE = 2;

// ============ roles ============
bytes32 constant CLUSTER_ROLE = keccak256("CLUSTER_ROLE");
bytes32 constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
bytes32 constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 constant BURN_ROLE = keccak256("BURN_ROLE");
bytes32 constant APPROVE_ROLE = keccak256("APPROVE_ROLE");
bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant FUNCTION_ROLE = keccak256("FUNCTION_ROLE");

// ============ PoolToken ============
// roles
bytes32 constant ADD_TOKEN_ROLE = keccak256("ADD_TOKEN_ROLE");
bytes32 constant ALLOCATE_ROLE = keccak256("ALLOCATE_ROLE");
// allocation-type
uint8 constant AllocationTypeMint = 0;
uint8 constant AllocationTypeTransfer = 1;
// operation-type
uint8 constant OperationTypeEditInitial = 0;
uint8 constant OperationTypeIncreaseSupply = 1;
uint8 constant OperationTypeBurn = 2;
uint8 constant OperationTypeEditReleased = 3;
uint8 constant OperationTypeEditBurned = 4;

// ============ engine ============
uint8 constant TOKEN_ERC_COIN = 0;
uint8 constant TOKEN_ERC_ERC20 = 1;
uint8 constant TOKEN_ERC_ERC721 = 2;
uint8 constant TOKEN_ERC_ERC1155 = 3;

uint8 constant TOKEN_TEMPLATE_TYPE_ID_RANGE = 0;
uint8 constant TOKEN_TEMPLATE_TYPE_ID_LIST = 1;
uint8 constant TOKEN_TEMPLATE_TYPE_SWAP_V2 = 2;
uint8 constant TOKEN_TEMPLATE_ID_REQUIRED_FALSE = 0;//no need pass in
uint8 constant TOKEN_TEMPLATE_ID_REQUIRED_TRUE = 1;//must pass in
uint8 constant TOKEN_TEMPLATE_ID_REQUIRED_EXIST = 2;//must check if exist
uint8 constant TOKEN_TEMPLATE_ID_REQUIRED_NONE = 3;
uint8 constant TOKEN_TEMPLATE_ID_REQUIRED_MOUNTING = 4;
uint8 constant TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_FALSE = 0;
uint8 constant TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_TRUE = 1;

uint8 constant TOKEN_TEMPLATE_AMOUNT_REQUIRED_FALSE = 0;
uint8 constant TOKEN_TEMPLATE_AMOUNT_REQUIRED_TRUE = 1;
uint8 constant TOKEN_TEMPLATE_AMOUNT_REQUIRED_EXIST = 2;
uint8 constant TOKEN_TEMPLATE_AMOUNT_REQUIRED_NONE = 3;

uint8 constant TOKEN_TEMPLATE_AMOUNT_REQUIRED_MOUNTING = 4;
uint8 constant TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_FALSE = 0;
uint8 constant TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_TRUE = 0;
uint8 constant TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_NONE = 0;
uint8 constant TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_EXIST = 1;
uint8 constant TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_FALSE = 0;
uint8 constant TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_TRUE = 1;

uint8 constant CLUSTER_RULE_ALL = 0;
uint8 constant CLUSTER_RULE_IN = 1;
uint8 constant CLUSTER_RULE_OUT = 2;

uint8 constant RULE_GROUP_SLOT_OPT_APPEND = 1;//append to the existing rule's groupSlot with tokenSlotList
uint8 constant RULE_GROUP_SLOT_OPT_CLEAR_APPEND = 2;//clear old groupSlotList and add new groupSlotList
uint8 constant RULE_GROUP_SLOT_OPT_DELETE = 3;//delete groupSlot

uint8 constant RULE_IO_INPUT = 0;
uint8 constant RULE_IO_OUTPUT = 1;

uint8 constant RULE_IO_TYPE_TRANSFER = 0;
uint8 constant RULE_IO_TYPE_POOL_TOKEN_MINT_DESTROY = 1;
uint8 constant RULE_IO_TYPE_POOL_TOKEN_TRANSFER = 2;
uint8 constant RULE_IO_TYPE_POOL_TOKEN_MOUNT = 3;
uint8 constant RULE_IO_TYPE_POOL_TOKEN_UNMOUNT = 4;

uint8 constant DURATION_TYPE_TIMESTAMP = 0;
uint8 constant DURATION_TYPE_BLOCK_NUMBER = 1;

uint8 constant CLUSTER_STATE_DISABLED = 0;
uint8 constant CLUSTER_STATE_ENABLED = 1;
uint8 constant CLUSTER_STATE_WAITING = 2;

uint8 constant RULE_STATE_DISABLED = 0;
uint8 constant RULE_STATE_ENABLED = 1;
uint8 constant RULE_STATE_WAITING = 2;
uint8 constant RULE_STATE_DISABLED_FOREVER = 10;//disable forever, can not add groupSlotList or change state
uint8 constant RULE_STATE_ENABLED_FOREVER = 11;//enable forever, can not add groupSlotList or change state
uint8 constant RULE_STATE_UPDATE = 100;

uint8 constant CLUSTER_REG_TYPE_REG_CLUSTER = 1;
uint8 constant CLUSTER_REG_TYPE_REG_RULE = 2;


uint8 constant HANDLER_CMD_EXECUTE = 0;
uint8 constant HANDLER_CMD_CLAIM = 1;
uint8 constant HANDLER_CMD_WITHDRAW = 2;
uint8 constant HANDLER_CMD_MAKE_RANDOM = 10;
uint8 constant HANDLER_CMD_EXECUTE_100 = 100;

uint8 constant HANDLER_CMD_EXECUTE_100_OFF = 0;
uint8 constant HANDLER_CMD_EXECUTE_100_ON = 1;

uint8 constant HANDLER_CMD_SWITCH_OFF = 0;
uint8 constant HANDLER_CMD_SWITCH_ON = 1;

uint8 constant HANDLER_CMD_OFFSET_ILLEGAL = 255;


uint8 constant HANDLER_CODE_SUCCEED = 0;//default success for all handlers
uint8 constant HANDLER_CODE_FAILURE = 1;
uint8 constant HANDLER_CODE_IGNORE = 2;
uint8 constant HANDLER_CODE_MAKE_RANDOM = 10;
uint8 constant HANDLER_CODE_FINISH = 100;
uint8 constant HANDLER_CODE_OVER = 200;

uint8 constant HANDLER_STATE_DELETED = 0;
uint8 constant HANDLER_STATE_WAITING = 1;
uint8 constant HANDLER_STATE_IN_REVIEW = 2;
uint8 constant HANDLER_STATE_ACCEPTED = 10;
uint8 constant HANDLER_STATE_STANDALONE = 20;

uint8 constant HANDLER_PROCESS_STATE_PRE = 0;
uint8 constant HANDLER_PROCESS_STATE_EXECUTE = 1;
uint8 constant HANDLER_PROCESS_STATE_CLAIM = 2;

uint8 constant HANDLER_ARGS_REG = 0;
uint8 constant HANDLER_ARGS_UPDATE = 1;

uint8 constant HANDLER_WHITE_LIST_DISABLE = 0;
uint8 constant HANDLER_WHITE_LIST_ENABLE = 1;

uint8 constant HANDLER_RANDOM_BLOCK_PASSED_256 = 1;//future block has passed 256 block
uint8 constant HANDLER_RANDOM_BLOCK_NOT_REACH = 2;
uint8 constant HANDLER_RANDOM_COUNT = 3;


uint8 constant HANDLER_ALLOCATE_LAYER_FILTER_ENABLE = 1;
uint8 constant HANDLER_ALLOCATE_LAYER_FILTER_DISABLE = 0;

uint8 constant HANDLER_ALLOCATE_LAYER_TOKEN_ENABLE = 0;
uint8 constant HANDLER_ALLOCATE_LAYER_TOKEN_DISABLE = 1;

uint8 constant TASK_STATE_INPUT = 1;
uint8 constant TASK_STATE_INPUT_TASK = 2;
uint8 constant TASK_STATE_PROCESSED = 5;
uint8 constant TASK_STATE_DONE = 10;
uint8 constant TASK_STATE_REVOKED = 20;
uint8 constant TASK_STATE_CLAIMED = 30;//not update to storage Task


uint8 constant EVENT_TASK_PROCESS = 0;
uint8 constant EVENT_TASK_INPUT = 1;
uint8 constant EVENT_TASK_OUTPUT = 2;


uint8 constant EVENT_CLUSTER_REG = 1;
uint8 constant EVENT_CLUSTER_REG_GROUP_SLOT_LIST = 2;
uint8 constant EVENT_CLUSTER_REG_RULE = 3;
uint8 constant EVENT_CLUSTER_ADD_RULE = 4;
uint8 constant EVENT_CLUSTER_UPDATE_GROUP_SLOT_LIST = 5;
uint8 constant EVENT_CLUSTER_UPDATE_RULE_LIST = 6;

uint256 constant ATTRIBUTE_RANGE_BRANCH_ALL = 10000;

uint8 constant ATTRIBUTE_TYPE_NONE = 0;
uint8 constant ATTRIBUTE_TYPE_BALANCE = 1;
uint8 constant ATTRIBUTE_TYPE_DELTA_AMOUNT = 2;
uint8 constant ATTRIBUTE_TYPE_DELTA_PERCENT = 3;

uint8 constant ATTRIBUTE_OPT_DELTA = 1;
uint8 constant ATTRIBUTE_OPT_ATTACH = 2;
uint8 constant ATTRIBUTE_OPT_DETACH = 3;
uint8 constant ATTRIBUTE_OPT_EXIST = 4;
uint8 constant ATTRIBUTE_OPT_DELTA_MIN = 5;
uint8 constant ATTRIBUTE_OPT_DELTA_MAX = 6;


uint8 constant ATTRIBUTE_OPT_TOKEN_DELTA = 101;
uint8 constant ATTRIBUTE_OPT_TOKEN_ATTACH = 102;
uint8 constant ATTRIBUTE_OPT_TOKEN_DETACH = 103;
uint8 constant ATTRIBUTE_OPT_TOKEN_EXIST = 104;
uint8 constant ATTRIBUTE_OPT_TOKEN_DELTA_MIN = 105;
uint8 constant ATTRIBUTE_OPT_TOKEN_DELTA_MAX = 106;


uint8 constant ATTRIBUTE_STATE_NONE = 0;
uint8 constant ATTRIBUTE_STATE_ENABLED = 1;
uint8 constant ATTRIBUTE_STATE_DISABLED = 2;
uint8 constant ATTRIBUTE_STATE_ENABLED_FOREVER = 11;
uint8 constant ATTRIBUTE_STATE_DISABLED_FOREVER = 12;//disable forever, can not change state or modify


uint8 constant ATTRIBUTE_SUB_SUM_MODE_PERCENT_FIRST = 1;
uint8 constant ATTRIBUTE_SUB_SUM_MODE_AMOUNT_FIRST = 2;
uint8 constant ATTRIBUTE_SUB_SUM_MODE_SEQUENCE = 3;


uint8 constant INPUT_CLAIM_STATE_AVAILABLE = 0;
uint8 constant INPUT_CLAIM_STATE_NONE = 1;
uint8 constant INPUT_CLAIM_STATE_EXIST = 2;
uint8 constant INPUT_CLAIM_STATE_MOUNTING = 4;




