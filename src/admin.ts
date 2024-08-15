import '../src/admin.css';
import './global.d.ts';
import modal from './walletConnect.ts';

import { ContractTransactionResponse, ethers } from 'ethers';
import { LitheumPresaleBCOERC20 as ILitheumPresaleBCOERC20 } from "../types/ethers-contracts/LitheumPresaleBCOERC20";
import { LitheumPrivateBCOERC20 as ILitheumPrivateBCOERC20 } from "../types/ethers-contracts/LitheumPrivateBCOERC20";
import { LitheumERC20 as ILitheumERC20 } from "../types/ethers-contracts/LitheumERC20";

import CONTRACT_ADDRESS from './constants';
import LitheumPresaleBCOERC20 from  './contracts/LitheumPresaleBCOERC20.sol/LitheumPresaleBCOERC20.json';
import LitheumPrivateBCOERC20 from './contracts/LitheumPrivateBCOERC20.sol/LitheumPrivateBCOERC20.json';
import LitheumERC20 from './contracts/LitheumERC20.sol/LitheumERC20.json';


let provider: ethers.BrowserProvider;
let blthContract: ILitheumPresaleBCOERC20;
let plthContract: ILitheumPrivateBCOERC20;
let wlthContract: ILitheumERC20;
if (window.ethereum) {
    // provider = new ethers.JsonRpcProvider('https://rpc-sepolia.rockx.com');
    provider = new ethers.BrowserProvider(window.ethereum);
    blthContract = new ethers.Contract(CONTRACT_ADDRESS.BLTH, LitheumPresaleBCOERC20.abi, provider) as unknown as ILitheumPresaleBCOERC20;
    plthContract = new ethers.Contract(CONTRACT_ADDRESS.PLTH, LitheumPrivateBCOERC20.abi, provider) as unknown as ILitheumPrivateBCOERC20;
    wlthContract = new ethers.Contract(CONTRACT_ADDRESS.WLTH, LitheumERC20.abi, provider) as unknown as ILitheumERC20;
}

// let accounts: String[] = [];
const openConnectModalBtn = document.getElementById('open-connect-modal');

const overlay = document.getElementById('overlay') as HTMLDivElement;

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    // accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    modal.open();
    const walletProvider = await modal.getWalletProvider() as ethers.Eip1193Provider;

    console.log('chain id', modal.getChainId());

    provider = new ethers.BrowserProvider(walletProvider);

    const signer = await provider.getSigner();
    const plthContractSigned = plthContract.connect(signer);

    const isOwner = await plthContractSigned.isOwner();

    if (isOwner) {
        console.log('Owner');
        openConnectModalBtn.style.display = 'none';
        overlay.classList.remove('popup-bg');
        overlay.classList.remove('dark-bg');
    } else {
        console.log('Not Owner');
        openConnectModalBtn.innerText = 'Not Owner';
    }
});

/**
 * setLitheumERC20TokenAddress - Private
 * setLitheumERC20TokenAddress - presale
 * setTokenAddress - Private
 * setTokenAddress - presale
 *  - address
 *  - dropdown
 *  - button
 * launchSAFT - private
 * launchSAFT - presale
 *  - dropdown
 *  - button
 * withdraw - private
 * withdraw - presale
 * setStaticPrice - private
 *  - input
 *  - button
 * addToWhitelist - private
 *  - address
 *  - limit
 *  - button
 * removeFromWhitelist - private
 *  - address
 *  - button
 */

const setWlthBtn = document.getElementById('set-wlth-address-btn') as HTMLButtonElement;
const setLitheumERC20TokenAddress = async () => {
    const wlthAddress = (document.getElementById('wlth-address') as HTMLInputElement).value;
    const bcoOffering = (document.getElementById('bco-select-wlth') as HTMLSelectElement).value;

    if (wlthAddress && bcoOffering) {
        const signer = await provider.getSigner();
        if (bcoOffering === 'blth') {
            const blthContractSigned = blthContract.connect(signer);
            const tx = await blthContractSigned.setLitheumERC20TokenAddress(wlthAddress) as ContractTransactionResponse;
            await tx.wait();

        } else if (bcoOffering === 'plth') {
            const plthContractSigned = plthContract.connect(signer);
            const tx = await plthContractSigned.setLitheumERC20TokenAddress(wlthAddress) as ContractTransactionResponse;
            await tx.wait();
        }

        setWlthBtn.innerText = 'Set Litheum ERC20 Token Address';
    } else {
        setWlthBtn.innerText = 'Please enter a valid address';
    }
}

setWlthBtn?.addEventListener('click', setLitheumERC20TokenAddress);


const launchSAFTBtn = document.getElementById('launch-saft-btn') as HTMLButtonElement;

