import './main.css'
import './global.d.ts'

import { ethers } from 'ethers';
import { MockToken as IMockToken } from "../types/ethers-contracts/litheumswap-contracts/MockToken.ts";
import { UniswapV2Router02 as IRouter } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Router02.ts";
import { WrappedLitheum as IWLTH } from "../types/ethers-contracts/litheumswap-contracts/WrappedLitheum.ts";
import { UniswapV2Factory as IFactory } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Factory.ts";
import { UniswapV2Pair as IPair } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Pair.ts";


import MockToken from "./litheumswap-contracts/MockToken.sol/MockToken.json"
import UniswapV2Router02 from "./litheumswap-contracts/UniswapV2Router02.sol/UniswapV2Router02.json"
import UniswapV2Factory from "./litheumswap-contracts/UniswapV2Factory.sol/UniswapV2Factory.json"
import UniswapV2Pair from "./litheumswap-contracts/UniswapV2Pair.sol/UniswapV2Pair.json"


import CONTRACT_ADDRESS from './constants.ts';

const numberWithCommas = (x: String) => {
    let q = Number(x).toFixed(3);
    return q.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface ISwappingPair {
    symbol: string;
    balance: bigint; // Using BigInt for balance to handle large numbers
    contract: IMockToken | null; // Will be set later
    swapAmount?: string; // Optional field to store the amount to swap
};

let swappingPair: Record<string, ISwappingPair> = {
    '1': {
        symbol: 'LTH',
        balance: 0n, // Using BigInt for balance to handle large numbers
        contract: null as IMockToken | null, // Will be set later
    },
    '2': {
        symbol: 'USDT',
        balance: 0n, // Using BigInt for balance to handle large numbers
        contract: null as IMockToken | null, // Will be set later
    },
    // '3': {
    //     symbol: 'USDC',
    //     balance: 0n, // Using BigInt for balance to handle large numbers
    //     contract: null as IMockToken | null, // Will be set later
    // }
}

// let token1 = 'LTH';
// let token2 = 'USDT';

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

let provider: ethers.BrowserProvider;
let token1Contract: IMockToken;
let token2Contract: IMockToken;
let routerContract: IRouter;
let wlth: IWLTH;
let factory: IFactory;

if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);

    // usdtContract = new ethers.Contract(CONTRACT_ADDRESS.MOCK_USDT, MockToken.abi, provider) as unknown as IMockToken;
    routerContract = new ethers.Contract(CONTRACT_ADDRESS.ROUTER02, UniswapV2Router02.abi, provider) as unknown as IRouter;
    wlth = new ethers.Contract(CONTRACT_ADDRESS.WRAPPEDLTH, MockToken.abi, provider) as unknown as IWLTH;
    factory = new ethers.Contract(CONTRACT_ADDRESS.FACTORY, UniswapV2Factory.abi, provider) as unknown as IFactory;
}

const swapBtn = document.getElementById('swap') as HTMLButtonElement;

let accounts: String[] = [];
swapBtn ? swapBtn.style.display = 'none' : '';
if (accounts.length) {
    swapBtn ? swapBtn.style.display = 'none' : '';
}


const openConnectModalBtn = document.getElementById('open-connect-modal')

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    console.log('accounts', accounts);

    await updateUserBalance();

    const bal = await provider.getBalance(accounts[0] as string);

    console.log('balance', bal);

    // const signer = await provider.getSigner();

    // const factorySigned = factory.connect(signer);

    // await factorySigned.createPair(CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH);

    // const pairAddress = await factorySigned.getPair(CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH);

    // console.log('pairAddress', pairAddress);

    openConnectModalBtn ? openConnectModalBtn.style.display = 'none' : '';
    swapBtn ? swapBtn.style.display = 'block' : '';
});

// let token1Balance;
// let token2Balance;

