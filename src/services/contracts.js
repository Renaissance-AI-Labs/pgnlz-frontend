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
    production: '',
  },
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
