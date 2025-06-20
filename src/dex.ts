import './main.css'
import './global.d.ts'

import { ethers } from 'ethers';
import { MockToken as IMockToken } from "../types/ethers-contracts/litheumswap-contracts/MockToken.ts";
import { UniswapV2Router02 as IRouter } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Router02.ts";
import { UniswapV2Factory as IFactory } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Factory.ts";


import MockToken from "./litheumswap-contracts/MockToken.sol/MockToken.json"
import UniswapV2Router02 from "./litheumswap-contracts/UniswapV2Router02.sol/UniswapV2Router02.json"
import UniswapV2Factory from "./litheumswap-contracts/UniswapV2Factory.sol/UniswapV2Factory.json"

import CONSTANTS from './constants.ts';
import ISwappingPair from './interface/ISwappingPair.ts';

const { CONTRACT_ADDRESS, TOKEN_METADATA } = CONSTANTS;

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
    }
};


const numberWithCommas = (x: String) => {
    let q = Number(x).toFixed(3);
    return q.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


let provider: ethers.BrowserProvider;
let routerContract: IRouter;
let factory:IFactory;

if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);

    swappingPair[1].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[1].symbol].address, MockToken.abi, provider) as unknown as IMockToken;
    swappingPair[2].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[2].symbol].address, MockToken.abi, provider) as unknown as IMockToken;

    routerContract = new ethers.Contract(CONTRACT_ADDRESS.ROUTER02, UniswapV2Router02.abi, provider) as unknown as IRouter;
    factory = new ethers.Contract(CONTRACT_ADDRESS.FACTORY, UniswapV2Factory.abi, provider) as unknown as IFactory;
}

const swapBtn = document.getElementById('swap') as HTMLButtonElement;
const token1Input = document.getElementById('token1-input') as HTMLButtonElement;
const token2Input = document.getElementById('token2-input') as HTMLButtonElement;

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

    openConnectModalBtn ? openConnectModalBtn.style.display = 'none' : '';
    swapBtn ? swapBtn.style.display = 'block' : '';
});

export const updateUserBalance = async () => {
    swappingPair[1].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[1].symbol].address, MockToken.abi, provider) as unknown as IMockToken;
    swappingPair[2].contract = new ethers.Contract(TOKEN_METADATA[swappingPair[2].symbol].address, MockToken.abi, provider) as unknown as IMockToken;

    await getUserBalance();

    console.log('Updating balance swappingPair', swappingPair);

    document.getElementById('token1-balance')!.innerHTML = numberWithCommas(ethers.formatEther(swappingPair[1].balance));
    document.getElementById('token2-balance')!.innerHTML = numberWithCommas(ethers.formatEther(swappingPair[2].balance));
}

const getUserBalance = async () => {
    if (swappingPair[1].contract && swappingPair[2].contract && provider && accounts.length) {
        if (swappingPair[1].symbol === 'LTH') {
            swappingPair[1].balance = await provider.getBalance(accounts[0] as string);
            swappingPair[2].balance = await swappingPair[2].contract.balanceOf(accounts[0] as string);
        } else if (swappingPair[2].symbol === 'LTH') {
            swappingPair[2].balance = await provider.getBalance(accounts[0] as string);
            swappingPair[1].balance = await swappingPair[1].contract.balanceOf(accounts[0] as string);
        } else {
            swappingPair[1].balance = await swappingPair[1].contract.balanceOf(accounts[0] as string);
            swappingPair[2].balance = await swappingPair[2].contract.balanceOf(accounts[0] as string);
        }
    }
}