export const updateUserBalance = async () => {
    await getUserBalance();

    document.getElementById('token1-balance')!.innerHTML = `${numberWithCommas(ethers.formatEther(swappingPair[1].balance))} ${swappingPair[1].symbol}`;
    document.getElementById('token2-balance')!.innerHTML = `${numberWithCommas(ethers.formatEther(swappingPair[2].balance))} ${swappingPair[2].symbol}`;
}

const getUserBalance = async () => {
    console.log('Fetching user balance...');
    console.log(swappingPair);
    if (swappingPair[1].symbol === 'LTH') {
        console.log('Fetching LTH balance...');
        swappingPair[1].balance = await provider.getBalance(accounts[0] as string);
        console.log('LTH balance:', swappingPair[1].balance);
    } else {
        swappingPair[1].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[1].symbol].address, MockToken.abi, provider) as unknown as IMockToken;

        swappingPair[1].balance = await swappingPair[1].contract.balanceOf(accounts[0] as string);
    }

    if (swappingPair[2].symbol === 'LTH') {
        swappingPair[2].balance = await provider.getBalance(accounts[0] as string);
    } else {
        swappingPair[2].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[2].symbol].address, MockToken.abi, provider) as unknown as IMockToken;

        swappingPair[2].balance = await swappingPair[2].contract.balanceOf(accounts[0] as string);
    }
    console.log('User balances updated:', swappingPair);
}



const setupDropdown = (buttonId: string, menuId: string) => {
    const btn = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (!btn || !menu) {
        console.warn(`Dropdown setup failed: #${buttonId} or #${menuId} not found.`);
        return;
    }

    btn.addEventListener("click", () => {
        menu.classList.toggle("show");
    });

    menu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", () => {
            const symbol = item.getAttribute("data-symbol");
            const icon = item.getAttribute("data-icon");

            const iconEl = btn.querySelector(".token-icon") as HTMLImageElement;
            const labelEl = btn.querySelector(".token-label");

            if (icon && symbol && iconEl && labelEl) {
                if (buttonId === 'token1-btn') {
                    if (symbol === swappingPair[2].symbol) {
                        console.log("You cannot select the same token for both fields.");
                        return;
                    }
                    swappingPair[1].symbol = symbol;
                } else if (buttonId === 'token2-btn') {
                    if (symbol === swappingPair[1].symbol) {
                        console.log("You cannot select the same token for both fields.");
                        return;
                    }
                    swappingPair[2].symbol = symbol;
                }
                iconEl.src = icon;
                labelEl.textContent = symbol;
            }

            menu.classList.remove("show");
        });
    });

    document.addEventListener("click", (e) => {
        if (!btn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
            menu.classList.remove("show");
        }
    });
}

setupDropdown('token1-btn', 'token1-menu');
setupDropdown('token2-btn', 'token2-menu');

const tokenSelectorBtn = document.getElementById('token-selector-btn') as HTMLButtonElement;
const poolSelector = document.getElementById('pool-selector') as HTMLDivElement;

if (poolSelector) {
    poolSelector.style.display = 'none';
}
tokenSelectorBtn?.addEventListener('click', () => {
    const pairContainer = document.getElementById('pair-container') as HTMLDivElement;
    pairContainer.style.display = 'none';
    poolSelector.style.display = 'block';

    const pairText = document.getElementById('pair-text') as HTMLSpanElement;

    pairText.innerHTML = `${swappingPair[1].symbol} / ${swappingPair[2].symbol}`;

    setupTokenInputBox('token1-input-box', swappingPair[1], 'token2-input-box');
    setupTokenInputBox('token2-input-box', swappingPair[2], 'token1-input-box');

});

