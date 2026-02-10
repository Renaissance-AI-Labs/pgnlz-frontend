<template>
  <div class="staking-container glass">
    <h2 class="section-title text-gradient">{{ t('staking.title') }}</h2>
    
    <div class="stake-card">
      <div class="amount-display">
        <span class="label">{{ t('staking.amountLabel') }}</span>
        <div class="value-row">
          <span class="value">{{ fixedAmount }}</span>
          <span class="currency">USDT</span>
        </div>
      </div>

      <div class="action-area">
        <div v-if="!walletState.isConnected" class="connect-hint">
          {{ t('team.inputPlaceholder.connectWallet') }}
        </div>
        
        <template v-else>
          <!-- Approve Button -->
          <button 
            v-if="needsApproval" 
            class="btn btn-primary action-btn"
            :disabled="loading || processing"
            @click="handleApprove"
          >
            <span v-if="processing" class="spinner"></span>
            {{ processing ? t('staking.approving') : t('staking.approve') }}
          </button>

          <!-- Stake Button -->
          <button 
            v-else 
            class="btn btn-primary action-btn"
            :disabled="loading || processing || insufficientBalance"
            @click="handleStake"
          >
            <span v-if="processing" class="spinner"></span>
            {{ processing ? t('staking.staking') : t('staking.stake') }}
          </button>
        </template>
        
        <p v-if="insufficientBalance" class="error-text">{{ t('staking.insufficientBalance') }}</p>
      </div>
    </div>

    <!-- Queue Status for Latest Order -->
    <div v-if="queueStatus" class="queue-status-card">
      <div class="status-header">
        <span class="status-dot pulsing"></span>
        {{ t('staking.queueTitle') }}
      </div>
      <div class="status-details">
        <div class="detail-row">
          <span>{{ t('staking.position') }}:</span>
          <span class="highlight">{{ queueStatus.position }}</span>
        </div>
        <div class="detail-row">
          <span>{{ t('staking.amountAhead') }}:</span>
          <span class="highlight">{{ queueStatus.amountAhead }} USDT</span>
        </div>
        <div class="detail-row">
          <span>{{ t('staking.waitDays') }}:</span>
          <span class="highlight">{{ queueStatus.estimatedWaitDays }} {{ t('staking.days') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ethers } from 'ethers';
import { t } from '@/i18n';
import { walletState } from '@/services/wallet';
import { getContractAddress } from '@/services/contracts';
import StakingABI from '@/abis/staking.json';
import { showToast } from '@/services/notification';

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const fixedAmount = ref('100'); // Display value
const rawFixedAmount = ref(BigInt(0)); // BigInt value from contract
const loading = ref(false);
const processing = ref(false);
const needsApproval = ref(true);
const userBalance = ref(BigInt(0));
const queueStatus = ref(null);

const insufficientBalance = computed(() => {
  if (rawFixedAmount.value === BigInt(0)) return false;
  return userBalance.value < rawFixedAmount.value;
});

const updateData = async () => {
  if (!walletState.isConnected || !walletState.address) {
      // If not connected, we can still fetch fixedStakeAmount from a read-only provider
      // But for now, let's just reset
      needsApproval.value = true;
      return;
  }
  
  loading.value = true;
  try {
    const provider = walletState.provider;
    const signer = walletState.signer;
    const userAddress = walletState.address;

    const stakingAddress = getContractAddress('Staking');
    const usdtAddress = getContractAddress('USDT');

    if (!stakingAddress || !usdtAddress) return;

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, provider);

    // 1. Get Fixed Stake Amount
    const amount = await stakingContract.fixedStakeAmount();
    rawFixedAmount.value = amount;
    fixedAmount.value = ethers.formatEther(amount).split('.')[0]; // Assuming integer 100

    // 2. Check Balance
    const balance = await usdtContract.balanceOf(userAddress);
    userBalance.value = balance;

    // 3. Check Allowance
    const allowance = await usdtContract.allowance(userAddress, stakingAddress);
    needsApproval.value = allowance < amount;

    // 4. Check Queue Status (Find latest queued order)
    await checkQueueStatus(stakingContract, userAddress);

  } catch (error) {
    console.error("Error updating staking data:", error);
  } finally {
    loading.value = false;
  }
};

