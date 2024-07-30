import './main.css'
import './global.d.ts'

import { ContractTransactionResponse, ethers } from 'ethers';
import { MockUSDTToken as IMockUSDT } from "../types/MockUSDTToken.ts";
import { LitheumPresaleBCOERC20 as ILitheumPresaleBCOERC20 } from "../types/LitheumPresaleBCOERC20";

import CONTRACT_ADDRESS from './constants';
import LitheumPresaleBCOERC20 from './contracts/LitheumPresaleBCOERC20.sol/LitheumPresaleBCOERC20.json';
import MockUSDTToken from './contracts/MockUSDTToken.sol/MockUSDTToken.json';


const numberWithCommas = (x: String) => {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const getCurrentPrice = async () => {
    if (blthContract) {
        const price = await blthContract.getCurrentPrice();
        document.getElementById('current-price')!.innerText = ethers.formatUnits(price, 'ether');
        const blthLeft = await blthContract.getBLTHBalance();
        document.getElementById('left-amount')!.innerText = Math.floor(Number(ethers.formatUnits(blthLeft, 'ether')) / 1000000).toFixed(0)
        const leftPercent = (Number(ethers.formatUnits(blthLeft, 'ether')) / 500000000) * 100;
        const soldPercent = 100 - leftPercent;

        document.getElementById('sold-progress')!.style.width = `${soldPercent.toFixed(0)}%`;
        document.getElementById('left-progress')!.style.width = `${leftPercent.toFixed(0)}%`;
    }
}

let provider: ethers.BrowserProvider;
let usdtContract: IMockUSDT;
let blthContract: ILitheumPresaleBCOERC20;
if (window.ethereum) {
    // provider = new ethers.JsonRpcProvider('https://rpc-sepolia.rockx.com');
    provider = new ethers.BrowserProvider(window.ethereum);
    usdtContract = new ethers.Contract(CONTRACT_ADDRESS.USDT, MockUSDTToken.abi, provider) as unknown as IMockUSDT;
    blthContract = new ethers.Contract(CONTRACT_ADDRESS.BLTH, LitheumPresaleBCOERC20.abi, provider) as unknown as ILitheumPresaleBCOERC20;
    getCurrentPrice();
}

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

let accounts: String[] = [];
const swapBtn = document.getElementById('swap') as HTMLButtonElement;
swapBtn ? swapBtn.style.display = 'none' : '';
if (accounts.length) {
    swapBtn ? swapBtn.style.display = 'none' : '';
}
const reverseSwapBtn = document.getElementById('reverse-swap') as HTMLButtonElement;
reverseSwapBtn ? reverseSwapBtn.style.display = 'none' : '';
if (accounts.length) {
    reverseSwapBtn ? reverseSwapBtn.style.display = 'none' : '';
}

const openConnectModalBtn = document.getElementById('open-connect-modal')

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    await updateUserBalance();
    await getCurrentPrice();

    openConnectModalBtn ? openConnectModalBtn.style.display = 'none' : '';
    swapBtn ? swapBtn.style.display = 'block' : '';
});

const updateUserBalance = async () => {
    let userBalance = await getUserBalance();

    document.getElementById('usdt-balance')!.innerHTML = numberWithCommas(ethers.formatUnits(userBalance.usdtBalance, 'ether'));
    document.getElementById('blth-balance')!.innerHTML = numberWithCommas(ethers.formatUnits(userBalance.blthBalance, 'ether'));
}

const getUserBalance = async () => {
    if (usdtContract && blthContract && accounts.length) {
        let usdtBalance = await usdtContract.balanceOf(accounts[0] as string);
        let blthBalance = await blthContract.balanceOf(accounts[0] as string);

        return { usdtBalance, blthBalance };
    }

    return { usdtBalance: 0, blthBalance: 0 };
}

const blthInput = document.getElementById('blth-input') as HTMLButtonElement;
blthInput.disabled = true;
const usdtInput = document.getElementById('usdt-input') as HTMLButtonElement;

let blthAmountInWei = 0;
let usdtAmountInWei = 0;
let slippage = '2';

const updateAvailableBlth = async () => {
    if (blthContract && usdtInput && usdtInput.value && Number(usdtInput.value) > 0) {
        blthAmountInWei = await blthContract.getEstimatedSwapAmount(ethers.parseEther(usdtInput.value.toString()));
        blthInput.value = ethers.formatEther(blthAmountInWei);
    } else {
        blthInput.value = '0';
    }
}

usdtInput?.addEventListener('input', updateAvailableBlth);


