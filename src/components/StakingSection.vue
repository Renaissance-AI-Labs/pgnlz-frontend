<template>
  <div class="staking-container glass">
    <h2 class="section-title text-gradient">{{ t('staking.title') }}</h2>
    <p class="staking-footer-text">
        {{ t('staking.description') }}
    </p>
    <div class="stake-card">
      <div class="amount-display">
        <!-- <span class="label">{{ t('staking.amountLabel') }}</span> -->
        
        <!-- Amount Selection Buttons -->
        <div v-if="allowedAmounts.length > 0" class="amount-selection">
            <button 
                v-for="(amount, index) in allowedAmounts" 
                :key="index"
                class="amount-btn"
                :class="{ active: rawFixedAmount === amount }"
                @click="selectAmount(amount)"
            >
                <span class="amount-value">{{ formatAmount(amount) }}</span>
                <span class="amount-currency">USDT</span>
            </button>
        </div>
      </div>

      <div class="action-area">
        <div v-if="!walletState.isConnected" class="connect-hint">
          {{ t('team.inputPlaceholder.connectWallet') }}
        </div>
        
        <template v-else>
          <!-- Bind Referrer Hint Button -->
          <button 
            v-if="!isBound && !checkingReferrer" 
            class="btn btn-primary action-btn"
            @click="$router.push('/team?tab=team')"
          >
            {{ t('staking.bindReferrerFirst') }}
          </button>

          <!-- Approve Button -->
          <button 
            v-else-if="needsApproval" 
            class="btn btn-primary action-btn"
            :disabled="loading || processing || checkingReferrer"
            @click="handleApprove"
          >
            <span v-if="processing" class="spinner"></span>
            {{ processing ? t('staking.approving') : t('staking.approve') }}
          </button>

          <!-- Stake Button -->
          <button 
            v-else 
            class="btn btn-primary action-btn"
            :disabled="loading || processing || insufficientBalance || checkingReferrer"
            @click="handleStake"
          >
            <span v-if="processing" class="spinner"></span>
            <template v-else>
                {{ insufficientBalance ? t('staking.insufficientBalance') : t('staking.stake') }}
            </template>
          </button>
        </template>
        
      </div>

      <!-- Queue Status Compact -->
      <!-- <div v-if="queueStatus" class="queue-status-compact">
        <div class="status-ticker">
            <span class="status-dot pulsing"></span>
            <span class="status-label">{{ t('staking.queueTitle') }}:</span>
            <span class="status-value highlight">#{{ queueStatus.position }}</span>
            <span class="divider">|</span>
            <span class="status-value">{{ t('staking.waitDays') }} ~{{ queueStatus.estimatedWaitDays }}{{ t('staking.days') }}</span>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ethers } from 'ethers';
import { t } from '@/i18n';
import { walletState, networks } from '@/services/wallet';
import { getContractAddress } from '@/services/contracts';
import { APP_ENV } from '@/services/environment';
import referralAbi from '@/abis/referral.json';
import StakingABI from '@/abis/staking.json';
import StakingViewABI from '@/abis/stakingView.json';
import { showToast } from '@/services/notification';

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const fixedAmount = ref('100'); // Display value
const rawFixedAmount = ref(BigInt(0)); // BigInt value from contract
const currentAllowance = ref(BigInt(0)); // Current allowance from contract
const allowedAmounts = ref([]); // List of allowed stake amounts
const loading = ref(false);
const processing = ref(false);
const userBalance = ref(BigInt(0));
const queueStatus = ref(null);
const isBound = ref(false); // New state for referrer check
const checkingReferrer = ref(false); // Loading state for referrer check

const needsApproval = computed(() => {
  if (currentAllowance.value === BigInt(0) && rawFixedAmount.value === BigInt(0)) return false;
  return currentAllowance.value < rawFixedAmount.value;
});

const insufficientBalance = computed(() => {
  if (rawFixedAmount.value === BigInt(0)) return false;
  return userBalance.value < rawFixedAmount.value;
});

const selectAmount = (amount) => {
    rawFixedAmount.value = amount;
    fixedAmount.value = ethers.formatEther(amount).split('.')[0];
};

const formatAmount = (amount) => {
    return ethers.formatEther(amount).split('.')[0];
};

