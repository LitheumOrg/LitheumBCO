import './main.css'
import './global.d.ts'

import { ethers } from 'ethers';
import { StakingTable as IStakingTable } from "../types/ethers-contracts/StakingTable.ts";

import CONTRACT_ADDRESS from './constants.ts';
import StakingTable from './contracts/StakingTable.sol/StakingTable.json';

const numberWithCommas = (x: String) => {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let provider: ethers.BrowserProvider;
let stakingTableContract: IStakingTable;
let accounts: String[] = [];
let chainId = "0x496";
if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum)
    stakingTableContract = new ethers.Contract(CONTRACT_ADDRESS.STAKING_TABLE, StakingTable.abi, provider) as unknown as IStakingTable;
}

const openConnectModalBtn = document.getElementById('open-connect-modal');
const unstakeBtn = document.getElementById('unstake-btn') as HTMLButtonElement;
unstakeBtn.disabled = true;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const updateBox = document.getElementById('update-box') as HTMLDivElement;
updateBox.style.display = 'none';

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
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

                    await provider.getNetwork();
                } catch (e: any) {
                    console.error("Failed to switch chain:", e);
                    return;
                }
            } else {
                return;
            }
        }
    }

    await updateUserBalance(accounts[0] as string);

    await checkCurrentStakeStatus(accounts[0] as string);

    const isOwner = true;

    if (isOwner) {
        console.log('Owner');
        openConnectModalBtn.style.display = 'none';
        overlay.classList.remove('popup-bg');
        overlay.style.display = 'none';
    } else {
        console.log('Not Owner');
        openConnectModalBtn.innerText = 'Not Owner';
    }
});

const updateUserBalance = async (address: string) => {
    let userBalance = await provider.getBalance(address);

    document.getElementById('connected-address')!.innerHTML = address;
    document.getElementById('lth-balance')!.innerHTML = numberWithCommas(ethers.formatUnits(userBalance, 'ether'));
}

const checkCurrentStakeStatus = async (address: string) => {
    let stakingAmountView = document.getElementById('staking-amount-view')  as HTMLButtonElement
    let ipAddressView = document.getElementById('ip-address-view')  as HTMLButtonElement
    let portView = document.getElementById('port-view')  as HTMLButtonElement;
    try {
        let userStake = await stakingTableContract.getStake(address);

        stakingAmountView.value = ethers.formatUnits(userStake.amount, 'ether');
        ipAddressView.value = userStake.ip;
        portView.value = userStake.port;
        updateBox.style.display = 'flex';
        unstakeBtn.disabled = false;
    } catch (e) {
        console.log('error', e);
        stakingAmountView.value = "NO STAKE FOUND";
    }
}

const stakeBtn = document.getElementById('stake-btn') as HTMLButtonElement;
const stakingAmountInput = document.getElementById('staking-amount-input') as HTMLButtonElement;
const ipAddressInput = document.getElementById('ip-address-input') as HTMLButtonElement;
const portInput = document.getElementById('port-input') as HTMLButtonElement;

stakeBtn?.addEventListener('click', async () => {
    if (stakingTableContract && accounts.length) {
        if (!stakingAmountInput.value || !ipAddressInput.value || !portInput.value) {
            alert('Please fill all the fields');
            return;
        }

        let signer = await provider.getSigner();

        const stakingTableContractSigned = stakingTableContract.connect(signer);

        await stakingTableContractSigned.stake(accounts[0] as string, ethers.parseEther(stakingAmountInput.value), ipAddressInput.value, portInput.value, {
            value: ethers.parseEther(stakingAmountInput.value)
        });

        await checkCurrentStakeStatus(accounts[0] as string);

        stakingAmountInput.value = ``;
        ipAddressInput.value = ``;
        portInput.value = ``;
    }
});

const ipPortBtn = document.getElementById('ip-port-btn') as HTMLButtonElement;
const ipAddressUpdateInput = document.getElementById('ip-address-update-input') as HTMLButtonElement;
const portUpdateInput = document.getElementById('port-update-input') as HTMLButtonElement;

ipPortBtn?.addEventListener('click', async () => {
    if (stakingTableContract && accounts.length) {
        if (!ipAddressUpdateInput.value || !portUpdateInput.value) {
            alert('Please fill all the fields');
            return;
        }

        let signer = await provider.getSigner();

        const stakingTableContractSigned = stakingTableContract.connect(signer);

        await stakingTableContractSigned.setIpAndPort(ipAddressUpdateInput.value, portUpdateInput.value);

        await checkCurrentStakeStatus(accounts[0] as string);

        ipAddressUpdateInput.value = ``;
        portUpdateInput.value = ``;
    }
});

const unstakingAmountInput = document.getElementById('unstake-amount-input') as HTMLButtonElement;

unstakeBtn?.addEventListener('click', async () => {
    if (stakingTableContract && accounts.length) {
        if (!unstakingAmountInput.value) {
            alert('Please fill all the fields');
            return;
        }
        let signer = await provider.getSigner();

        const stakingTableContractSigned = stakingTableContract.connect(signer);

        await stakingTableContractSigned.unstake(ethers.parseEther(unstakingAmountInput.value));

        await checkCurrentStakeStatus(accounts[0] as string);

        unstakingAmountInput.value = ``;
    }
});
