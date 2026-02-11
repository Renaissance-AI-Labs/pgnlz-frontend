<template>
  <div class="lp-container glass">
    <h2 class="section-title text-gradient">{{ t('lp.title') }}</h2>
    
    <div class="lp-card">
      <div v-if="!walletState.isConnected" class="connect-hint">
        {{ t('lp.connectWallet') }}
      </div>
      
      <div v-else class="lp-content">
        <!-- My Stake -->
        <div class="info-row">
          <span class="label">{{ t('lp.myStake') }}</span>
          <span class="value highlight">{{ formatAmount(userStake) }} <span class="unit">LP</span></span>
        </div>

        <!-- Pending Rewards -->
        <div class="rewards-section">
            <span class="label">{{ t('lp.pendingRewards') }}</span>
            <div class="rewards-grid">
                <div class="reward-item">
                    <span class="reward-value">{{ formatAmount(pendingPGNLZ) }}</span>
                    <span class="reward-unit">PGNLZ</span>
                </div>
                <div class="reward-item">
                    <span class="reward-value">{{ formatAmount(pendingUSDT) }}</span>
                    <span class="reward-unit">USDT</span>
                </div>
            </div>
        </div>

        <!-- Harvest Button -->
        <button 
          class="btn btn-primary action-btn"
          :disabled="loading || processing || (pendingPGNLZ === BigInt(0) && pendingUSDT === BigInt(0))"
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
const pendingPGNLZ = ref(BigInt(0));
const pendingUSDT = ref(BigInt(0));
const loading = ref(false);
const processing = ref(false);

const formatAmount = (amount) => {
    if (!amount) return '0.00';
    // Format to 4 decimal places for better visibility
    const formatted = ethers.formatEther(amount);
    const parts = formatted.split('.');
    if (parts.length > 1) {
        return `${parts[0]}.${parts[1].substring(0, 4)}`;
    }
    return parts[0];
};

const updateData = async () => {
  if (!walletState.isConnected || !walletState.address) {
      userStake.value = BigInt(0);
      pendingPGNLZ.value = BigInt(0);
      pendingUSDT.value = BigInt(0);
      return;
  }
  
  loading.value = true;
  try {
    const provider = walletState.provider;
    const userAddress = walletState.address;
    
    const lpPoolAddress = getContractAddress('LPPool');
    const pgnlzAddress = getContractAddress('PGNLZ');
    const usdtAddress = getContractAddress('USDT');

    if (!lpPoolAddress || !pgnlzAddress || !usdtAddress) return;

    const lpPoolContract = new ethers.Contract(lpPoolAddress, LPPoolABI, provider);
    
    // 1. Get User Stake
    userStake.value = await lpPoolContract.userStakes(userAddress);

    // 2. Get Pending Rewards (PGNLZ)
    pendingPGNLZ.value = await lpPoolContract.getPendingRewards(userAddress, pgnlzAddress);

    // 3. Get Pending Rewards (USDT)
    pendingUSDT.value = await lpPoolContract.getPendingRewards(userAddress, usdtAddress);

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
  max-width: 800px;
  margin: 1.5rem auto; /* Add margin to separate from StakingSection */
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(192, 132, 252, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-family: var(--font-primary);
  letter-spacing: 0.05em;
}

.lp-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.connect-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 1rem 0;
}

.lp-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.value {
  color: #fff;
  font-family: var(--font-code);
  font-weight: 600;
  font-size: 1.1rem;
}

.unit {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 0.2rem;
}

.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.rewards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
}

.reward-item {
    background: rgba(103, 232, 249, 0.05);
    border: 1px solid rgba(103, 232, 249, 0.1);
    border-radius: 8px;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
}

.reward-value {
    color: var(--cyan);
    font-family: var(--font-code);
    font-weight: 600;
    font-size: 1rem;
}

.reward-unit {
    color: var(--text-secondary);
    font-size: 0.75rem;
}

.action-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .lp-container {
    padding: 1rem;
    margin: 1rem auto;
  }

  .lp-card {
    padding: 1rem;
  }
}
</style>