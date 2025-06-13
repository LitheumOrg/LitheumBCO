import './main.css'
import './global.d.ts'

import { ethers } from 'ethers';
import { MockToken as IMockToken } from "../types/ethers-contracts/litheumswap-contracts/MockToken.ts";
import { UniswapV2Router02 as IRouter } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Router02.ts";
import { WrappedLitheum as IWLTH } from "../types/ethers-contracts/litheumswap-contracts/WrappedLitheum.ts";
import { UniswapV2Factory as IFactory } from "../types/ethers-contracts/litheumswap-contracts/UniswapV2Factory.ts";


import MockToken from "./litheumswap-contracts/MockToken.sol/MockToken.json"
import UniswapV2Router02 from "./litheumswap-contracts/UniswapV2Router02.sol/UniswapV2Router02.json"
import UniswapV2Factory from "./litheumswap-contracts/UniswapV2Factory.sol/UniswapV2Factory.json"


import CONTRACT_ADDRESS from './constants.ts';

const numberWithCommas = (x: String) => {
    let q = Number(x).toFixed(3);
    return q.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


let provider: ethers.BrowserProvider;
let usdtContract: IMockToken;
let routerContract: IRouter;
let wlth: IWLTH;
let factory:IFactory;

if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);

    usdtContract = new ethers.Contract(CONTRACT_ADDRESS.MOCK_USDT, MockToken.abi, provider) as unknown as IMockToken;
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

    const signer = await provider.getSigner();

    const factorySigned = factory.connect(signer);

    // await factorySigned.createPair(CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH);

    const pairAddress = await factorySigned.getPair(CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH);

    console.log('pairAddress', pairAddress);

    // const routerContractSigned = routerContract.connect(signer);

    // await usdtContract.connect(signer).approve(
    //     CONTRACT_ADDRESS.ROUTER02,
    //     ethers.parseEther('1000') // Approve 1000 USDT
    // );

    // await wlth.connect(signer).approve(
    //     CONTRACT_ADDRESS.ROUTER02,
    //     ethers.parseEther('400') // Approve 400 LTH
    // );

    // await routerContractSigned.addLiquidity(
    //     CONTRACT_ADDRESS.MOCK_USDT,
    //     CONTRACT_ADDRESS.WRAPPEDLTH,
    //     ethers.parseEther('1000'), // 1000 USDT
    //     ethers.parseEther('400'), // 1000 LTH
    //     ethers.parseEther('0'), // min USDT
    //     ethers.parseEther('0'), // min LTH
    //     accounts[0] as string, // recipient
    //     Math.floor(Date.now() / 1000) + 60 * 10 // deadline: 10 minutes from now
    // );

    // const isUserWhitelisted = await plthContractSigned.isAddressInWhitelist(accounts[0] as string);

    // await getStaticPrice();
    // if (!isUserWhitelisted) {
    //     alert('You are not whitelisted');

    // }

    openConnectModalBtn ? openConnectModalBtn.style.display = 'none' : '';
    swapBtn ? swapBtn.style.display = 'block' : '';
});

export const updateUserBalance = async () => {
    let userBalance = await getUserBalance();

    document.getElementById('usdt-balance')!.innerHTML = numberWithCommas(ethers.formatEther(userBalance.usdtBalance));
    document.getElementById('lth-balance')!.innerHTML = numberWithCommas(ethers.formatEther(userBalance.lthBalance));
}

const getUserBalance = async () => {
    if (usdtContract && provider && accounts.length) {
        let usdtBalance = await usdtContract.balanceOf(accounts[0] as string);
        let lthBalance = await provider.getBalance(accounts[0] as string);

        console.log('usdtBalance', usdtBalance);
        console.log('lthBalance', lthBalance);

        return { usdtBalance, lthBalance };
    }

    return { usdtBalance: 0, lthBalance: 0 };
}



// ****** INPUT ELEMENTS ******* //

// @todo: Implement slippage
const lthInput = document.getElementById('lth-input') as HTMLButtonElement;
const usdtInput = document.getElementById('usdt-input') as HTMLButtonElement;

let amountOut: any;
let deadline: any;
let slippage = '2';

// true - USDT to LTH
// false - LTH to USDT
let conversionType = true;

const updateAvailableLth = async () => {
    if (routerContract && wlth && usdtInput && usdtInput.value && Number(usdtInput.value) > 0) {
        const path = [CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH];
        deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        let quotedAmounts = await routerContract.getAmountsOut(
            ethers.parseEther(usdtInput.value.toString()),
            path
        );
        amountOut = ethers.formatEther(quotedAmounts[1])
        lthInput.value = amountOut;
    } else {
        lthInput.value = '0';
    }
}

usdtInput?.addEventListener('input', updateAvailableLth);


const updateAvailableUsdt = async () => {
    if (routerContract && wlth && lthInput && lthInput.value && Number(lthInput.value) > 0) {
        const path = [CONTRACT_ADDRESS.WRAPPEDLTH, CONTRACT_ADDRESS.MOCK_USDT];
        deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        let quotedAmounts = await routerContract.getAmountsOut(
            ethers.parseEther(lthInput.value.toString()),
            path
        );
        amountOut = ethers.formatEther(quotedAmounts[1])
        usdtInput.value = amountOut;
    } else {
        usdtInput.value = '0';
    }
}

lthInput?.addEventListener('input', updateAvailableUsdt);


// ****** FLIP BUTTON ******* //

const flipBox = document.getElementById('flip-box');

flipBox?.addEventListener('click', () => {
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
    if (routerContract && wlth && usdtContract && accounts.length) {
        let signer = await provider.getSigner();

        const routerContractSigned = await routerContract.connect(signer);

        let tx;

        if (conversionType) {

            await usdtContract.connect(signer).approve(
                CONTRACT_ADDRESS.ROUTER02,
                ethers.parseEther(usdtInput.value.toString()) // Approve the amount of USDT to swap
            );

            tx = await routerContractSigned.swapExactTokensForETH(
                ethers.parseEther(usdtInput.value.toString()), // amount of USDT to swap
                ethers.parseEther(lthInput.value.toString()), // min amount of LTH to receive
                [CONTRACT_ADDRESS.MOCK_USDT, CONTRACT_ADDRESS.WRAPPEDLTH], // path: USDT -> LTH
                accounts[0] as string, // recipient address
                deadline, // deadline: 10 minutes from now
                {
                    gasLimit: 3000000, // set a gas limit
                }
            );
        } else {
            await wlth.connect(signer).approve(
                CONTRACT_ADDRESS.ROUTER02,
                ethers.parseEther(lthInput.value.toString()) // Approve the amount of LTH to swap
            );

            tx = await routerContractSigned.swapExactETHForTokens(
                ethers.parseEther(usdtInput.value.toString()), // min amount of USDT to receive
                [CONTRACT_ADDRESS.WRAPPEDLTH, CONTRACT_ADDRESS.MOCK_USDT], // path: LTH -> USDT
                accounts[0] as string, // recipient address
                deadline, // deadline: 10 minutes from now
                {
                    value: ethers.parseEther(lthInput.value.toString()), // amount of LTH to swap
                    gasLimit: 3000000, // set a gas limit
                }
            );
        }

        // @todo: clean up after swap

        console.log('Swap initiated successfully');
        await tx.wait();
        console.log('Swap completed successfully');
        await updateUserBalance();
    }
}

swapBtn?.addEventListener('click', initiateSwap);
