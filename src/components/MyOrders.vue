<template>
  <div class="orders-container glass">
    <h2 class="section-title text-gradient">{{ t('orders.title') }}</h2>
    
    <!-- Tabs -->
    <div class="tabs">
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 0 }" 
            @click="switchTab(0)"
        >
            {{ t('orders.tab.processing') }}
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 1 }" 
            @click="switchTab(1)"
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
                        <span v-if="!order.isQueued" class="order-date">{{ formatDate(order.stakeTime) }}</span>
                        <span v-else class="order-amount">{{ formatAmount(order.amount) }} USDT</span>
                    </div>
                    <span class="status-badge" :class="{ queued: order.isQueued, completed: activeTab === 1 }">
                        {{ getStatusLabel(order) }}
                    </span>
                </div>

                <!-- Queued View -->
                <div v-if="order.isQueued" class="queued-details">
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

                <!-- Active View (Not Queued) -->
                <div v-else-if="activeTab === 0" class="active-details">
                    
                    <!-- Stats Grid -->
                    <div class="stats-grid-compact">
                         <div class="stat-item">
                            <span class="label">{{ t('orders.col.earnings') }}</span>
                            <span class="value">{{ formatAmount(order.totalReceivedUsdt) }}</span>
                         </div>
                         <div class="stat-item">
                            <span class="label">Pending</span>
                            <span class="value highlight">+{{ formatAmount(order.pendingStaticUsdt) }}</span>
                         </div>
                         <div class="stat-item">
                             <span class="label">{{ t('orders.col.amount') }}</span>
                             <span class="value">{{ formatAmount(order.amount) }}</span>
                         </div>
                    </div>

                    <!-- Progress Bars (Compact) -->
                    <div class="progress-container">
                        <!-- Out Progress -->
                        <div class="progress-row">
                             <div class="progress-info">
                                <span class="p-label">{{ t('orders.progress.out') }}</span>
                                <span class="p-value">{{ order.outValue }} / {{ order.outTarget }}</span>
                             </div>
                             <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: order.outProgress + '%' }"></div>
                             </div>
                        </div>

                        <!-- Recovery Progress (New) -->
                        <div class="progress-row">
                             <div class="progress-info">
                                <span class="p-label">{{ t('orders.progress.recovery') }}</span>
                                <span class="p-value">
                                    {{ t('orders.roi.recovered') }}: {{ order.recoveryValue }} U / {{ t('orders.roi.guarantee') }}: {{ order.recoveryTarget }} U
                                </span>
                             </div>
                             <div class="progress-bar recovery">
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
                    
                    <div class="actions-compact">
                        <button 
                            class="btn-icon btn-harvest" 
                            @click="harvest(order.id)" 
                            :disabled="processing || !canHarvest(order)"
                            :title="t('orders.btn.harvest')"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            {{ t('orders.btn.harvest') }}
                        </button>
                        <button 
                            v-if="order.isUnstakeable" 
                            class="btn-icon btn-unstake" 
                            @click="openUnstakeModal(order.id)"
                            :disabled="processing"
                            :title="t('orders.btn.unstake')"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            {{ t('orders.btn.unstake') }}
                        </button>
                    </div>
                </div>

                <!-- Completed View -->
                <div v-else class="completed-details">
                     <div class="stats-grid">
                        <div class="stat-item">
                            <span class="label">{{ t('orders.col.earnings') }}</span>
                            <span class="value">{{ formatAmount(order.totalReceivedUsdt) }}</span>
                        </div>
                        <div class="stat-item">
                             <span class="label">Token</span>
                             <span class="value">{{ formatAmount(order.pendingTokenAmount) }}</span>
                        </div>
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
            <p class="modal-desc">{{ t('orders.confirmUnstake') }}</p>
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
import { showToast } from '@/services/notification';

const props = defineProps({});

const activeTab = ref(0); // 0: Processing, 1: Completed
const orders = ref([]);
const loading = ref(false);
const processing = ref(false);
const nextCursor = ref(BigInt(0));
const hasMore = ref(false);
const limit = 10;
const globalRate = ref(BigInt(100)); // Default 1%

// Modal State
const showUnstakeModal = ref(false);
const selectedUnstakeId = ref(null);

// Helper to format Date
const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
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
    if (activeTab.value === 1) return t('orders.status.completed');
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
    fetchOrders(tab, BigInt(0));
};

