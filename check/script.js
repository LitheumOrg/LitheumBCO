"use strict";
console.log('Hello, World!');

let slipper = document.getElementById('slippage-dd');
slipper.style.display = 'none';

function showSlippage() {
    slipper.style.display = 'block';
}

// import WalletConnectProvider from '@walletconnect/web3-provider';
// const WalletConnectProvider = require('@walletconnect/web3-provider').default;
// const Web3Modal = require('@web3modal/ethers').default;

// const Web3Modal = window.Web3Modal.default;
// const WalletConnectProvider = window.WalletConnectProvider.default;
// // // Initialize WalletConnect
// const walletConnectProvider = new WalletConnectProvider({
//   projectId: 'de09b512de24701dffa1302cc42e4448', // Replace with your WalletConnect project ID
// });

// // // Initialize Web3Modal
// const web3Modal = new Web3Modal({
//   providerOptions: {
//     walletconnect: {
//       package: walletConnectProvider,
//     },
//   },
// });
// // Connect to the wallet
// const connectButton = document.getElementById('connectButton');
// connectButton.addEventListener('click', async () => {
//   try {
//     // Connect to the wallet
//     const provider = await web3Modal.connect();

//     // Get the user's Ethereum address
//     const accounts = await provider.request({ method: 'eth_requestAccounts' });
//     const userAddress = accounts[0];

//     // You can now use the provider to interact with the blockchain
//     console.log('Connected to wallet:', userAddress);
//   } catch (error) {
//     console.error('Error connecting to wallet:', error);
//   }
// });