const launchSAFT = async () => {
    const bcoOffering = (document.getElementById('bco-select-saft') as HTMLSelectElement).value;

    if (bcoOffering) {
        const signer = await provider.getSigner();
        if (bcoOffering === 'blth') {
            const blthContractSigned = blthContract.connect(signer);
            const tx = await blthContractSigned.launchSAFT() as ContractTransactionResponse;
            await tx.wait();

        } else if (bcoOffering === 'plth') {
            const plthContractSigned = plthContract.connect(signer);
            const tx = await plthContractSigned.launchSAFT() as ContractTransactionResponse;
            await tx.wait();
        }

        launchSAFTBtn.innerText = 'SAFT Launched';
    } else {
        launchSAFTBtn.innerText = 'Please select an offering';
    }
}

launchSAFTBtn?.addEventListener('click', launchSAFT);


const withdrawBtn = document.getElementById('withdraw-usdt-btn') as HTMLButtonElement;

const withdraw = async () => {
    const bcoOffering = (document.getElementById('bco-select-withdraw') as HTMLSelectElement).value;
    const withdrawAmount = (document.getElementById('usdt-withdraw') as HTMLInputElement).value;

    if (bcoOffering && withdrawAmount && Number(withdrawAmount) > 0) {
        const signer = await provider.getSigner();
        if (bcoOffering === 'blth') {
            const blthContractSigned = blthContract.connect(signer);
            const tx = await blthContractSigned.withdraw(ethers.parseEther(withdrawAmount)) as ContractTransactionResponse;
            await tx.wait();

        } else if (bcoOffering === 'plth') {
            const plthContractSigned = plthContract.connect(signer);
            const tx = await plthContractSigned.withdraw(ethers.parseEther(withdrawAmount)) as ContractTransactionResponse;
            await tx.wait();
        }

        withdrawBtn.innerText = 'Withdrawn';
    } else {
        withdrawBtn.innerText = 'Please select an offering';
    }
}

withdrawBtn?.addEventListener('click', withdraw);

const setStaticPriceBtn = document.getElementById('set-static-price-btn') as HTMLButtonElement;

const setStaticPrice = async () => {
    const staticPrice = (document.getElementById('usdt-for-blth') as HTMLInputElement).value;

    if (staticPrice && Number(staticPrice) > 0) {
        const signer = await provider.getSigner();
        const plthContractSigned = plthContract.connect(signer);
        const tx = await plthContractSigned.setStaticPrice(ethers.parseEther(staticPrice)) as ContractTransactionResponse;
        await tx.wait();

        setStaticPriceBtn.innerText = 'Static Price Set';
    } else {
        setStaticPriceBtn.innerText = 'Please enter a valid price';
    }
}

setStaticPriceBtn?.addEventListener('click', setStaticPrice);

const addToWhitelistBtn = document.getElementById('add-to-whitelist-btn') as HTMLButtonElement;

const addToWhitelist = async () => {
    const address = (document.getElementById('wl-address') as HTMLInputElement).value;
    const limit = (document.getElementById('wl-limit') as HTMLInputElement).value;

    if (address && limit && Number(limit) > 0) {
        const signer = await provider.getSigner();
        const plthContractSigned = plthContract.connect(signer);
        const tx = await plthContractSigned.addToWhitelist(address, ethers.parseEther(limit)) as ContractTransactionResponse;
        await tx.wait();

        addToWhitelistBtn.innerText = 'Adding sucessful';
    } else {
        addToWhitelistBtn.innerText = 'Please enter a valid address and limit';
    }
}

addToWhitelistBtn?.addEventListener('click', addToWhitelist);

const removeFromWhitelistBtn = document.getElementById('remove-from-whitelist-btn') as HTMLButtonElement;

const removeFromWhitelist = async () => {
    const address = (document.getElementById('wl-rm-address') as HTMLInputElement).value;

    if (address) {
        const signer = await provider.getSigner();
        const plthContractSigned = plthContract.connect(signer);
        const tx = await plthContractSigned.removeFromWhitelist(address) as ContractTransactionResponse;
        await tx.wait();

        removeFromWhitelistBtn.innerText = 'Removing sucessful';
    } else {
        removeFromWhitelistBtn.innerText = 'Please enter a valid address';
    }
}

removeFromWhitelistBtn?.addEventListener('click', removeFromWhitelist);

const setTokenAddressBtn = document.getElementById('set-address-btn') as HTMLButtonElement;
const setTokenAddress = async () => {
    const tokenAddress = (document.getElementById('token-address') as HTMLInputElement).value;
    const bcoOffering = (document.getElementById('bco-select-token') as HTMLSelectElement).value;

    if (tokenAddress && bcoOffering) {
        const signer = await provider.getSigner();
        const wlthContractSigned = wlthContract.connect(signer);
        if (bcoOffering === 'blth') {
            const tx = await wlthContractSigned.setLitheumPresaleBCOERC20Address(tokenAddress) as ContractTransactionResponse;
            await tx.wait();

        } else if (bcoOffering === 'plth') {
            const tx = await wlthContractSigned.setLitheumPrivateBCOERC20Address(tokenAddress) as ContractTransactionResponse;
            await tx.wait();
        }

        setTokenAddressBtn.innerText = 'Set Token Address';
    } else {
        setTokenAddressBtn.innerText = 'Please enter a valid address';
    }
}

setTokenAddressBtn?.addEventListener('click', setTokenAddress);
