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

<style scoped>
.lp-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(192, 132, 252, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.lp-header {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-family: var(--font-primary);
  letter-spacing: 0.05em;
  font-weight: 700;
  opacity: 0.9;
  margin: 0;
}

.lp-card {
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 12px;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.connect-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 0.2rem 0;
}

.lp-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    width: 100%;
}

.info-item {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    border: 1px solid rgba(255, 255, 255, 0.03);
}

.info-item.row-layout {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.label {
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value-group-vertical {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.sub-value {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: var(--font-code);
    margin-top: 2px;
}

.value-group {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
}

.value {
  color: #fff;
  font-family: var(--font-code);
  font-weight: 600;
  font-size: 1rem;
}

.unit {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.action-btn {
  width: 100%;
  height: 36px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(103, 232, 249, 0.1);
  border: 1px solid rgba(103, 232, 249, 0.2);
  color: var(--cyan);
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
    background: rgba(103, 232, 249, 0.2);
    box-shadow: 0 0 15px rgba(103, 232, 249, 0.1);
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(103, 232, 249, 0.3);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .lp-container {
    padding: 1rem;
    margin: 1rem 0rem;
    width: auto;
  }

  .lp-card {
    padding: 0.8rem;
  }
  
  .info-grid {
      grid-template-columns: 1fr; /* Stack on mobile */
  }
  
  .mini-rewards {
      flex-direction: row;
      justify-content: space-between;
  }
}
</style>