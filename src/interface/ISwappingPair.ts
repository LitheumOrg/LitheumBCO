import { MockToken as IMockToken } from "../../types/ethers-contracts/litheumswap-contracts/MockToken.ts";

interface ISwappingPair {
    symbol: string;
    balance: bigint; // Using BigInt for balance to handle large numbers
    contract: IMockToken | null; // Will be set later
    swapAmount?: string; // Optional field to store the amount to swap
};

export default ISwappingPair;