const fetchOrders = async (status, cursor) => {
    if (!walletState.isConnected || !walletState.address) return;
    
    loading.value = true;
    try {
        const provider = walletState.provider;
        const stakingAddress = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddress, StakingABI, provider);
        
        // Fetch global rate if not already fetched (or fetch every time to be safe)
        try {
            globalRate.value = await stakingContract.rate();
        } catch (e) {
            console.warn("Failed to fetch rate, using default 1%", e);
        }

        // getUserRecordInfos(user, cursor, limit, status)
        const result = await stakingContract.getUserRecordInfos(
            walletState.address,
            cursor,
            limit,
            status
        );
        
        const records = result[0];
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
                totalReceivedUsdt: item.totalReceivedUsdt,
                pendingStaticUsdt: item.pendingStaticUsdt,
                pendingTokenAmount: item.pendingTokenAmount,
                guaranteeUsdt: item.guaranteeUsdt,
                isUnstakeable: item.isUnstakeable,
                
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
                    const qInfo = await stakingContract.getQueuePositionInfo(walletState.address, order.id);
                    if (qInfo[0]) {
                        order.queuePosition = Number(qInfo[1]);
                        order.queueAmountAhead = formatAmount(qInfo[2]);
                        order.queueWait = Number(qInfo[3]);
                    }
                } catch (e) {
                    console.warn("Failed to get queue info for order", order.id);
                }
            } else if (!order.status) {
                // Logic for In Progress (Not Queued)
                
                // Out Progress (3x)
                // Need total received + pending static
                const totalCurrent = BigInt(item.totalReceivedUsdt) + BigInt(item.pendingStaticUsdt);
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
                
                order.recoveryValue = formatAmount(currentRecovery);
                order.recoveryTarget = formatAmount(targetRecovery);
                
                if (targetRecovery > BigInt(0)) {
                    const recProg = (currentRecovery * BigInt(100)) / targetRecovery;
                    order.recoveryProgress = Number(recProg);
                    if (order.recoveryProgress > 100) order.recoveryProgress = 100;
                } else {
                    order.recoveryProgress = 0;
                }
                
                // Time Progress (100 days)
                // (now - stakeTime) / 100 days
                const now = Math.floor(Date.now() / 1000);
                const elapsed = now - order.stakeTime;
                const duration = 100 * 24 * 3600; // 100 days in seconds
                
                // Store values for UI
                const daysPassed = Math.floor(elapsed / (24 * 3600));
                order.timeValue = daysPassed > 100 ? 100 : daysPassed;
                order.timeTarget = 100;

                if (duration > 0) {
                     const tProg = (elapsed * 100) / duration;
                     order.timeProgress = Math.floor(tProg);
                     if (order.timeProgress > 100) order.timeProgress = 100;
                }
            }
            
            return order;
        }));
        
        if (cursor === BigInt(0)) {
            orders.value = processed;
        } else {
            orders.value = [...orders.value, ...processed];
        }
        
        nextCursor.value = newCursor;
        // If result count < limit, probably no more. 
        // Or check if nextCursor is 0 (some contracts use 0 to indicate end, some use same cursor).
        // Based on prompt: "first page 0, next page return nextCursor".
        // Usually if returned records < limit, we are done.
        hasMore.value = records.length === limit;
        
    } catch (e) {
        console.error("Fetch orders error:", e);
    } finally {
        loading.value = false;
    }
};

const loadMore = () => {
    if (loading.value) return;
    fetchOrders(activeTab.value, nextCursor.value);
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
        fetchOrders(activeTab.value, BigInt(0));
    } catch (e) {
        console.error(e);
        showToast(t('orders.error'), 'error');
    } finally {
        processing.value = false;
    }
};

const openUnstakeModal = (id) => {
    selectedUnstakeId.value = id;
    showUnstakeModal.value = true;
};

const closeUnstakeModal = () => {
    showUnstakeModal.value = false;
    selectedUnstakeId.value = null;
};

const confirmUnstake = async () => {
    if (processing.value || !selectedUnstakeId.value) return;
    
    // Close modal first or keep open? Better close or show loading inside.
    // Let's keep modal open but maybe disable buttons if we wanted perfect UI, 
    // but for now let's just close and show toast/loading state.
    // Actually, user might want to see it processing.
    // But simplistic approach: Close modal, set global processing.
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
        fetchOrders(activeTab.value, BigInt(0));
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
        fetchOrders(0, BigInt(0));
    }
});

watch(() => walletState.isConnected, (newVal) => {
    if (newVal) {
        orders.value = [];
        fetchOrders(0, BigInt(0));
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

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background: rgba(255,255,255,0.05);
    padding: 0.3rem;
    border-radius: 10px;
}

.tab-btn {
    padding: 0.5rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    line-height: normal;
}

.tab-btn.active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
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
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
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
    padding-bottom: 0.6rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.order-id {
    color: var(--text-muted);
    font-size: 0.75rem;
    font-family: var(--font-code);
    opacity: 0.7;
}

.order-amount, .order-date {
    font-family: var(--font-code);
    font-weight: 700;
    color: #fff;
    font-size: 1rem;
}

.order-date {
    font-size: 0.9rem;
    color: var(--text-primary);
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

.status-badge.completed {
    background: rgba(100, 116, 139, 0.15);
    color: #94a3b8;
    border-color: rgba(100, 116, 139, 0.2);
}

/* Compact Stats Grid */
.stats-grid-compact {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

.progress-bar.secondary .progress-fill {
    background: var(--cyan);
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

.progress-bar.recovery .progress-fill {
    background: #f59e0b; /* Amber/Orange for recovery/safety */
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
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

/* Queued Details */
.queued-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    background: rgba(245, 158, 11, 0.05);
    padding: 0.6rem;
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
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--text-secondary);
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
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
</style>
