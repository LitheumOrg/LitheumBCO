import './main.css'
import './global.d.ts'

import { ContractTransactionResponse, ethers } from 'ethers';
import { MockUSDTToken as IMockUSDT } from "../types/ethers-contracts/MockUSDTToken.ts";
import { LitheumPrivateBCOERC20 as ILitheumPrivateBCOERC20 } from "../types/ethers-contracts/LitheumPrivateBCOERC20";

import CONTRACT_ADDRESS from './constants';
import LitheumPrivateBCOERC20 from  './contracts/LitheumPrivateBCOERC20.sol/LitheumPrivateBCOERC20.json';
import MockUSDTToken from './contracts/MockUSDTToken.sol/MockUSDTToken.json';

const numberWithCommas = (x: String) => {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const getStaticPrice = async () => {
    if (plthContract) {
        const price = await plthContract.getStaticPrice();
        console.log('price', price.toString());
        document.getElementById('current-price')!.innerText = ethers.formatUnits(price, 'ether');
    }
}

let provider: ethers.BrowserProvider;
let usdtContract: IMockUSDT;
let plthContract: ILitheumPrivateBCOERC20;
if (window.ethereum) {
    // provider = new ethers.JsonRpcProvider('https://rpc-sepolia.rockx.com');
    provider = new ethers.BrowserProvider(window.ethereum);
    usdtContract = new ethers.Contract(CONTRACT_ADDRESS.USDT, MockUSDTToken.abi, provider) as unknown as IMockUSDT;
    plthContract = new ethers.Contract(CONTRACT_ADDRESS.PLTH, LitheumPrivateBCOERC20.abi, provider) as unknown as ILitheumPrivateBCOERC20;
    getStaticPrice();
}


let accounts: String[] = [];
const staticSwapBtn = document.getElementById('static-swap') as HTMLButtonElement;
staticSwapBtn?staticSwapBtn.style.display = 'none':'';
if (accounts.length) {
    staticSwapBtn?staticSwapBtn.style.display = 'none':'';
}


const openConnectModalBtn = document.getElementById('open-connect-modal-pvt')

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    await updateUserBalance();

    const signer = await provider.getSigner();

    const plthContractSigned = plthContract.connect(signer);

    const isUserWhitelisted = await plthContractSigned.isAddressInWhitelist(accounts[0] as string);

    // await getStaticPrice();
    if (!isUserWhitelisted) {
        alert('You are not whitelisted');

    }

    openConnectModalBtn?openConnectModalBtn.style.display = 'none':'';
    staticSwapBtn?staticSwapBtn.style.display = 'block':'';
});

export const updateUserBalance = async () => {
    let userBalance = await getUserBalance();

    document.getElementById('usdt-balance')!.innerHTML = numberWithCommas(ethers.formatUnits(userBalance.usdtBalance, 'ether'));
    document.getElementById('plth-balance')!.innerHTML = numberWithCommas(ethers.formatUnits(userBalance.blthBalance, 'ether'));
}

const getUserBalance = async () => {
    if (usdtContract && plthContract && accounts.length) {
        let usdtBalance = await usdtContract.balanceOf(accounts[0] as string);
        let blthBalance = await plthContract.balanceOf(accounts[0] as string);

        return { usdtBalance, blthBalance };
    }

    return { usdtBalance: 0, blthBalance: 0 };
}


const plthInput = document.getElementById('plth-input') as HTMLButtonElement;
plthInput.disabled = true;
const usdtInput = document.getElementById('usdt-input') as HTMLButtonElement;

let plthAmountInWei: any;
// let usdtAmountInWei = 0;
// let slippage = '2';

const updateAvailableBlth = async () => {
    if (plthContract) {
        plthAmountInWei = await plthContract.getEstimatedSwapAmount(ethers.parseEther(usdtInput.value.toString()));
        plthInput.value = ethers.formatEther(plthAmountInWei);
    }
}

usdtInput?.addEventListener('input', updateAvailableBlth);

const initiateStaticSwap = async () => {
    if (plthContract && usdtContract && accounts.length) {
        // const whitelisted = await plthContract.getWhitelist();

        // console.log('whitelisted', whitelisted);
        // return;
        let signer = await provider.getSigner();

        const usdtContractSigned = usdtContract.connect(signer);
        const approveTx = await usdtContractSigned.approve(CONTRACT_ADDRESS.PLTH, ethers.parseEther(usdtInput.value.toString())) as ContractTransactionResponse;
        const approveReceipt = await approveTx.wait();

        console.log('approveReceipt', approveReceipt);
        const plthContractSigned = plthContract.connect(signer);
        const swapTx = await plthContractSigned.staticSwap(ethers.parseEther(usdtInput.value.toString())) as ContractTransactionResponse;
        const swapReceipt = await swapTx.wait();

        console.log('swapReceipt', swapReceipt);

        usdtInput.value = '0';
        plthInput.value = '0';

        await updateUserBalance();
    }
}

staticSwapBtn?.addEventListener('click', initiateStaticSwap);
