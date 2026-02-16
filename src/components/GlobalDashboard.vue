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
    <div class="progress-section" style="margin-top: 6px;">
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
import StakingViewABI from '@/abis/stakingView.json';

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

const formatDecimal = (val) => {
    try {
        const num = parseFloat(ethers.formatEther(val));
        return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } catch (e) {
        return '0';
    }
};

const formattedDailyQuota = computed(() => {
  if (dailyQuota.value === ethers.MaxUint256) {
    return t('dashboard.unlimited');
  }
  return formatDecimal(dailyQuota.value);
});

const formattedTodayUsed = computed(() => {
  return formatDecimal(queueInfo.value.todayUsedQuota);
});

const formattedRemainingQuota = computed(() => {
  if (dailyQuota.value === ethers.MaxUint256) {
    return t('dashboard.unlimited');
  }
  const remaining = dailyQuota.value - queueInfo.value.todayUsedQuota;
  const val = remaining > BigInt(0) ? remaining : BigInt(0);
  return formatDecimal(val);
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
    const stakingViewAddress = getContractAddress('StakingView');

    if (!stakingAddress) {
      console.warn('Staking contract address not found');
      return;
    }

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);
    const stakingViewContract = new ethers.Contract(stakingViewAddress, StakingViewABI, provider);

    // Fetch Daily Quota
    // Staking.getDailyQuota()
    const quota = await stakingContract.getDailyQuota();
    dailyQuota.value = quota;

    // Fetch Queue Info
    // StakingView.getQueueInfo() -> tuple
    try {
        const info = await stakingViewContract.getQueueInfo();
        console.log("Queue Info:", info);
        // Tuple: [currentDailyQuota, todayUsedQuota, totalQueuedCount, headIndex, tailIndex, nextBatchSize]
        if (info) {
            queueInfo.value = {
                currentDailyQuota: info[0],
                todayUsedQuota: info[1],
                totalQueuedCount: Number(info[2]),
                headIndex: Number(info[3]),
                tailIndex: Number(info[4]),
                nextBatchSize: Number(info[5])
            };
        }
    } catch (e) {
        console.warn("Failed to fetch queue info from StakingView, trying Staking contract fallback if available or ignoring.");
        console.error(e);
    }

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