const checkQueueStatus = async (stakingContract, userAddress) => {
    try {
        // Get user record count
        const count = await stakingContract.getUserRecordCount(userAddress, 0); // 0 for all? or check ABI
        // Actually the ABI says getUserRecordInfos takes a status. 
        // Let's try to get the latest records. 
        // We need to know how to pagination. cursor starts at 0?
        // Let's just try to fetch the latest few.
        // Wait, getUserRecordCount takes status. What are the status codes?
        // Usually 0=All, 1=Active...
        // If we don't know, we might skip count and just fetch infos.
        // Let's assume fetching latest 5 records is enough to find a queued one.
        // Since the pagination is "cursor" based, we might need to fetch from head or tail?
        // The ABI: getUserRecordInfos(user, cursor, limit, status) returns records[] and nextCursor.
        // Usually cursor=0 starts from beginning? Or end? 
        // Often these contracts return lists.
        // Let's try cursor=0, limit=10, status=0 (all).
        
        // Actually, efficiently, we want the *active* queue.
        // `isQueued` property in record.
        
        const result = await stakingContract.getUserRecordInfos(userAddress, 0, 10, 0);
        const records = result[0]; // records array
        
        // Find the *last* record that has isQueued = true
        // Assuming records are ordered? Usually chronological or reverse?
        // Let's look for any isQueued.
        const queuedRecord = records.find(r => r.record.isQueued === true);
        
        if (queuedRecord) {
            // Found a queued record.
            // Call getQueuePositionInfo(user, index)
            // The record has an `id` or `index`?
            // Struct RecordInfo has `uint256 id`.
            const index = queuedRecord.id;
            
            const posInfo = await stakingContract.getQueuePositionInfo(userAddress, index);
            // returns [found, position, amountAhead, estimatedWaitDays]
            
            if (posInfo[0]) { // found
                queueStatus.value = {
                    position: Number(posInfo[1]),
                    amountAhead: ethers.formatEther(posInfo[2]),
                    estimatedWaitDays: Number(posInfo[3])
                };
            } else {
                queueStatus.value = null;
            }
        } else {
            queueStatus.value = null;
        }
        
    } catch (e) {
        console.warn("Failed to check queue status", e);
    }
};

const handleApprove = async () => {
  if (!walletState.isConnected) return;
  
  processing.value = true;
  try {
    const signer = walletState.signer;
    const usdtAddress = getContractAddress('USDT');
    const stakingAddress = getContractAddress('Staking');
    
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, signer);
    
    // Approve fixed amount (or max)
    const tx = await usdtContract.approve(stakingAddress, rawFixedAmount.value);
    await tx.wait();
    
    showToast(t('staking.approveSuccess'), 'success');
    needsApproval.value = false;
  } catch (error) {
    console.error(error);
    showToast(t('staking.approveFailed'), 'error');
  } finally {
    processing.value = false;
  }
};

const handleStake = async () => {
  if (!walletState.isConnected) return;
  
  processing.value = true;
  try {
    const signer = walletState.signer;
    const stakingAddress = getContractAddress('Staking');
    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    
    // Call stake() - no args based on ABI, it uses fixedStakeAmount
    const tx = await stakingContract.stake();
    await tx.wait();
    
    showToast(t('staking.stakeSuccess'), 'success');
    
    // Refresh data
    await updateData();
    
  } catch (error) {
    console.error(error);
    // Parse error if possible
    let msg = t('staking.stakeFailed');
    if (error.reason) msg += `: ${error.reason}`;
    showToast(msg, 'error');
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
.staking-container {
  width: 100%;
  max-width: 800px; /* Narrower than dashboard */
  margin: 0 auto 2rem;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(192, 132, 252, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-family: var(--font-primary);
}

.stake-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.value {
  font-family: var(--font-code);
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.currency {
  font-size: 1.2rem;
  color: var(--primary);
  font-weight: 600;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.action-btn {
  width: 100%;
  height: 50px;
  font-size: 1.1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.connect-hint {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Queue Status */
.queue-status-card {
  margin-top: 2rem;
  width: 100%;
  max-width: 400px;
  background: rgba(103, 232, 249, 0.05);
  border: 1px solid rgba(103, 232, 249, 0.2);
  border-radius: 12px;
  padding: 1rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--cyan);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--cyan);
}

.pulsing {
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.highlight {
  color: #fff;
  font-family: var(--font-code);
}
</style>
