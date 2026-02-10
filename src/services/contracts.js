// src/services/contracts.js
import { walletState } from './wallet';
import { APP_ENV } from './environment';

// Contract Addresses Configuration
// Organized by Contract Name -> Environment
const CONTRACT_ADDRESSES = {
  nodeNFT: {
    development: '0xAfa9f8df415eDe1410Efc2c4E551C78f91Dc8EB9',
    production: '0x4ED60EB0efC7fe323684939bb6614442209379f9',
  },
  referral: {
    development: '0xa537AC02437e17515139f92256cab43D85B6A9E3',
    production: '0xD717165648576e2222b42759b7efCDc108fc3F30',
  },
  USDT: {
    development: '0xaE36d423c5B05f80926AaEAE0Fca978A74C0aA01',
    production: '0x55d398326f99059fF775485246999027B3197955',
  },
  Router: {
    development: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    production: '',
  },
  LPPool: {
    development: '0xdFb1968978c55A9A8b83f0e23344610aee016753',
    production: '',
  },
  Staking: {
    development: '0x345A5cB79d2daD082e2fc2959965dB0400611c2F',
    production: '',
  },
  PGNLZ: {
    development: '0x611b5BC652a40E06A51b636b2Bc3A1aFe19B3Bd2',
    production: '',
  },
  USDT_PGNLZ_LP: {
    development: '0xCc0eA25FdBd0AdC31C8013e7e5b3Fa5C70Bde98a',
    production: '',
  },
  Node: {
    development: '0xAfa9f8df415eDe1410Efc2c4E551C78f91Dc8EB9',
    production: '',
  },
  NodePool: {
    development: '0x6f96b137a558a6B7C70B8AFD6DB3B18228C27298',
    production: '',
  }
};

/**
 * Get contract address by name for current chain
 * @param {string} contractName 
 * @returns {string} Contract address
 */
export const getContractAddress = (contractName) => {
  const contractConfig = CONTRACT_ADDRESSES[contractName];
  if (!contractConfig) return '';

  let isProduction = false;

  // Determine environment based on Chain ID or APP_ENV
  if (walletState.chainId) {
    // Chain ID 56 is BSC Mainnet
    const chainId = Number(walletState.chainId);
    isProduction = chainId === 56;
  } else {
    // Fallback to APP_ENV if wallet not connected
    isProduction = APP_ENV === 'PROD';
  }

  return isProduction ? contractConfig.production : contractConfig.development;
};

/**
 * Initializes all contract instances.
 * Cleaned up for new project structure.
 */
export const initializeContracts = async () => {
  if (!walletState.isConnected || !walletState.signer) {
    return;
  }
  console.log("Contracts initialization skipped (Cleaned).");
  walletState.contractsInitialized = true;
};

export const resetContracts = () => {
  console.log("Contracts reset.");
};

// Placeholder for referrer check to prevent wallet.js errors
export const checkIfUserHasReferrer = async () => {
  return true; // Default to true or false depending on desired default behavior
};