const updateAvailableUsdt = async () => {
    if (blthContract && blthInput && blthInput.value && Number(blthInput.value) > 0) {
        usdtAmountInWei = await blthContract.getEstimatedUsdtAmount(ethers.parseEther(blthInput.value.toString()));
        usdtInput.value = ethers.formatEther(usdtAmountInWei);
    } else {
        usdtInput.value = '0';
    }
}

blthInput?.addEventListener('input', updateAvailableUsdt);

const initiateSwap = async () => {
    if (blthContract && usdtContract && accounts.length) {
        let signer = await provider.getSigner();

        const usdtContractSigned = usdtContract.connect(signer);
        const approveTx = await usdtContractSigned.approve(CONTRACT_ADDRESS.BLTH, ethers.parseEther(usdtInput.value.toString())) as ContractTransactionResponse;
        const approveReceipt = await approveTx.wait();

        console.log('approveReceipt', approveReceipt);
        const blthContractSigned = blthContract.connect(signer);
        const swapTx = await blthContractSigned.swap(ethers.parseEther(usdtInput.value.toString()), blthAmountInWei, slippage) as ContractTransactionResponse;
        const swapReceipt = await swapTx.wait();

        console.log('swapReceipt', swapReceipt);

        usdtInput.value = '0';
        blthInput.value = '0';

        await updateUserBalance();
        await getCurrentPrice();
    }
}
const initiateReverseSwap = async () => {
    if (blthContract && usdtContract && accounts.length) {
        let signer = await provider.getSigner();

        const blthContractSigned = blthContract.connect(signer);
        const approveTx = await blthContractSigned.approve(CONTRACT_ADDRESS.BLTH, ethers.parseEther(blthInput.value.toString())) as ContractTransactionResponse;
        const approveReceipt = await approveTx.wait();
        console.log('approveReceipt', approveReceipt);

        const swapTx = await blthContractSigned.reverseSwap(ethers.parseEther(blthInput.value.toString()), usdtAmountInWei, slippage) as ContractTransactionResponse;
        const swapReceipt = await swapTx.wait();

        console.log('reverseSwapReceipt', swapReceipt);

        usdtInput.value = '0';
        blthInput.value = '0';

        await updateUserBalance();
        await getCurrentPrice();
    }
}

swapBtn?.addEventListener('click', initiateSwap);
reverseSwapBtn?.addEventListener('click', initiateReverseSwap);

const flipBox = document.getElementById('flip-box');

flipBox?.addEventListener('click', () => {
    const elementList = document.getElementById('swap-box');
    if (elementList) {
        let first = elementList?.firstElementChild as HTMLDivElement;
        let last = elementList?.lastElementChild as HTMLDivElement;


        first.children[0].children[0].innerHTML = "TOTAL AVAILABLE FOR YOU:";
        last.children[0].children[0].innerHTML = "YOU SEND*:";

        let slippageElement = first.children[0].children[2];

        slippageElement.remove();

        last.children[0].appendChild(slippageElement);

        elementList.removeChild(first);
        elementList.removeChild(last);

        elementList.insertBefore(last, elementList.firstChild);
        elementList.appendChild(first);

        blthInput.disabled = !blthInput.disabled;
        usdtInput.disabled = !usdtInput.disabled;

        usdtInput.value = '0';
        blthInput.value = '0';

        if (openConnectModalBtn?.style.display === "none") {
            if (swapBtn.style.display === "none") {
                swapBtn.style.display = "block";
                reverseSwapBtn.style.display = "none";
            } else {
                reverseSwapBtn.style.display = "block";
                swapBtn.style.display = "none";
            }
        }
    }
});

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


const popupBg = document.getElementById("popup-bg");
const tokenPopup = document.getElementById("token-popup");
const handleOpenTokenPopup = () => {
    popupBg!.style.display = "flex";
    tokenPopup!.style.display = "flex";
};

const handleCloseTokenPopup = () => {
    popupBg!.style.display = "none";
    tokenPopup!.style.display = "none";
};

const tokenPopupBtn = document.getElementById("open-token-popup");
const tokenPopupBtn2 = document.getElementById("open-token-popup-2");

tokenPopupBtn?.addEventListener('click', handleOpenTokenPopup);
tokenPopupBtn2?.addEventListener('click', handleOpenTokenPopup);

const closeTokenPopupBtn = document.getElementById("close-token-popup");

closeTokenPopupBtn?.addEventListener('click', handleCloseTokenPopup);


// if someone click outside the popup then close it
window.onclick = (event) => {
    if (event.target === popupBg) {
        handleCloseTokenPopup();
        hideSlippage();
    }
};