const setupTokenInputBox = (inputId: string, swapElement: ISwappingPair, otherInputId: string) => {
    const inputBox = document.getElementById(inputId) as HTMLDivElement;
    const otherInputBox = document.getElementById(otherInputId) as HTMLDivElement;
    // const tokenBtn = document.getElementById(tokenBtnId) as HTMLButtonElement;

    if (!inputBox) {
        console.warn(`Token input setup failed: #${inputId} not found.`);
        return;
    }

    let tokenIcon = inputBox.querySelector('.token-icon');
    if (tokenIcon) {
        tokenIcon.setAttribute('src', TOKEN_METADATA[swapElement.symbol].icon || '');
        tokenIcon.setAttribute('alt', swapElement.symbol);
    }

    const symbolEl = inputBox.querySelector('.token-symbol');
    if (symbolEl) {
        symbolEl.textContent = swapElement.symbol;
    }

    const balanceEl = inputBox.querySelector('.balance');
    if (balanceEl) {
        balanceEl.textContent = `Balance: ${swapElement.balance}`;
    }

    const maxBtn = inputBox.querySelector('.max') as HTMLButtonElement;
    maxBtn?.addEventListener('click', () => {
        console.log(`Max button clicked for ${swapElement.symbol}`);
    });

    const inputField = inputBox.querySelector('.amount-input') as HTMLInputElement;

    inputField.addEventListener('input', async (e) => {
        const value = (e.target as HTMLInputElement).value;
        console.log(`Input for ${swapElement.symbol}: ${value}`);
        if (routerContract && Number(value) > 0) {
            const otherToken = getOtherToken(swapElement.symbol);
            const path = [TOKEN_METADATA[swapElement.symbol].address, TOKEN_METADATA[otherToken.symbol].address];
            // deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
            try {
                let quotedAmounts = await routerContract.getAmountsOut(
                    ethers.parseEther(value),
                    path
                );
                swapElement.swapAmount = ethers.formatEther(quotedAmounts[1])
            } catch (error) {
                console.error(`Error fetching amounts for ${swapElement.symbol}:`, error);
                swapElement.swapAmount = value;
            }
            // usdtInput.value = amountOut;
        } else {
            swapElement.swapAmount = '0';
        }
        // Here you can add logic to update the other input based on this value
        // call and update the other field value
        const otherInputField = otherInputBox.querySelector('.amount-input') as HTMLInputElement;

        if (otherInputField) {
            // Example logic: just update the other input with the same value
            otherInputField.value = swapElement.swapAmount;
        }

    });
}

const getOtherToken = (token: string) => {
    return Object.values(swappingPair).find((x) => x.symbol != token) || swappingPair[1];
}
const token1Input = document.getElementById('token1-input') as HTMLInputElement;
const token2Input = document.getElementById('token2-input') as HTMLInputElement;

