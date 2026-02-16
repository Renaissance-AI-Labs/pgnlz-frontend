<template>
  <div class="lp-container glass">
    <div class="lp-header">
        <h2 class="section-title text-gradient">{{ t('lp.title') }}</h2>
        <!-- Optional: Add a small info icon or tooltip here -->
    </div>
    
    <div class="lp-card">
      <div v-if="!walletState.isConnected" class="connect-hint">
        {{ t('lp.connectWallet') }}
      </div>
      
      <div v-else class="lp-content">
        <!-- Compact Info Grid -->
        <div class="info-grid">
            <!-- My Stake -->
            <div class="info-item row-layout">
                <span class="label">{{ t('lp.myStake') }}</span>
                <div class="value-group-vertical">
                    <div class="value-group">
                        <span class="value highlight">{{ formatAmount(userStake) }}</span>
                        <span class="unit">LP</span>
                    </div>
                    <div class="sub-value">
                         ≈ {{ formatAmount(usdtEquivalent) }} USDT
                    </div>
                </div>
            </div>
            
            <!-- Pending Rewards Combined -->
            <div class="info-item row-layout">
                <span class="label">{{ t('lp.pendingRewards') }}</span>
                <div class="value-group">
                    <span class="value highlight">{{ formatAmount(pendingUSDT) }}</span>
                    <span class="unit">USDT</span>
                </div>
            </div>
        </div>

        <!-- Harvest Button -->
        <button 
          class="btn btn-primary action-btn"
          :disabled="loading || processing || pendingUSDT === BigInt(0)"
          @click="handleHarvest"
        >
          <span v-if="processing" class="spinner"></span>
          {{ processing ? t('lp.harvesting') : t('lp.harvest') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ethers } from 'ethers';
import { t } from '@/i18n';
import { walletState } from '@/services/wallet';
import { getContractAddress } from '@/services/contracts';
import LPPoolABI from '@/abis/LPPool.json';
import { showToast } from '@/services/notification';

const userStake = ref(BigInt(0));
const pendingUSDT = ref(BigInt(0));
const usdtEquivalent = ref(BigInt(0));
const loading = ref(false);
const processing = ref(false);

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

const formatAmount = (amount) => {
    if (!amount) return '0.00';
    // Format to 2 decimal places for compactness, or 4 if small
    const formatted = ethers.formatEther(amount);
    const parts = formatted.split('.');
    if (parts.length > 1) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    return parts[0];
};

const updateData = async () => {
  if (!walletState.isConnected || !walletState.address) {
      userStake.value = BigInt(0);
      pendingUSDT.value = BigInt(0);
      usdtEquivalent.value = BigInt(0);
      return;
  }
  
  loading.value = true;
  try {
    const provider = walletState.provider;
    const userAddress = walletState.address;
    
    const lpPoolAddress = getContractAddress('LPPool');
    const usdtAddress = getContractAddress('USDT');
    const lpTokenAddress = getContractAddress('USDT_PGNLZ_LP');

    if (!lpPoolAddress || !usdtAddress || !lpTokenAddress) return;

    const lpPoolContract = new ethers.Contract(lpPoolAddress, LPPoolABI, provider);
    const lpTokenContract = new ethers.Contract(lpTokenAddress, ERC20_ABI, provider);
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, provider);
    
    // 1. Get User Stake
    userStake.value = await lpPoolContract.userStakes(userAddress);

    // 2. Get Pending Rewards (USDT)
    pendingUSDT.value = await lpPoolContract.getPendingRewards(userAddress, usdtAddress);

    // 3. Calculate USDT Equivalent
    // Formula: userStake / totalLP * lpUsdtBalance
    try {
        const [totalSupply, lpUsdtBalance] = await Promise.all([
            lpTokenContract.totalSupply(),
            usdtContract.balanceOf(lpTokenAddress)
        ]);

        if (totalSupply > BigInt(0)) {
            usdtEquivalent.value = (userStake.value * lpUsdtBalance) / totalSupply;
        } else {
            usdtEquivalent.value = BigInt(0);
        }
    } catch (e) {
        console.error("Error calculating LP value:", e);
        usdtEquivalent.value = BigInt(0);
    }

  } catch (error) {
    console.error("Error updating LP Pool data:", error);
  } finally {
    loading.value = false;
  }
};

const handleHarvest = async () => {
  if (!walletState.isConnected) return;
  
  processing.value = true;
  try {
    const signer = walletState.signer;
    const lpPoolAddress = getContractAddress('LPPool');
    const lpPoolContract = new ethers.Contract(lpPoolAddress, LPPoolABI, signer);
    
    const tx = await lpPoolContract.harvest();
    await tx.wait();
    
    showToast(t('lp.harvestSuccess'), 'success');
    
    // Refresh data
    await updateData();
    
  } catch (error) {
    console.error(error);
    if (error.code === 4001 || error.code === 'ACTION_REJECTED' || (error.reason && error.reason.includes('rejected'))) {
       return;
    }
    showToast(t('lp.harvestFailed'), 'error');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  updateData();
});

watch(() => walletState.isConnected, () => {
  updateData();
});
</script>