// ****** DROPDOWN ELEMENT ******* //


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

    menu.querySelectorAll(".dropdown-item").forEach(async (item) => {
        item.addEventListener("click", async () => {
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

            token1Input.value = '';
            token2Input.value = '';

            if (accounts.length) {
                await updateUserBalance();
            }
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


// ****** INPUT ELEMENTS ******* //

// @todo: Implement slippage

let amountOut: any;
let deadline: any;
let slippage = '2';

// true - USDT to LTH
// false - LTH to USDT
let conversionType = true;

const updateAvailableLth = async () => {
    if (routerContract && swappingPair[1].contract && swappingPair[2].contract && token1Input.value && Number(token1Input.value) > 0) {
        const path = [TOKEN_METADATA[swappingPair[1].symbol].address, TOKEN_METADATA[swappingPair[2].symbol].address];
        deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        let quotedAmounts = await routerContract.getAmountsOut(
            ethers.parseEther(token1Input.value.toString()),
            path
        );
        amountOut = ethers.formatEther(quotedAmounts[1])
        token2Input.value = amountOut;
    } else {
        token2Input.value = '';
    }
}

token1Input?.addEventListener('input', updateAvailableLth);


const updateAvailableUsdt = async () => {
    if (routerContract && swappingPair[1].contract && swappingPair[2].contract && token2Input.value && Number(token2Input.value) > 0) {
        const path = [TOKEN_METADATA[swappingPair[2].symbol].address, TOKEN_METADATA[swappingPair[1].symbol].address];
        deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        let quotedAmounts = await routerContract.getAmountsOut(
            ethers.parseEther(token2Input.value.toString()),
            path
        );
        amountOut = ethers.formatEther(quotedAmounts[1])
        token1Input.value = amountOut;
    } else {
        token1Input.value = '';
    }
}

token2Input?.addEventListener('input', updateAvailableUsdt);


// ****** FLIP BUTTON ******* //

const flipBox = document.getElementById('flip-box');

flipBox?.addEventListener('click', () => {
    console.log('Flip box clicked');
    const elementList = document.getElementById('swap-box');
    if (elementList) {
        let first = elementList?.firstElementChild as HTMLDivElement;
        let last = elementList?.lastElementChild as HTMLDivElement;


        first.children[0].children[0].innerHTML = "BUY:";
        last.children[0].children[0].innerHTML = "SELL:";

        let slippageElement = first.children[0].children[2];

        slippageElement.remove();

        last.children[0].appendChild(slippageElement);

        elementList.removeChild(first);
        elementList.removeChild(last);

        elementList.insertBefore(last, elementList.firstChild);
        elementList.appendChild(first);

        conversionType = !conversionType;
        let tmpSwap = swappingPair[1];
        swappingPair[1] = swappingPair[2];
        swappingPair[2] = tmpSwap;
        console.log('Swapping pair after flip:', swappingPair);
    }
});

// ****** SLIPPAGE DROPDWON ******* //

let slipperDD = document.getElementById('slippage-dd') as HTMLDivElement;
let slipper = document.getElementById('show-slippage') as HTMLSpanElement;
let overlay = document.getElementById('overlay') as HTMLDivElement;

const hideSlippage = () => {
    slipperDD.style.display = 'none';
    overlay?.classList.remove("popup-bg");
}
const showSlippage = () => {
    slipperDD.style.display = 'block';
    overlay?.classList.add("popup-bg");
}

if (slipperDD) {
    slipperDD.style.display = 'none';
    slipper?.addEventListener('click', () => {
        if (slipperDD && slipperDD.style.display === 'none') {
            showSlippage();
        } else if (slipperDD && slipperDD.style.display === 'block') {
            hideSlippage();
        }
    });
}

overlay?.addEventListener('click', hideSlippage)
const slippageOptions = document.getElementsByClassName('percentage');

const slippageShow = document.getElementById('slippage-value') as HTMLInputElement;

slippageOptions && Array.from(slippageOptions).forEach((element) => {
    element.addEventListener('click', () => {
        slippage = element.getAttribute('data-value') as string;

        slippageShow.innerHTML = slippage.toString();

        hideSlippage();
    });
});

const closeSlippageBtn = document.getElementById('close-slippage-dd');

closeSlippageBtn?.addEventListener('click', hideSlippage);

// ****** STYLING ******* //

const hamburger = document.querySelector('.hamburger') as HTMLDivElement;
const mobileMenu = document.querySelector('.mobile-menu') as HTMLDivElement;

let menuOpen = false;

hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
        mobileMenu.classList.add('open');
    } else {
        mobileMenu.classList.remove('open');
    }
});

// ****** SWAP BUTTON ******* //


const initiateSwap = async () => {
    if (routerContract && swappingPair[1].contract && swappingPair[2].contract && accounts.length) {
        let signer = await provider.getSigner();

        const routerContractSigned = await routerContract.connect(signer);

        try {
            let tx;

            if (swappingPair[1].symbol === 'LTH' || swappingPair[2].symbol === 'LTH') {

                if (swappingPair[1].symbol === 'LTH') {
                    await swappingPair[2].contract.connect(signer).approve(
                        CONTRACT_ADDRESS.ROUTER02,
                        ethers.parseEther(token2Input.value.toString()) // Approve the amount of LTH to swap
                    );

                    tx = await routerContractSigned.swapExactETHForTokens(
                        ethers.parseEther(token2Input.value.toString()), // min amount of USDT to receive
                        [TOKEN_METADATA[swappingPair[1].symbol].address, TOKEN_METADATA[swappingPair[2].symbol].address], // path: LTH -> USDT
                        accounts[0] as string, // recipient address
                        deadline, // deadline: 10 minutes from now
                        {
                            value: ethers.parseEther(token1Input.value.toString()), // amount of LTH to swap
                            gasLimit: 3000000, // set a gas limit
                        }
                    );
                } else {
                    await swappingPair[1].contract.connect(signer).approve(
                        CONTRACT_ADDRESS.ROUTER02,
                        ethers.parseEther(token1Input.value.toString()) // Approve the amount of LTH to swap
                    );

                    tx = await routerContractSigned.swapExactTokensForETH(
                        ethers.parseEther(token1Input.value.toString()), // amount of USDT to swap
                        ethers.parseEther(token2Input.value.toString()), // min amount of LTH to receive @todo: slippage
                        [TOKEN_METADATA[swappingPair[1].symbol].address, TOKEN_METADATA[swappingPair[2].symbol].address], // path: USDT -> LTH
                        accounts[0] as string, // recipient address
                        deadline, // deadline: 10 minutes from now
                        {
                            gasLimit: 3000000, // set a gas limit
                        }
                    );
                }
            }
            else {
                await swappingPair[1].contract.connect(signer).approve(
                    CONTRACT_ADDRESS.ROUTER02,
                    ethers.parseEther(token1Input.value.toString()) // Approve the amount of token1 to swap
                );

                await swappingPair[2].contract.connect(signer).approve(
                    CONTRACT_ADDRESS.ROUTER02,
                    ethers.parseEther(token2Input.value.toString()) // Approve the amount of token1 to swap
                );

                tx = await routerContractSigned.swapExactTokensForTokens(
                    ethers.parseEther(token1Input.value.toString()), // amount of token1 to swap
                    ethers.parseEther(token2Input.value.toString()), // min amount of token2 to receive
                    [TOKEN_METADATA[swappingPair[1].symbol].address, TOKEN_METADATA[swappingPair[2].symbol].address], // path: token1 -> token2
                    accounts[0] as string, // recipient address
                    deadline, // deadline: 10 minutes from now
                    {
                        gasLimit: 3000000, // set a gas limit
                    }
                );
            }
            // @todo: clean up after swap

            console.log('Swap initiated successfully');
            await tx.wait();
            console.log('Swap completed successfully');
            token1Input.value = '';
            token2Input.value = '';

            await updateUserBalance();
        } catch (error) {
            console.error('Error during swap:', error);
            alert('Swap failed. Please check the console for details.');
        }

    }
}

swapBtn?.addEventListener('click', initiateSwap);