const initiateSwap = async () => {
    console.log('Initiating swap...');
    console.log('tpken1:', token1Input.value);
    console.log('tpken2:', token2Input.value);

    if (swappingPair[1].balance < ethers.parseEther(token1Input.value)) {
        console.error(`Insufficient balance for ${swappingPair[1].symbol}`);
        return;
    }

    if (swappingPair[2].balance < ethers.parseEther(token2Input.value)) {
        console.error(`Insufficient balance for ${swappingPair[2].symbol}`);
        return;
    }

    swappingPair[1].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[1].symbol].address, MockToken.abi, provider) as unknown as IMockToken;
    swappingPair[2].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[2].symbol].address, MockToken.abi, provider) as unknown as IMockToken;

    if (swappingPair[1].contract && swappingPair[2].contract) {
        let signer = await provider.getSigner();
        const routerContractSigned = routerContract.connect(signer);

        console.log('Approving token1 contract for swap...');

        await swappingPair[1].contract.connect(signer).approve(
            CONTRACT_ADDRESS.ROUTER02,
            ethers.parseEther(token1Input.value.toString())
        );

        console.log('Approving token2 contract for swap...');

        await swappingPair[2].contract.connect(signer).approve(
            CONTRACT_ADDRESS.ROUTER02,
            ethers.parseEther(token2Input.value.toString())
        );

        console.log('Token contracts approved for swap');

        let tx = await routerContractSigned.addLiquidityETH(
            TOKEN_METADATA[swappingPair[2].symbol].address, // address of token to add
            ethers.parseEther(token2Input.value.toString()), // amount of token to add
            ethers.parseEther(token2Input.value.toString()), // min amount of token to add
            ethers.parseEther(token1Input.value.toString()), // min amount of ETH to add
            accounts[0] as string, // recipient address
            Math.floor(Date.now() / 1000) + 60 * 10, // deadline: 10 minutes from now
            {
                value: ethers.parseEther(token1Input.value.toString()), // amount of ETH to add
            }
        );

        // let tx = await routerContractSigned.addLiquidity(
        //     TOKEN_METADATA[swappingPair[1].symbol].address, // address of token1 to add
        //     TOKEN_METADATA[swappingPair[2].symbol].address, // address of token2 to add
        //     ethers.parseEther(token1Input.value.toString()), // amount of token1 to add
        //     ethers.parseEther(token2Input.value.toString()), // amount of token2 to add
        //     ethers.parseEther(token1Input.value.toString()), // min amount of token1 to add
        //     ethers.parseEther(token2Input.value.toString()), // min amount of token2 to add
        //     accounts[0] as string, // recipient address
        //     Math.floor(Date.now() / 1000) + 60 * 10, // deadline: 10 minutes from now
        //     {
        //         gasLimit: 3000000, // set a gas limit
        //     }
        // );
        console.log('Transaction initiated:', tx);
        console.log('Waiting for transaction to be mined...');

        await tx.wait();
        console.log('Liquidity added successfully');

        const uniswapV2Factory = new ethers.Contract(CONTRACT_ADDRESS.FACTORY, UniswapV2Factory.abi, provider) as unknown as IFactory;

        const pairAddress = await uniswapV2Factory.getPair(
            TOKEN_METADATA[swappingPair[1].symbol].address,
            TOKEN_METADATA[swappingPair[2].symbol].address
        );
        console.log('Pair address:', pairAddress);

        const pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, provider) as unknown as IPair;
        let test = await pair.getReserves();

        console.log('Reserves:', test);

    } else {
        console.error('Token contracts are not initialized.');
    }
    // if (routerContract && wlth && usdtContract && accounts.length) {

    //     const routerContractSigned = await routerContract.connect(signer);

    //     let tx;

    //     if (conversionType) {


    //         tx = await routerContractSigned.swapExactTokensForETH(
    //             ethers.parseEther(usdtInput.value.toString()), // amount of USDT to swap
    //             ethers.parseEther(lthInput.value.toString()), // min amount of LTH to receive
    //             [CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH], // path: USDT -> LTH
    //             accounts[0] as string, // recipient address
    //             deadline, // deadline: 10 minutes from now
    //             {
    //                 gasLimit: 3000000, // set a gas limit
    //             }
    //         );
    //     } else {
    //         await wlth.connect(signer).approve(
    //             CONTRACT_ADDRESS.ROUTER02,
    //             ethers.parseEther(lthInput.value.toString()) // Approve the amount of LTH to swap
    //         );

    //         tx = await routerContractSigned.swapExactETHForTokens(
    //             ethers.parseEther(usdtInput.value.toString()), // min amount of USDT to receive
    //             [CONTRACT_ADDRESS.WRAPPEDLTH, CONTRACT_ADDRESS.MOCK_USDT], // path: LTH -> USDT
    //             accounts[0] as string, // recipient address
    //             deadline, // deadline: 10 minutes from now
    //             {
    //                 value: ethers.parseEther(lthInput.value.toString()), // amount of LTH to swap
    //                 gasLimit: 3000000, // set a gas limit
    //             }
    //         );
    //     }

    //     // @todo: clean up after swap

    //     console.log('Swap initiated successfully');
    //     await tx.wait();
    //     console.log('Swap completed successfully');
    //     await updateUserBalance();
    // }
}

swapBtn?.addEventListener('click', initiateSwap);
