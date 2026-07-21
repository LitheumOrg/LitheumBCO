const CONTRACT_ADDRESS = {
    BLTH: "0x2E2665dc887eA2588aa775184875e894A96fA0B7",
    WLTH: "0x8B5955cE6F3FedCc550a770A09bD7d0b032D6955",
    PLTH: "0x7b9380405B6aD012fb6A00545e12f775822F6cb6",
    USDT: "0x001DE0Ea135c7dD896d7A2F1fA35D3d8816Ac515",
    STAKING_TABLE: "0x96d477e658dc595711de0bdd0b6b5eb8a21dd5cc",

    // DELEGATION_TABLE: "0x3c3b3c5f4e1e6f0f4c4e4f4e4f4e4f4e4f4e4f4e",

    // Litheum Testnet Addresses
    // MOCK_USDT: "0xf3b6b143e7d9D2274B0e64f84F242D0A7f2Ae5b9",
    // MOCK_USDC: "0x8305f69d36c03C5e5B9865DAdEC4dC3C041bF1a5",
    // ROUTER02: "0xfd3AC7ED51ca453fd6ACEF24ABd928bf231b46b4",
    // WRAPPEDLTH: "0x45eCa0d3DA3F48636904dF925B74784395e39401",
    // FACTORY: "0x0D0F3B4ace9Db8C44Ef2C2217327fc400D5adb7C"

    // Siddhant Local Addresses
    MOCK_USDT: "0xdb4e894A87796588122015Fd49ba2Ca2e8921fD7",
    MOCK_USDC: "0x1C8b7C50E7516Cf793ce470792ef1B20E1bE9719",
    ROUTER02: "0xC0E37F43A52B5C3a1Be5e40321fB8263e24B8D0f",
    WRAPPEDLTH: "0x6bCD544f59c37Ab4541917Ec53d56390E81548Ef",
    FACTORY: "0x02FF747cDFb6afdC72e4c47cCBbdF351E09FBd6f",


    // MOCK_USDT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    // MOCK_USDC: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    // ROUTER02: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    // WRAPPEDLTH: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    // FACTORY: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

    // STAKING_TABLE: "0x3472e30e0be24d5582656e7c9fce4cfa9dc49cb5",

    DELEGATION_TABLE: "0xdb4e894A87796588122015Fd49ba2Ca2e8921fD7"
    // MOCK_USDT: "0x9bcf2Cc6cc749DDE7bc01cF4f4A9Dcd1e2ae9640",
    // MOCK_USDC: "0xcb0472dEF9202fd2fb2D9F4549d2B737DB1B8e5D",
    // ROUTER02: "0x69C66243b095b4C87cBB35549ED8d6A02AaA2159",
    // WRAPPEDLTH: "0xc50722127Ee5080A64cd38Af630a4B2F1D94AA48",
    // FACTORY: "0x0bfCD5DF4e7aA03b32EFF73Bb1517e5A65540496"

};

const TOKEN_METADATA: Record<string, {
    name: string;
    symbol: string;
    icon: string;
    address: string;
    decimals: number;
}> = {
    LTH: {
        name: 'Litheum',
        symbol: 'WLTH',
        icon: '../assets/litheum-icon.svg',
        address: CONTRACT_ADDRESS.WRAPPEDLTH,
        decimals: 18,
    },
    USDT: {
        name: 'USD Tether',
        symbol: 'USDT',
        icon: '../assets/t-icon.svg',
        address: CONTRACT_ADDRESS.MOCK_USDT,
        decimals: 18,
    },
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        icon: '../assets/c-icon.svg',
        address: CONTRACT_ADDRESS.MOCK_USDC,
        decimals: 18,
    },
};


export default { CONTRACT_ADDRESS, TOKEN_METADATA };
