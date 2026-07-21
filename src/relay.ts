import './main.css'
import './global.d.ts'

import { ethers } from 'ethers';
import { DelegationTable as IDelegationTable } from "../types/ethers-contracts/contracts/DelegationTable.ts";

import DelegationTable from './contracts/DelegationTable.sol/DelegationTable.json';

import CONSTANTS from './constants.ts';
const { CONTRACT_ADDRESS } = CONSTANTS;

const numberWithCommas = (x: String) => {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let provider: ethers.BrowserProvider;
let delegationTableContract: IDelegationTable;
let accounts: String[] = [];
let chainId = "0x496";
if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum)
    delegationTableContract = new ethers.Contract(CONTRACT_ADDRESS.DELEGATION_TABLE, DelegationTable.abi, provider) as unknown as IDelegationTable;
}

const openConnectModalBtn = document.getElementById('open-connect-modal');
// const unstakeBtn = document.getElementById('unstake-btn') as HTMLButtonElement;
// unstakeBtn.disabled = true;
const overlay = document.getElementById('overlay') as HTMLDivElement;
// const updateBox = document.getElementById('update-box') as HTMLDivElement;
// updateBox.style.display = 'none';

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    console.log('clicked');
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const { chainId: currentChainId } = await provider.getNetwork();

    if (currentChainId !== BigInt(parseInt(chainId, 16))) {
        try {
            // Request to switch to the desired network
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainId }],
            });
            console.log(`Switched to chainId: ${chainId}`);

            provider = new ethers.BrowserProvider(window.ethereum)
            delegationTableContract = new ethers.Contract(CONTRACT_ADDRESS.STAKING_TABLE, DelegationTable.abi, provider) as unknown as IDelegationTable;

            await provider.getNetwork();

        } catch (e: any) {
            console.error("Failed to switch chain:", e);
            if (e.code === 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                      {
                        chainId,
                        chainName: "Litheum Test Network",
                        nativeCurrency: {
                          name: "Lith",
                          symbol: "LTH",
                          decimals: 18
                        },
                        rpcUrls: ["https://testnet.litheum.com"],
                        blockExplorerUrls: ["https://explorer.litheum.com"]
                      }
                    ]
                });

                try {
                    // Request to switch to the desired network
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: chainId }],
                    });
                    console.log(`Switched to chainId: ${chainId}`);

                    provider = new ethers.BrowserProvider(window.ethereum)
                    delegationTableContract = new ethers.Contract(CONTRACT_ADDRESS.STAKING_TABLE, DelegationTable.abi, provider) as unknown as IDelegationTable;

                    await provider.getNetwork();

                    await new Promise(r => setTimeout(r, 2000));
                } catch (e: any) {
                    console.error("Failed to switch chain:", e);
                    return;
                }
            } else {
                return;
            }
        }
    }
    // const isOwner = true;

    openConnectModalBtn.style.display = 'none';
    overlay.classList.remove('popup-bg');
    overlay.style.display = 'none';
});

const relayAddressInput = document.getElementById('relay-address') as HTMLInputElement;
const setRelayAddressBtn = document.getElementById('set-relay-address-btn') as HTMLButtonElement;

setRelayAddressBtn.addEventListener('click', async () => {
    const relayAddress = relayAddressInput.value;
    if (!relayAddress) {
        console.error('Relay address is required');
        return;
    }

    try {
        let signer = await provider.getSigner();
        const delegationTableContractSigned = delegationTableContract.connect(signer);
        const tx = await delegationTableContractSigned.delegate(relayAddressInput.value);
        await tx.wait();
        console.log('Relay address set successfully');
    } catch (error) {
        console.error('Error setting relay address:', error);
    }
});