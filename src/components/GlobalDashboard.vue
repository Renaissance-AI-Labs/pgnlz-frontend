<template>
  <div class="dashboard-container glass">
    <div class="stats-wrapper">
      <!-- Item 1: Today's Mint Quota -->
      <div class="stat-item">
        <div class="item-label">{{ t('dashboard.dailyQuota') }}</div>
        <div class="item-value highlight-purple">
          {{ formattedDailyQuota }}
        </div>
      </div>

      <!-- Item 2: Today's Used Quota -->
      <div class="stat-item">
        <div class="item-label">{{ t('dashboard.todayUsed') }}</div>
        <div class="item-value highlight-cyan">
          {{ formattedTodayUsed }}
        </div>
      </div>

      <!-- Item 3: Remaining Quota -->
      <div class="stat-item">
        <div class="item-label">{{ t('dashboard.queueCount') }}</div>
        <div class="item-value text-white">
          {{ formattedRemainingQuota }}
        </div>
      </div>

      <!-- Item 4: Queue Head/Tail -->
      <!-- <div class="stat-item full-width-mobile">
        <div class="item-label">{{ t('dashboard.queueRange') }}</div>
        <div class="item-value text-white text-sm">
          <span class="range-val"><span class="label-sub">H:</span>{{ queueInfo.headIndex }}</span>
          <span class="separator">/</span>
          <span class="range-val"><span class="label-sub">T:</span>{{ queueInfo.tailIndex }}</span>
        </div>
      </div> -->
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-info-row">
        <span class="p-title">{{ t('dashboard.progress') }}</span>
        <span class="p-value">{{ formattedTodayUsed }} / {{ formattedDailyQuota }} U</span>
      </div>
    </div>
    <!-- Queue Progress Bar (New) -->
    <div class="progress-section">
      <div class="progress-bar-bg queue-bar-container">
        <!-- Processed Segment -->
        <div 
          class="bar-segment processed" 
          :style="{ width: queueProcessedPct + '%' }"
        ></div>
        <!-- Waiting Segment -->
        <div 
          class="bar-segment waiting" 
          :style="{ width: queueWaitingPct + '%' }"
        ></div>
      </div>
      <div class="progress-info-row">
        <span class="p-title">{{ t('dashboard.queueProgress') }}</span>
        <span class="p-value">
            <span class="legend-dot processed-dot"></span>
            {{ t('dashboard.processed') }} {{ queueInfo.headIndex }} 
            <span class="divider"> </span>
            <span class="legend-dot waiting-dot"></span>
            {{ t('dashboard.currentQueued') }} {{ waitingCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { ethers } from 'ethers';
import { t } from '@/i18n';
import { walletState, networks } from '@/services/wallet';
import { getContractAddress } from '@/services/contracts';
import { APP_ENV } from '@/services/environment';
import StakingABI from '@/abis/staking.json';

const loading = ref(false);
const dailyQuota = ref(BigInt(0));
const queueInfo = ref({
  currentDailyQuota: BigInt(0),
  todayUsedQuota: BigInt(0),
  totalQueuedCount: 0,
  headIndex: 0,
  tailIndex: 0,
  nextBatchSize: 0
});

const waitingCount = computed(() => {
    const val = BigInt(queueInfo.value.tailIndex) - BigInt(queueInfo.value.headIndex);
    return val > 0 ? val : 0;
});

const formattedDailyQuota = computed(() => {
  if (dailyQuota.value === ethers.MaxUint256) {
    return t('dashboard.unlimited');
  }
  return ethers.formatEther(dailyQuota.value);
});

const formattedTodayUsed = computed(() => {
  return ethers.formatEther(queueInfo.value.todayUsedQuota);
});

const formattedRemainingQuota = computed(() => {
  if (dailyQuota.value === ethers.MaxUint256) {
    return t('dashboard.unlimited');
  }
  const remaining = dailyQuota.value - queueInfo.value.todayUsedQuota;
  const val = remaining > BigInt(0) ? remaining : BigInt(0);
  return ethers.formatEther(val);
});

const progressPercentage = computed(() => {
  if (dailyQuota.value === BigInt(0)) return 0;
  if (dailyQuota.value === ethers.MaxUint256) {
    // If unlimited, maybe show a small percentage or 0, or base it on some other metric?
    // For "Unlimited", the concept of progress bar is tricky. 
    // Let's just show 100% or 0%? Or maybe just hide the bar?
    // The requirement says: "Progress bar display: todayUsed / dailyQuota".
    // If max, it effectively is 0% used relative to infinity.
    return 0; 
  }
  
  const used = Number(ethers.formatEther(queueInfo.value.todayUsedQuota));
  const total = Number(ethers.formatEther(dailyQuota.value));
  
  if (total === 0) return 0;
  const pct = (used / total) * 100;
  return Math.min(pct, 100);
});

const queueProcessedPct = computed(() => {
    const head = queueInfo.value.headIndex;
    const tail = queueInfo.value.tailIndex;
    if (tail === 0) return 0;
    if (head >= tail) return 100;
    
    const pct = (head / tail) * 100;
    return Math.min(pct, 100);
});

const queueWaitingPct = computed(() => {
    const head = queueInfo.value.headIndex;
    const tail = queueInfo.value.tailIndex;
    if (tail === 0) return 0;
    
    const waiting = tail - head;
    if (waiting <= 0) return 0;
    
    const pct = (waiting / tail) * 100;
    return Math.min(pct, 100);
});

const fetchData = async () => {
  loading.value = true;
  try {
    // Use wallet provider if available, otherwise fallback to a read-only RPC
    let provider = walletState.provider;
    
    if (!provider) {
       // Fallback for read-only if wallet not connected
       const isProduction = APP_ENV === 'PROD';
       const rpcUrl = isProduction ? networks.bscMainnet.rpcUrls[0] : networks.bscTestnet.rpcUrls[0];
       provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    const stakingAddress = getContractAddress('Staking');
    if (!stakingAddress) {
      console.warn('Staking contract address not found');
      return;
    }

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);

    // Fetch Daily Quota
    // Staking.getDailyQuota()
    const quota = await stakingContract.getDailyQuota();
    dailyQuota.value = quota;

    // Fetch Queue Info
    // Staking.getQueueInfo() -> tuple
    const info = await stakingContract.getQueueInfo();
    // Tuple: [currentDailyQuota, todayUsedQuota, totalQueuedCount, headIndex, tailIndex, nextBatchSize]
    queueInfo.value = {
      currentDailyQuota: info[0],
      todayUsedQuota: info[1],
      totalQueuedCount: Number(info[2]),
      headIndex: Number(info[3]),
      tailIndex: Number(info[4]),
      nextBatchSize: Number(info[5])
    };

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Refetch when wallet connects/changes
watch(() => walletState.isConnected, (newVal) => {
  if (newVal) fetchData();
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  padding: 1.2rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(192, 132, 252, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-wrapper {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

.item-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.item-value {
  font-family: var(--font-code);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.1;
}

.highlight-purple {
  color: var(--primary);
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
}

.highlight-cyan {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(103, 232, 249, 0.3);
}

.text-white {
  color: #fff;
}

.text-sm {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.label-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-right: 2px;
}

.separator {
  margin: 0 0.3rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Progress Bar */
.progress-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  /* padding-top: 0.5rem; */
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--cyan));
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
  transition: width 0.5s ease-out;
}

.progress-bar-fill.custom-queue {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.queue-bar-container {
    display: flex;
    background: transparent;
    gap: 4px;
    overflow: visible;
}

.bar-segment {
    height: 100%;
    transition: width 0.5s ease-out;
    border-radius: 999px;
}

.bar-segment.processed {
    background: linear-gradient(90deg, #10b981, #34d399); /* Green/Emerald */
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.bar-segment.waiting {
    background: linear-gradient(90deg, #f59e0b, #fbbf24); /* Amber/Orange */
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

.legend-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
    margin-bottom: 1px;
}

.processed-dot {
    background-color: #34d399;
    box-shadow: 0 0 4px rgba(52, 211, 153, 0.6);
}

.waiting-dot {
    background-color: #fbbf24;
    box-shadow: 0 0 4px rgba(251, 191, 36, 0.6);
}

.divider {
    margin: 0 6px;
    opacity: 0.3;
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.3rem;
  font-size: 0.75rem;
}

.p-title {
  color: var(--text-secondary);
}

.p-value {
  color: var(--text-muted);
  font-family: var(--font-code);
  text-align: right;
}

.progress-text {
  display: none; /* Hide old text class */
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 0.8rem;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .stats-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0 0.2rem;
  }

  .stat-item.full-width-mobile {
    grid-column: 1 / -1;
    flex-direction: row;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 0.4rem;
    margin-top: 0.2rem;
    gap: 0.8rem;
  }

  .stat-item.full-width-mobile .item-label {
    margin-bottom: 0;
    margin-right: 0.5rem;
  }
  
  .item-label {
    font-size: 0.7rem;
    transform: scale(0.9); /* Visual scale down for extra tightness */
  }

  .item-value {
    font-size: 1rem;
  }

  .text-sm {
    font-size: 0.9rem;
  }
  
  .progress-section {
    /* padding-top: 0.4rem; */
  }
  
  .progress-text {
    font-size: 0.65rem;
  }
}
</style>
