<template>
  <div class="orders-container">
    
    <!-- Tabs -->
    <div class="tabs">
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 0 }" 
            @click="switchTab(0)"
        >
            {{ t('orders.tab.queued') }}
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 1 }" 
            @click="switchTab(1)"
        >
            {{ t('orders.tab.processing') }}
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 2 }" 
            @click="switchTab(2)"
        >
            {{ t('orders.tab.claimable') }}
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 3 }" 
            @click="switchTab(3)"
        >
            {{ t('orders.tab.completed') }}
        </button>
    </div>

    <div v-if="!walletState.isConnected" class="connect-hint">
        {{ t('team.inputPlaceholder.connectWallet') }}
    </div>

    <div v-else class="orders-list">
        <div v-if="loading && orders.length === 0" class="loading-state">
            <span class="spinner"></span> {{ t('orders.loading') }}
        </div>
        
        <div v-else-if="orders.length === 0" class="empty-state">
            {{ t('orders.empty') }}
        </div>

        <div v-else class="order-items">
            <div v-for="order in orders" :key="order.id" class="order-card">
                <!-- Header: ID + Status -->
                <div class="order-header">
                    <div class="header-left">
                        <span class="order-id">#{{ Number(order.id) + 1 }}</span>
                        <span class="order-amount">{{ formatAmount(order.amount) }}<span class="unit">USDT</span></span>
                    </div>
                    <div class="header-right">
                        <span class="order-date">{{ formatDateShort(order.stakeTime) }}</span>
                        <span class="status-badge" :class="{ queued: order.isQueued, completed: activeTab === 3, claimable: activeTab === 2 }">
                            {{ getStatusLabel(order) }}
                        </span>
                    </div>
                </div>

                <!-- Queued View -->
                <div v-if="order.isQueued" class="queue-wrapper">
                    <div class="queued-details">
                        <div class="detail-row">
                            <span class="label">{{ t('orders.queue.position') }}:</span>
                            <span class="value">{{ order.queuePosition !== undefined ? order.queuePosition : '-' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">{{ t('orders.queue.amountAhead') }}:</span>
                            <span class="value">{{ order.queueAmountAhead || '-' }} USDT</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">{{ t('orders.queue.wait') }}:</span>
                            <span class="value">{{ order.queueWait !== undefined ? order.queueWait : '-' }} {{ t('orders.queue.days') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Active/Claimable/Completed View (Not Queued) -->
                <div class="active-details">
                    
                    <!-- Stats Grid -->
                    <div class="stats-grid-compact" v-if="activeTab !== 0">
                         <div class="stat-item">
                            <span class="label">{{ t('orders.col.earnings') }}</span>
                            <span class="value">{{ formatAmount(order.totalReceivedUsdt) }}</span>
                         </div>
                         <div class="stat-item">
                            <span class="label">{{ t('orders.col.pending') }}</span>
                            <span class="value highlight">
                                +{{ formatAmount(order.pendingStaticUsdt) }}
                                <span class="token-equiv">({{ formatAmount(order.pendingTokenAmount) }})</span>
                            </span>
                         </div>
                    </div>

                    <!-- Progress Bars (Compact) -->
                    <div class="progress-container">
                        <!-- Out Progress -->
                        <div class="progress-row">
                             <div class="progress-info">
                                <span class="p-label">{{ t('orders.progress.out') }}</span>
                                <span class="p-value">{{ order.outValue }} / {{ order.outTarget }} U</span>
                             </div>
                             <div class="progress-bar custom-out">
                                <div class="progress-fill" :style="{ width: order.outProgress + '%' }"></div>
                             </div>
                        </div>

                        <!-- Recovery Progress (New) -->
                        <div class="progress-row">
                             <div class="progress-info">
                                <span class="p-label">{{ t('orders.progress.recovery') }}</span>
                                <span class="p-value">
                                    {{ order.recoveryValue }} / {{ order.recoveryTarget }} U
                                </span>
                             </div>
                             <div class="progress-bar custom-recovery">
                                <div class="progress-fill" :style="{ width: order.recoveryProgress + '%' }"></div>
                             </div>
                        </div>

                        <!-- Time Progress -->
                        <div class="progress-row">
                             <div class="progress-info">
                                <span class="p-label">{{ t('orders.progress.time') }}</span>
                                <span class="p-value">{{ order.timeValue }} / {{ order.timeTarget }} {{ t('orders.queue.days') }}</span>
                             </div>
                             <div class="progress-bar secondary">
                                <div class="progress-fill" :style="{ width: order.timeProgress + '%' }"></div>
                             </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="actions-compact" v-if="activeTab === 0 || activeTab === 1 || activeTab === 2">
                        <!-- Harvest Button: Show for Running (1) and Claimable (2) -->
                        <button 
                            v-if="activeTab === 1 || activeTab === 2"
                            class="btn-icon btn-harvest" 
                            @click="harvest(order.id)" 
                            :disabled="processing || !canHarvest(order)"
                            :title="t('orders.btn.harvest')"
                        >
                            <!-- <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> -->
                            {{ t('orders.btn.harvest') }}
                        </button>
                        
                        <!-- Unstake Button: Show for Running (1) only? Or Queued (0)? Queued is handled above. 
                             Usually unstake is only for Running/Queued. 
                             Claimable/Completed orders are closed/claimable.
                        -->
                        <button 
                            v-if="(activeTab === 1) && order.isUnstakeable"
                            class="btn-icon btn-unstake" 
                            @click="openUnstakeModal(order)"
                            :disabled="processing"
                            :title="t('orders.btn.unstake')"
                        >
                            <!-- <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> -->
                            {{ t('orders.btn.unstake') }}
                        </button>
                    </div>
                </div>

            </div>

             <button v-if="hasMore" class="load-more-btn" @click="loadMore" :disabled="loading">
                <span v-if="loading" class="spinner small"></span>
                {{ loading ? t('orders.loading') : t('orders.loadMore') }}
            </button>
        </div>
    </div>
    <div v-if="showUnstakeModal" class="modal-overlay">
        <div class="modal-content glass">
            <h3 class="modal-title">{{ t('orders.modal.unstakeTitle') }}</h3>
            <p class="modal-desc">{{ t('orders.confirmUnstake', { amount: unstakeRefundAmount }) }}</p>
            <div class="modal-actions">
                <button class="btn btn-danger-outline" @click="confirmUnstake">
                    {{ t('orders.modal.confirm') }}
                </button>
                <button class="btn btn-primary" @click="closeUnstakeModal">
                    {{ t('orders.modal.cancel') }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { ethers } from 'ethers';
import { t } from '@/i18n';
import { walletState } from '@/services/wallet';
import { getContractAddress } from '@/services/contracts';
import StakingABI from '@/abis/staking.json';
import StakingViewABI from '@/abis/stakingView.json';
import { showToast } from '@/services/notification';

const props = defineProps({});

const activeTab = ref(0); // 0: Queued, 1: Running, 2: Claimable, 3: Completed
const orders = ref([]);
const loading = ref(false);
const processing = ref(false);
const hasMore = ref(false);
const fetchBatchSize = 20;
const nextCursor = ref(BigInt(0));
const globalRate = ref(BigInt(100)); // Default 1%
const counts = reactive({
    0: 0,
    1: 0,
    2: 0,
    3: 0
});

// Modal State
const showUnstakeModal = ref(false);
const selectedUnstakeId = ref(null);
const unstakeRefundAmount = ref('0');

// Helper to format Date
const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatDateShort = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${m}/${d} ${h}:${min}`;
};

// Helper to format BigInt to string with 2 decimals
const formatAmount = (amount) => {
    if (!amount) return '0.00';
    const val = ethers.formatEther(amount);
    const parts = val.split('.');
    if (parts.length > 1) {
        return parts[0] + '.' + parts[1].substring(0, 2);
    }
    return parts[0] + '.00';
};

const getStatusLabel = (order) => {
    if (activeTab.value === 3) return t('orders.status.completed');
    if (activeTab.value === 2) return t('orders.status.claimable');
    return order.isQueued ? t('orders.status.queued') : t('orders.status.earning');
};

const canHarvest = (order) => {
    try {
        return BigInt(order.pendingStaticUsdt) > BigInt(0);
    } catch (e) {
        return false;
    }
};

const switchTab = (tab) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    // Reset and fetch
    orders.value = [];
    nextCursor.value = BigInt(0);
    hasMore.value = false;
    fetchOrders(tab, true);
};

const fetchCounts = async () => {
    if (!walletState.isConnected || !walletState.address) return;
    try {
        const provider = walletState.provider;
        const stakingAddress = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);

        const [c0, c1, c2, c3] = await Promise.all([
            stakingContract.getUserRecordCount(walletState.address, 0),
            stakingContract.getUserRecordCount(walletState.address, 1),
            stakingContract.getUserRecordCount(walletState.address, 2),
            stakingContract.getUserRecordCount(walletState.address, 3)
        ]);

        counts[0] = Number(c0);
        counts[1] = Number(c1);
        counts[2] = Number(c2);
        counts[3] = Number(c3);
    } catch (e) {
        console.warn("Failed to fetch counts", e);
    }
};

const fetchOrders = async (status, isReset = false) => {
    if (!walletState.isConnected || !walletState.address) return;
    
    loading.value = true;
    
    // Also fetch counts when fetching orders (or at least on first load/reset)
    if (isReset) fetchCounts();

    try {
        const provider = walletState.provider;
        const stakingAddress = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);
        
        const stakingViewAddress = getContractAddress('StakingView');
        const stakingViewContract = new ethers.Contract(stakingViewAddress, StakingViewABI, provider);
        
        let spd = BigInt(86400);
        let sd = BigInt(100 * 86400);

        // Fetch global rate and config
        try {
            const [rateVal, spdVal, sdVal] = await Promise.all([
                stakingContract.rate(),
                stakingContract.SECONDS_PER_DAY(),
                stakingContract.stakeDuration()
            ]);
            globalRate.value = rateVal;
            spd = spdVal;
            sd = sdVal;
        } catch (e) {
            console.warn("Failed to fetch contract config, using defaults", e);
        }

        // getUserRecordInfos(user, cursor, limit, status)
        const result = await stakingContract.getUserRecordInfos(
            walletState.address,
            nextCursor.value,
            fetchBatchSize,
            status
        );
        
        const records = result[0];
        console.log('Raw records:', records);
        const newCursor = result[1];

        // Process records
        const processed = await Promise.all(records.map(async (item) => {
            const r = item.record;
            
            // Basic data
            const order = {
                id: item.id.toString(),
                amount: r.amount,
                stakeTime: Number(r.stakeTime),
                isQueued: r.isQueued,
                status: r.status,
                totalReceivedUsdt: r.totalStaticUsdt,
                pendingStaticUsdt: item.pendingStaticUsdt,
                pendingTokenAmount: item.pendingTokenAmount,
                guaranteeUsdt: item.guaranteeUsdt,
                isUnstakeable: item.isUnstakeable,
                refundUsdt: item.refundUsdt,
                
                // For UI state
                queuePosition: undefined,
                queueAmountAhead: undefined,
                queueWait: undefined,
                outProgress: 0,
                timeProgress: 0
            };
            
            // Logic for Queued
            if (order.isQueued) {
                try {
                    const qInfo = await stakingViewContract.getQueuePositionInfo(walletState.address, order.id);
                    if (qInfo[0]) {
                        order.queuePosition = Number(qInfo[1]);
                        order.queueAmountAhead = formatAmount(qInfo[2]);
                        order.queueWait = Number(qInfo[3]);
                    }
                } catch (e) {
                    console.warn("Failed to get queue info for order", order.id);
                }
            }

            // Logic for In Progress (1), Claimable (2), Completed (3), AND Queued (0) - Common Stats
            // Out Progress (3x)
            // Need total received + pending static
            const totalCurrent = BigInt(item.totalReceivedUsdt);
            // Target = Amount * 3 (Simplification based on prompt)
            const target = BigInt(r.amount) * BigInt(3);
            
            // Store values for UI
            order.outValue = formatAmount(totalCurrent);
            order.outTarget = formatAmount(target);
            
            if (target > BigInt(0)) {
                const prog = (totalCurrent * BigInt(100)) / target;
                order.outProgress = Number(prog);
                if (order.outProgress > 100) order.outProgress = 100;
            }

            // Recovery Progress (New)
            // Logic: Current = totalReceivedUsdt, Target = guaranteeUsdt
            
            const currentRecovery = BigInt(item.totalReceivedUsdt);
            const targetRecovery = BigInt(item.guaranteeUsdt);
            
            order.recoveryValue = formatAmount(currentRecovery > targetRecovery ? targetRecovery : currentRecovery);
            order.recoveryTarget = formatAmount(targetRecovery);
            
            if (targetRecovery > BigInt(0)) {
                const recProg = (currentRecovery * BigInt(100)) / targetRecovery;
                order.recoveryProgress = Number(recProg);
                if (order.recoveryProgress > 100) order.recoveryProgress = 100;
            } else {
                order.recoveryProgress = 0;
            }
            
            // Time Progress
            // (now - stakeTime) / SECONDS_PER_DAY
            const now = Math.floor(Date.now() / 1000);
            const elapsed = now - order.stakeTime;
            const duration = Number(sd); // stakeDuration in seconds
            const secondsPerDayVal = Number(spd); // SECONDS_PER_DAY
            
            // Store values for UI
            const daysPassed = Math.floor(elapsed / secondsPerDayVal);
            const totalDays = Math.floor(duration / secondsPerDayVal);
            
            order.timeValue = daysPassed > totalDays ? totalDays : daysPassed;
            order.timeTarget = totalDays;

            if (duration > 0) {
                    const tProg = (elapsed * 100) / duration;
                    order.timeProgress = Math.floor(tProg);
                    if (order.timeProgress > 100) order.timeProgress = 100;
            }
            
            return order;
        }));
        
        console.log('Processed orders:', processed);

        if (isReset) {
            orders.value = processed;
        } else {
            orders.value = [...orders.value, ...processed];
        }

        // Update cursor and hasMore
        if (newCursor > BigInt(0)) {
             nextCursor.value = newCursor;
             hasMore.value = true;
        } else {
             nextCursor.value = BigInt(0);
             hasMore.value = false;
        }
        
    } catch (e) {
        console.error("Fetch orders error:", e);
    } finally {
        loading.value = false;
    }
};

const loadMore = () => {
    if (loading.value) return;
    fetchOrders(activeTab.value);
};

const harvest = async (id) => {
    if (processing.value) return;
    processing.value = true;
    try {
        const signer = walletState.signer;
        const stakingAddress = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
        
        const tx = await stakingContract.harvest([id]);
        await tx.wait();
        
        showToast(t('orders.harvestSuccess'), 'success');
        // Refresh
        orders.value = [];
        nextCursor.value = BigInt(0);
        fetchOrders(activeTab.value, true);
        fetchCounts(); // Update counts
    } catch (e) {
        console.error(e);
        showToast(t('orders.error'), 'error');
    } finally {
        processing.value = false;
    }
};

const openUnstakeModal = (order) => {
    selectedUnstakeId.value = order.id;
    unstakeRefundAmount.value = formatAmount(order.refundUsdt);
    showUnstakeModal.value = true;
};

const closeUnstakeModal = () => {
    showUnstakeModal.value = false;
    selectedUnstakeId.value = null;
};

const confirmUnstake = async () => {
    if (processing.value || !selectedUnstakeId.value) return;
    
    const id = selectedUnstakeId.value;
    showUnstakeModal.value = false;
    
    processing.value = true;
    try {
        const signer = walletState.signer;
        const stakingAddress = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
        
        const tx = await stakingContract.unstake([id]);
        await tx.wait();
        
        showToast(t('orders.unstakeSuccess'), 'success');
        // Refresh
        orders.value = [];
        nextCursor.value = BigInt(0);
        fetchOrders(activeTab.value, true);
        fetchCounts(); // Update counts
    } catch (e) {
        console.error(e);
        // User rejected
        if (e.code === 4001 || e.code === 'ACTION_REJECTED') return;
        
        showToast(t('orders.error'), 'error');
    } finally {
        processing.value = false;
        selectedUnstakeId.value = null;
    }
};

onMounted(() => {
    if (walletState.isConnected) {
        fetchOrders(0, true);
    }
});

watch(() => walletState.isConnected, (newVal) => {
    if (newVal) {
        orders.value = [];
        nextCursor.value = BigInt(0);
        hasMore.value = false;
        fetchOrders(0, true);
    } else {
        orders.value = [];
    }
});

</script>

<style scoped>
.orders-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-family: var(--font-primary);
  letter-spacing: 0.05em;
}

.tabs {
    display: flex;
    gap: 0rem;
    margin-bottom: 1.5rem;
    background: rgba(255,255,255,0.05);
    padding: 0.3rem;
    border-radius: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.tab-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    line-height: normal;
    display: flex;
    align-items: center;
    gap: 4px;
}

.tab-btn.active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.tab-count {
    font-size: 0.8em;
    opacity: 0.8;
}

.connect-hint {
    color: var(--text-muted);
    padding: 2rem;
}

.orders-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.empty-state {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-secondary);
}

.order-card {
    background: rgba(15, 16, 45, 0.974);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    display: flex;
    flex-direction: column;
    /* gap: 0.8rem; */
    transition: all 0.2s ease;
    margin-bottom: 8px;
}

.order-card:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(192, 132, 252, 0.2);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 0.5rem;
}

.header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.order-id {
    background: rgba(255,255,255,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    color: var(--text-secondary);
    font-family: var(--font-code);
}

.order-amount {
    font-family: var(--font-code);
    font-weight: 700;
    color: var(--cyan);
    font-size: 1.1rem;
    display: flex;
    align-items: baseline;
}

.unit {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-left: 3px;
    font-weight: 400;
}

.order-date {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: var(--font-code);
    letter-spacing: -0.5px; /* 省略空间 */
}

@media (max-width: 480px) {
    .header-left, .header-right {
        gap: 0.4rem;
    }
    
    .order-amount {
        font-size: 1rem;
    }
    
    .status-badge {
        padding: 0.1rem 0.4rem;
    }
}

.status-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
    font-weight: 600;
    line-height: normal;
}

.status-badge.queued {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.2);
}

.status-badge.claimable {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.2);
}

.status-badge.completed {
    background: rgba(100, 116, 139, 0.15);
    color: #94a3b8;
    border-color: rgba(100, 116, 139, 0.2);
}

/* Compact Stats Grid */
.stats-grid {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

.stats-grid-compact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    background: rgba(0,0,0,0.2);
    padding: 0.6rem;
    border-radius: 8px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
}

.stat-item .label {
    font-size: 0.65rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.stat-item .value {
    font-family: var(--font-code);
    font-size: 0.85rem;
    color: #e2e8f0;
    font-weight: 600;
}

.highlight {
    color: var(--cyan) !important;
}

.token-equiv {
    font-size: 0.7em;
    color: var(--text-secondary);
    font-weight: 400;
    margin-left: 2px;
}

/* Progress Container */
.progress-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.6rem 0.2rem;
}

.progress-row {
    display: flex;
    flex-direction: column;
    gap: 0rem;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 0.1rem;
}

.p-label {
    color: var(--text-secondary);
}

.p-value {
    color: var(--text-primary);
    font-family: var(--font-code);
    font-weight: 500;
}

.progress-bar {
    height: 8px;
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--gradient-1);
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.progress-bar.custom-out .progress-fill {
    background: #c084fc; 
    box-shadow: none;
}

.progress-bar.custom-recovery .progress-fill {
    background: #d96767; 
    box-shadow: none;
}

.progress-bar.secondary .progress-fill {
    background: var(--cyan);
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

/* Actions Compact */
.actions-compact {
    display: flex;
    gap: 0.6rem;
}

.btn-icon {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.5rem;
    border-radius: 8px;
    border: none;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-harvest {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
    line-height: normal;
}

.btn-harvest:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
}

.btn-harvest:disabled {
    background: rgba(139, 92, 246, 0.3);
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
}

.btn-unstake {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    line-height: normal;
}

.btn-unstake:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #f87171;
}

.btn-unstake:disabled {
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    background: transparent;
    cursor: not-allowed;
    transform: none;
}


/* Queued Details */
.queued-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    background: rgba(245, 158, 11, 0.05);
    padding: .6rem .6rem 0.2rem .6rem;
    border-radius: 8px;
    border: 1px dashed rgba(245, 158, 11, 0.2);
}

.detail-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
}

.detail-row .label {
    font-size: 0.65rem;
}

.detail-row .value {
    font-size: 0.85rem;
}


.load-more-btn {
    background: #00000030;
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--text-secondary);
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    margin: 0 auto;
    line-height: normal;
}

.load-more-btn:hover {
    background: rgba(255,255,255,0.05);
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner.small {
    width: 14px;
    height: 14px;
    border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .queued-details {
        grid-template-columns: 1fr;
        gap: 0.8rem;
        display: flex;
        justify-content: space-between;
    }
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    padding: 1rem;
}

.modal-content {
    background: #0f172a;
    border: 1px solid rgba(192, 132, 252, 0.2);
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    font-family: var(--font-primary);
}

.modal-desc {
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    width: 100%;
    gap: 1rem;
}

.modal-actions .btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn-primary {
    background: var(--primary);
    color: #fff;
    border: none;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.btn-danger-outline {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
}

.btn-danger-outline:hover {
    background: rgba(239, 68, 68, 0.1);
}
.mt-2 {
    margin-top: 0.8rem;
}

.queue-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.8rem;
}
</style>