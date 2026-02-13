<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content glass">
      <div class="modal-header">
        <h3 class="modal-title" v-if="!walletState.isConnected">{{ t('wallet.connectTitle') || 'Connect Wallet' }}</h3>
        <h3 class="modal-title" v-else>{{ t('wallet.connectedTitle') || 'Connected' }}</h3>
        <button @click="close" class="close-button" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Not Connected View -->
        <div v-if="!walletState.isConnected">
          <p class="connect-subtitle">{{ t('wallet.connectSubtitle') || 'Select your wallet to continue' }}</p>
          
          <div class="wallet-list" v-if="availableWallets.length > 0">
            <button v-for="wallet in availableWallets" 
                    :key="wallet.id"
                    class="wallet-option-btn" 
                    @click.prevent="handleConnect(wallet.id)">
              <div class="wallet-info">
                  <img :src="getWalletIcon(wallet.id)" :alt="wallet.name" class="wallet-icon" :class="{ 'wallet-icon-white': wallet.id === 'okx' }">
                  <span class="wallet-name">{{ wallet.name }}</span>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </button>
          </div>
          <div v-else class="no-wallet-view">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ t('wallet.noWalletDetected') || 'No wallet detected' }}</p>
          </div>
        </div>

        <!-- Connected View -->
        <div v-else class="connected-view">
          <div class="wallet-status-card">
              <div class="status-indicator">
                  <span class="status-dot"></span>
                  <span>Active</span>
              </div>
              <div class="wallet-avatar">
                  <i class="fas fa-user-astronaut"></i>
              </div>
          </div>
          
          <div class="info-group">
            <div class="info-item">
              <span class="info-label">{{ t('wallet.address') || 'Address' }}</span>
              <span class="info-value font-code">{{ formattedAddress }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('wallet.network') || 'Network' }}</span>
              <span class="info-value">{{ uppercaseNetwork }}</span>
            </div>
          </div>
          
          <button @click.prevent="handleDisconnect" class="disconnect-btn">
              <i class="fas fa-sign-out-alt"></i>
              {{ t('wallet.disconnect') || 'Disconnect' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { walletState, connectWallet, disconnectWallet, detectWallets } from '@/services/wallet.js';
import { t } from '@/i18n';

export default {
  name: 'ConnectWalletModal',
  setup(props, { emit }) {
    const availableWallets = ref([]);

    const getWalletIcon = (walletId) => {
        const icons = {
            metamask: '/asset/images/wallet/MetaMask-icon-fox-with-margins.svg',
            tokenpocket: '/asset/images/wallet/tp-logo.png',
            okx: '/asset/images/wallet/okx-logo.png',
            binance: '/asset/images/wallet/binance-logo.png',
        };
        return icons[walletId] || '/asset/images/wallet/default-icon.png';
    };

    const close = () => {
      emit('close');
    };

    const handleConnect = async (walletType) => {
      const success = await connectWallet(walletType);
      if (success) {
        close();
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
      close();
    };
    
    onMounted(() => {
      availableWallets.value = detectWallets();
    });

    return {
      walletState,
      availableWallets,
      getWalletIcon,
      handleConnect,
      handleDisconnect,
      close,
      t,
    };
  },
  computed: {
    formattedAddress() {
      if (!this.walletState.address) return '';
      return `${this.walletState.address.substring(0, 6)}...${this.walletState.address.substring(this.walletState.address.length - 4)}`;
    },
    uppercaseNetwork() {
      return this.walletState.network ? this.walletState.network.toUpperCase() : '';
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(2, 6, 23, 0.8); /* var(--bg-darker) opacity */
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 420px;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
}

.modal-title {
  margin: 0;
  font-family: var(--font-primary);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  background: var(--bg-card);
}

.connect-subtitle {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
}

.wallet-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.wallet-option-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition);
}

.wallet-option-btn:hover {
    border-color: var(--primary);
    background: var(--bg-hover);
    transform: translateX(4px);
}

.wallet-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.wallet-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}

.wallet-icon-white {
    background: white;
    padding: 2px;
}

.wallet-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
}

.arrow-icon {
    color: var(--text-muted);
    font-size: 0.8rem;
}

.no-wallet-view {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.no-wallet-view i {
    font-size: 3rem;
    color: var(--text-muted);
    opacity: 0.5;
}

/* Connected View Styles */
.wallet-status-card {
    background: var(--gradient-1);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    color: white;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,0,0,0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 8px #4ade80;
}

.wallet-avatar i {
    font-size: 2.5rem;
    opacity: 0.9;
}

.info-group {
    background: var(--bg-dark);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0 1rem;
    margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border);
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-value {
    color: var(--text-primary);
    font-weight: 600;
}

.font-code {
    font-family: var(--font-code);
    color: var(--primary);
}

.disconnect-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.disconnect-btn:hover {
    background: rgba(239, 68, 68, 0.1);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
