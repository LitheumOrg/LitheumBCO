
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'

// 1. Your WalletConnect Cloud project ID
export const projectId = 'de09b512de24701dffa1302cc42e4448'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

const sepolia = {
    chainId: 11155111,
    name: 'SepoliaEthereum',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://1rpc.io/sepolia'
}

const polygon = {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com/',
    rpcUrl: 'https://polygon-rpc.com/'
}

const litheum = {
    chainId: 137,
    name: 'Litheum Test Network',
    currency: 'LTH',
    // explorerUrl: 'https://polygonscan.com/',
    rpcUrl: 'http://localhost:8001/'
}

// 3. Create your application's metadata object
const metadata = {
  name: 'Sepolia Litheum BCO',
  description: 'AppKit Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 11155111, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia, polygon, mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export default modal;