const updateData = async () => {
  if (!walletState.isConnected || !walletState.address) {
      // If not connected, we can still fetch fixedStakeAmount from a read-only provider
      // But for now, let's just reset
      currentAllowance.value = BigInt(0);
      return;
  }
  
  loading.value = true;
  checkingReferrer.value = true;
  try {
    let provider = walletState.provider;
    let signer = walletState.signer;
    const userAddress = walletState.address || ethers.ZeroAddress; 

    // Read-only fallback if not connected
    if (!provider) {
       const isProduction = APP_ENV === 'PROD';
       const rpcUrl = isProduction ? networks.bscMainnet.rpcUrls[0] : networks.bscTestnet.rpcUrls[0];
       provider = new ethers.JsonRpcProvider(rpcUrl);
       // Signer is null in read-only
       signer = null;
    }

    const stakingAddress = getContractAddress('Staking');
    const stakingViewAddress = getContractAddress('StakingView');
    const usdtAddress = getContractAddress('USDT');
    const referralAddress = getContractAddress('referral');

    if (!stakingAddress || !usdtAddress || !referralAddress) return;

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);
    const stakingViewContract = new ethers.Contract(stakingViewAddress, StakingViewABI, provider);
    
    // 1. Get Allowed Stake Amounts (Read-only)
    const amounts = [];
    let index = 0;
    try {
        while (true) {
            try {
                // Try to fetch amount at index
                const amount = await stakingContract.allowedStakeAmounts(index);
                // Check if amount is 0 (some contracts return 0 for out of bounds instead of reverting, though unlikely for public array getter)
                // But usually public getter reverts if out of bounds.
                amounts.push(amount);
                index++;
                if (index > 20) break; // Safety break
            } catch (e) {
                // Assuming revert means end of array
                break;
            }
        }
    } catch (e) {
        console.warn("Error fetching allowed amounts", e);
    }

    if (amounts.length > 0) {
        allowedAmounts.value = amounts;
        // Default to first amount if current amount is 0 or not in list
        const currentInList = amounts.find(a => a === rawFixedAmount.value);
        if (!currentInList) {
            selectAmount(amounts[0]);
        }
    } else {
        // Fallback to fixedStakeAmount if no allowed amounts found (backward compatibility)
        try {
            const amount = await stakingContract.fixedStakeAmount();
            allowedAmounts.value = [amount];
            selectAmount(amount);
        } catch (e) {
            console.warn("Fallback fixedStakeAmount failed", e);
        }
    }

    // Only proceed with user-specific checks if we have a valid user address
    if (walletState.isConnected && userAddress) {
        const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, provider);
        const referralContract = new ethers.Contract(referralAddress, referralAbi, provider);

        // 2. Check Balance
        const balance = await usdtContract.balanceOf(userAddress);
        userBalance.value = balance;

        // 3. Check Allowance
        const allowance = await usdtContract.allowance(userAddress, stakingAddress);
        currentAllowance.value = allowance;

        // 4. Check Queue Status
        await checkQueueStatus(stakingContract, stakingViewContract, userAddress);

        // 5. Check Referrer Bind Status
        try {
            const referrer = await referralContract.getReferral(userAddress);
            isBound.value = (referrer && referrer !== ethers.ZeroAddress);
            console.log("Referrer check for", userAddress, ":", referrer, "Bound:", isBound.value);
        } catch (e) {
            console.error("Failed to check referrer:", e);
            isBound.value = false; // Safe default
        }

    } else {
        // Reset user state if not connected
        userBalance.value = BigInt(0);
        currentAllowance.value = BigInt(0);
        queueStatus.value = null;
        isBound.value = false;
    }

  } catch (error) {
    console.error("Error updating staking data:", error);
  } finally {
    loading.value = false;
    checkingReferrer.value = false;
  }
};

const checkQueueStatus = async (stakingContract, stakingViewContract, userAddress) => {
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
            
            const posInfo = await stakingViewContract.getQueuePositionInfo(userAddress, index);
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
    
    // Update allowance immediately to reflect change in UI
    currentAllowance.value = rawFixedAmount.value; 
    // Optionally refresh real data
    // await updateData();
  } catch (error) {
    console.error(error);
    // ACTION_REJECTED code is 4001 or 'ACTION_REJECTED'
    if (error.code === 4001 || error.code === 'ACTION_REJECTED' || (error.reason && error.reason.includes('rejected'))) {
       // User rejected, no toast needed
       return;
    }
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
    const usdtAddress = getContractAddress('USDT');
    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    
    // Call stake() - with amount
    // Logging for debug
    console.log('--- Staking Info ---');
    console.log('Staking Contract:', stakingAddress);
    console.log('USDT Contract:', usdtAddress);
    console.log("Staking initiated for amount:", fixedAmount.value, "(Raw:", rawFixedAmount.value.toString(), ")");
    console.log('--------------------');
    const tx = await stakingContract.stake(rawFixedAmount.value);
    await tx.wait();
    
    showToast(t('staking.stakeSuccess'), 'success');
    
    // Refresh data
    await updateData();
    
    // Reload page after success
    setTimeout(() => {
        window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error(error);
    // User rejected check
    if (error.code === 4001 || error.code === 'ACTION_REJECTED' || (error.reason && error.reason.includes('rejected'))) {
       return;
    }

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
  max-width: 600px; /* Reduced width for compactness */
  margin: 0 auto 1rem;
  padding: 1.2rem;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(192, 132, 252, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  font-family: var(--font-primary);
  letter-spacing: 0.05em;
  font-weight: 700;
  opacity: 0.9;
}

.stake-card {
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.amount-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.amount-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.6rem;
  width: 100%;
  margin: 0.5rem 0;
}

.amount-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  padding: 0.6rem 0.4rem;
  border-radius: 10px;
  font-family: var(--font-code);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  min-height: 50px;
}

.amount-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.amount-btn.active {
  background: rgba(139, 92, 246, 0.15);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}

.amount-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.amount-currency {
  font-size: 0.65rem;
  opacity: 0.7;
  letter-spacing: 0.05em;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.action-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.connect-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 0.5rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Compact Queue Status */
.queue-status-compact {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-ticker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--cyan);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--cyan);
}

.pulsing {
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
}

.status-label {
    font-weight: 500;
}

.divider {
    color: rgba(255,255,255,0.1);
    margin: 0 0.2rem;
}

.highlight {
  color: var(--cyan);
  font-family: var(--font-code);
  font-weight: 600;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .staking-container {
    padding: 1rem;
    margin: 1rem 0rem;
    width: auto;
  }

  .stake-card {
    padding: 0.8rem;
  }
  
  .action-btn {
    height: 44px;
    font-size: 0.95rem;
  }
  
  .amount-selection {
      grid-template-columns: repeat(3, 1fr); /* Force 3 columns on mobile */
  }
}

.staking-footer-text {
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
    color: #fff;
    text-align: center;
    opacity: 0.8;
}
</style>