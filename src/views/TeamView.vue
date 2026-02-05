<template>
  <div class="team-page">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles-team"></div>
    </div>

    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title" :data-text="t('team.pageTitle')">{{ t('team.pageTitle') }}</h2>
        <p class="page-intro">
          {{ t('team.intro') }}
        </p>
      </div>

      <div class="right-section">
        <div class="team-container">
          <!-- Tabs Navigation -->
          <div class="tabs-nav">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'friends' }" 
              @click="activeTab = 'friends'"
            >
              {{ t('team.tab.myFriends') }}
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'team' }" 
              @click="activeTab = 'team'"
            >
              {{ t('team.tab.myReferrals') }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            
            <!-- Tab 1: My Friends (Previously My Team - List of children) -->
            <div v-if="activeTab === 'friends'" class="team-tab fade-in">
              <div class="stats-card">
                <div class="stat-item">
                  <span class="label">{{ t('team.friendsCount') }}</span>
                  <span class="value">{{ referralCount }} <span class="unit">{{ t('team.peopleUnit') }}</span></span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="label">{{ t('team.teamCount') }}</span>
                  <span class="value">{{ teamCount }} <span class="unit">{{ t('team.peopleUnit') }}</span></span>
                </div>
              </div>

              <div class="children-list-container">
                <div class="list-header">
                  <span>{{ t('team.friendsList') }}</span>
                </div>
                
                <div v-if="childrenList.length === 0 && !loadingChildren" class="empty-state">
                  {{ t('team.noFriends') }}
                </div>

                <div class="children-list">
                  <div v-for="(child, index) in childrenList" :key="index" class="child-item">
                    <span class="index">#{{ index + 1 }}</span>
                    <span class="address">{{ formatAddress(child) }}</span>
                    <!-- <div class="copy-icon" @click="copyText(child)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </div> -->
                  </div>
                </div>

                <div v-if="loadingChildren" class="loading-state">
                  <div class="spinner"></div> {{ t('team.loading') }}
                </div>

                <button 
                  v-if="hasMoreChildren && !loadingChildren" 
                  class="load-more-btn"
                  @click="loadChildren(false)"
                >
                  {{ t('team.loadMore') }}
                </button>
              </div>
            </div>

            <!-- Tab 2: My Referral (Previously My Friends - Bind & Link) -->
            <div v-if="activeTab === 'team'" class="friends-tab fade-in">
              
              <!-- Section: My Referral Link -->
              <div class="friend-section">
                <h3 class="section-title">{{ t('team.myReferralLink') }}</h3>
                <p class="section-desc">{{ t('team.referralLinkDesc') }}</p>
                <div class="input-box">
                  <input type="text" :value="myReferralLink" readonly class="code-input" :class="{ 'disabled': !isBound || !walletState.isConnected }" />
                  <button 
                    class="btn-copy" 
                    @click="copyText(myReferralLink)"
                    :disabled="!walletState.isConnected || !isBound"
                  >
                    {{ t('team.copy') }}
                  </button>
                </div>
              </div>

              <!-- <div class="divider-horizontal"></div> -->

              <!-- Section: My Referrer -->
              <div class="friend-section">
                <h3 class="section-title">{{ t('team.myReferrer') }}</h3>
                <p class="section-desc" v-if="!isBound">{{ t('team.bindReferrerDesc') }}</p>
                <p class="section-desc success-text" v-else>{{ t('team.bindSuccessDesc') }}</p>

                <div class="input-box">
                  <input 
                    type="text" 
                    :value="isBound ? formatAddress(referrerInput) : referrerInput" 
                    readonly 
                    :placeholder="walletState.isConnected ? t('team.inputPlaceholder.autoFill') : t('team.inputPlaceholder.connectWallet')"
                    class="code-input disabled"
                  />
                  <button 
                    v-if="!isBound"
                    class="btn-bind" 
                    @click="handleBindReferral"
                    :disabled="bindingReferrer || !walletState.isConnected || !referrerInput"
                  >
                    <span v-if="bindingReferrer">{{ t('team.binding') }}</span>
                    <span v-else>{{ t('team.bind') }}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>

    <!-- Confirm Modal -->
    <transition name="modal">
      <div v-if="isConfirmModalVisible" class="modal-mask">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ t('team.modal.bindTitle') }}</h3>
          </div>
          <div class="modal-body">
            <p class="warning-text">{{ t('team.modal.warning') }}</p>
            <div class="confirm-address">{{ confirmAddress }}</div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeConfirmModal">{{ t('team.modal.cancel') }}</button>
            <button 
              class="modal-btn confirm" 
              :disabled="confirmCountdown > 0"
              @click="executeBind"
            >
              {{ confirmCountdown > 0 ? `${t('team.modal.confirm')} (${confirmCountdown}s)` : t('team.modal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { walletState, formatAddress } from '@/services/wallet.js';
import { getContractAddress } from '@/services/contracts.js';
import { showToast } from '@/services/notification.js';
import { onMounted, ref, computed, watch } from 'vue';
import { ethers } from 'ethers';
import referralAbi from '@/abis/referral.json';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';
import { useRoute } from 'vue-router'; // We might need router for query params, but window.location is safer without router setup check
import { t } from '@/i18n/index.js';

export default {
  name: 'TeamView',
  components: {
    ConnectWalletModal
  },
  setup() {
    // --- State ---
    const isModalVisible = ref(false);
    const activeTab = ref('friends'); // Default to 'friends' (which is now the list view)
    
    // Data State
    const referralCount = ref(0);
    const teamCount = ref(0);
    const childrenList = ref([]);
    const childrenCursor = ref(0);
    const loadingChildren = ref(false);
    const hasMoreChildren = ref(false);
    const pageSize = 10;

    // Friends Tab State
    const referrerInput = ref('');
    const isBound = ref(false);
    const bindingReferrer = ref(false);
    
    // Confirm Modal State
    const isConfirmModalVisible = ref(false);
    const confirmCountdown = ref(10);
    const confirmTimer = ref(null);
    const confirmAddress = ref('');

    // --- Computed ---
    const myReferralLink = computed(() => {
      if (!walletState.address) return t('team.inputPlaceholder.connectWallet');
      if (!isBound.value) return t('team.link.bindFirst'); // Logic added: Show hint when not bound
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?ref=${walletState.address}`;
    });

    // --- Methods ---
    const openModal = () => isModalVisible.value = true;
    const closeModal = () => isModalVisible.value = false;

    // Get Contract Instance
    const getReferralContract = () => {
      if (!walletState.signer) return null;
      const address = getContractAddress('referral');
      if (!address) return null;
      return new ethers.Contract(address, referralAbi, walletState.signer);
    };

    const getReferralContractReadOnly = async () => {
        // If wallet not connected, use provider if available, or just return null
        // For 'read' operations we can use provider.
        if (!walletState.provider && !window.ethereum) return null;
        
        let provider = walletState.provider;
        if (!provider) {
             provider = new ethers.BrowserProvider(window.ethereum);
        }
        
        const address = getContractAddress('referral');
        if (!address) return null;
        return new ethers.Contract(address, referralAbi, provider);
    };


    // 1. Fetch Referral Data (Count & Check Bind Status)
    const fetchReferralData = async () => {
      if (!walletState.address) return;

      try {
        const contract = await getReferralContractReadOnly(); // Can use read-only for checks
        if (!contract) return;

        // Get Count
        const count = await contract.getReferralCount(walletState.address);
        referralCount.value = count.toString();

        // Get Team Count
        const tCount = await contract.getTeamCount(walletState.address);
        teamCount.value = tCount.toString();

        // Get Current Referrer
        const referrer = await contract.getReferral(walletState.address);
        
        if (referrer && referrer !== ethers.ZeroAddress) {
          isBound.value = true;
          referrerInput.value = referrer;
        } else {
          isBound.value = false;
          // Only if not bound, we check URL param (on init)
          checkUrlParam(); 
        }

        // Refresh list
        loadChildren(true);

      } catch (error) {
        console.error("Error fetching referral data:", error);
      }
    };

    // 2. Check URL for ref param
    const checkUrlParam = () => {
       if (isBound.value) return; // Don't overwrite if already bound
       
       const urlParams = new URLSearchParams(window.location.search);
       const refParam = urlParams.get('ref');
       
       if (!walletState.isConnected) {
           referrerInput.value = ''; // 未连接钱包时，始终清空，不预填充
           return;
       }

       if (refParam && ethers.isAddress(refParam)) {
           // Prevent self-ref in input if connected
           if (walletState.address && refParam.toLowerCase() === walletState.address.toLowerCase()) {
               console.log("Self-referral detected in URL, ignoring.");
               referrerInput.value = '';
               return;
           }
           referrerInput.value = refParam;
       }
    };

    // 3. Load Children (Pagination)
    const loadChildren = async (reset = false) => {
      if (!walletState.address) return;
      
      const contract = await getReferralContractReadOnly();
      if (!contract) return;

      if (reset) {
        childrenCursor.value = 0;
        childrenList.value = [];
        hasMoreChildren.value = true; // reset assumption
      }

      if (!hasMoreChildren.value && !reset) return;

      loadingChildren.value = true;
      try {
        // getChildren(address referrer, uint256 cursor, uint256 size)
        // returns (address[] memory, uint256 newCursor)
        const result = await contract.getChildren(
            walletState.address, 
            childrenCursor.value, 
            pageSize
        );

        const newChildren = result[0]; // array
        const newCursor = result[1];   // uint

        if (newChildren && newChildren.length > 0) {
            // Filter out empty addresses if any (solidity static array return might include empty if not careful, but dynamic array should be fine)
            const validChildren = newChildren.filter(addr => addr !== ethers.ZeroAddress);
            childrenList.value = [...childrenList.value, ...validChildren];
            childrenCursor.value = Number(newCursor);
            
            if (newChildren.length < pageSize) {
                hasMoreChildren.value = false;
            }
        } else {
            hasMoreChildren.value = false;
        }

      } catch (error) {
        console.error("Error loading children:", error);
        hasMoreChildren.value = false;
      } finally {
        loadingChildren.value = false;
      }
    };

    const closeConfirmModal = () => {
      isConfirmModalVisible.value = false;
      if (confirmTimer.value) clearInterval(confirmTimer.value);
    };

    const startConfirmCountdown = () => {
      confirmCountdown.value = 10;
      if (confirmTimer.value) clearInterval(confirmTimer.value);
      confirmTimer.value = setInterval(() => {
        if (confirmCountdown.value > 0) {
          confirmCountdown.value--;
        } else {
          clearInterval(confirmTimer.value);
        }
      }, 1000);
    };

    // 4. Bind Referrer
    const handleBindReferral = async () => {
        if (!walletState.isConnected) {
            openModal();
            return;
        }

        const inputAddress = referrerInput.value.trim();
        const currentAccount = walletState.address;

        // Validation
        if (!inputAddress || inputAddress === ethers.ZeroAddress) {
            showToast(t('team.toast.invalidAddress'));
            return;
        }

        if (!ethers.isAddress(inputAddress)) {
            showToast(t('team.toast.formatError'));
            return;
        }

        if (inputAddress.toLowerCase() === currentAccount.toLowerCase()) {
            showToast(t('team.toast.selfBindError'));
            return;
        }
        
        // Show Confirm Modal
        confirmAddress.value = inputAddress;
        isConfirmModalVisible.value = true;
        startConfirmCountdown();
    };

    const executeBind = async () => {
        closeConfirmModal();
        bindingReferrer.value = true;
        const inputAddress = confirmAddress.value;

        try {
            const contract = getReferralContract();
            if (!contract) throw new Error("Contract not initialized");

            // Check if referrer is valid (must be bound themselves)
            // Call isBindReferral(address)
            const isValidReferrer = await contract.isBindReferral(inputAddress);
            
            if (!isValidReferrer) {
                showToast(t('team.toast.referrerNotJoined'));
                bindingReferrer.value = false;
                return;
            }

            // Bind
            const tx = await contract.bindReferral(inputAddress);
            showToast(t('team.toast.txSubmitted'));
            
            await tx.wait();
            
            showToast(t('team.toast.bindSuccess'));
            isBound.value = true;
            
            // Refresh data
            fetchReferralData();

        } catch (error) {
            console.error("Binding failed:", error);
            if (error.reason) {
                 showToast(t('team.toast.bindFailed') + error.reason);
            } else if (error.message && error.message.includes("User already has a referral")) {
                 showToast(t('team.toast.alreadyBound'));
            } else {
                 showToast(t('team.toast.checkNetwork'));
            }
        } finally {
            bindingReferrer.value = false;
        }
    };

    // Helper: Copy
    const copyText = async (text) => {
        // Updated check to use keys or check against t() output
        // It's safer to just check if text is a valid copyable string.
        // If it equals the placeholder "Please connect wallet" etc., don't copy.
        if (!text || text === t('team.inputPlaceholder.connectWallet') || text === t('team.link.bindFirst')) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast(t('team.toast.copySuccess'));
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast(t('team.toast.copyFailed'));
        }
    };

    // Watchers
    watch(() => [walletState.isConnected, walletState.address], ([newConnected, newAddress], [oldConnected, oldAddress]) => {
        // If disconnected
        if (!newConnected) {
            referralCount.value = 0;
            teamCount.value = 0;
            childrenList.value = [];
            childrenCursor.value = 0;
            hasMoreChildren.value = false;
            isBound.value = false;
            referrerInput.value = ''; // Ensure input is cleared
            checkUrlParam(); // Re-check URL param after disconnect. If ref param exists, fill it; otherwise keep empty
            return;
        }

        // If connection state changes or address changes
        if (newConnected && newAddress) {
            // If just address changed, or just connected, re-fetch
             if (newAddress !== oldAddress || !oldConnected) {
                // Reset list state
                childrenList.value = [];
                childrenCursor.value = 0;
                hasMoreChildren.value = false;
                
                // Re-fetch data
                fetchReferralData();
             }
        }
    });

    onMounted(() => {
        // Init particles
        const particlesContainer = document.getElementById('particles-team');
        if (particlesContainer && particlesContainer.childElementCount === 0) {
            const codeSymbols = ['{', '}', '[', ']', '(', ')', '<', '>', '/', '*', '=', '+', '-', ';', ':', '&', '|', '%', '$', '#', '@'];
            const particleCount = 20;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (10 + Math.random() * 10) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Check param for Tab Switching
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('ref')) {
            activeTab.value = 'team'; // 'team' key now corresponds to "我的推荐" (Bind & Link)
        }

        // Init Data
        if (walletState.isConnected) {
            fetchReferralData();
        } else {
            checkUrlParam();
        }
    });

    return {
      t,
      walletState,
      formatAddress,
      isModalVisible,
      openModal,
      closeModal,
      activeTab,
      referralCount,
      teamCount,
      childrenList,
      loadingChildren,
      hasMoreChildren,
      loadChildren,
      myReferralLink,
      referrerInput,
      isBound,
      bindingReferrer,
      handleBindReferral,
      copyText,
      // Confirm Modal
      isConfirmModalVisible,
      confirmCountdown,
      closeConfirmModal,
      executeBind,
      confirmAddress
    };
  }
}
</script>

<style scoped>
/* Modal Styles (Matches ConnectWalletModal theme) */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 90%;
  max-width: 400px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(192, 132, 252, 0.2);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start; /* Align content to left */
  text-align: left; /* Align text to left */
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.2rem;
  text-align: left; /* Align title to left */
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
  width: 100%;
}

.warning-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.confirm-address {
  font-family: var(--font-code);
  color: var(--primary);
  font-size: 0.95rem;
  background: rgba(192, 132, 252, 0.1);
  padding: 10px;
  border-radius: 8px;
  word-break: break-all;
  border: 1px solid rgba(192, 132, 252, 0.2);
  width: 100%; /* Ensure address box takes full width */
  box-sizing: border-box; /* Include padding */
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  line-height: normal;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.modal-btn.confirm {
  background: var(--primary);
  color: #000;
}

.modal-btn.confirm:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
}

.modal-btn.confirm:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.team-page {
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.page-content {
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Ensure overall content (including title) aligns left */
  gap: 2rem;
}

/* Header Styles */
.header-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Ensure title text aligns left */
  text-align: left;
  gap: 1rem;
}

.page-title {
  font-family: var(--font-code);
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-align: left;
  position: relative;
  text-shadow: 
    0 0 20px rgba(192, 132, 252, 0.6);
  letter-spacing: -1px;
  line-height: 1;
  background: linear-gradient(135deg, #fff 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-intro {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: left;
  max-width: 480px;
  line-height: 1.6;
  margin: 0;
  padding: 0 0 0 10px;
  font-weight: 400;
  border-left: 3px solid var(--primary);
  opacity: 0.9;
}

/* Right Section & Tabs */
.right-section {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.team-container {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  /* border: 1px solid rgba(192, 132, 252, 0.1); */
  border-radius: 24px;
  padding: 1.5rem 0;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
}

.tabs-nav {
  display: flex;
  gap: 0; /* Remove gap to make them touch if needed, or keep small gap */
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0; /* Move border to bottom of buttons */
}

.tab-btn {
  flex: 1; /* Make tabs take full width */
  text-align: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-code);
  font-size: 1rem;
  padding: 1rem 0.5rem; /* Increase vertical padding */
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-bottom: 2px solid transparent; /* Prepare for active state */
  margin-bottom: -1px; /* Overlap the container border */
}

.tab-btn.active {
  color: #fff;
  font-weight: 700;
  border-bottom-color: var(--primary);
}

.tab-btn.active::after {
  /* Remove old after pseudo-element style */
  display: none; 
}

.tab-btn:hover {
  color: #fff;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

/* Stats Card */
.stats-card {
  background: rgba(192, 132, 252, 0.05);
  border: 1px solid rgba(192, 132, 252, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem; /* Decrease vertical padding */
  display: flex;
  justify-content: space-around; /* Distribute items evenly */
  align-items: center;
  margin-bottom: 1rem; /* Decrease bottom margin */
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

.stats-card .label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stats-card .value {
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.8rem;
  font-weight: 700;
}

.stats-card .unit {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Children List */
.children-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-header {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  font-style: italic;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  transition: background 0.2s;
}

.child-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.child-item .index {
  color: var(--text-muted);
  font-size: 0.8rem;
  width: 40px;
  font-family: var(--font-code);
}

.child-item .address {
  flex: 1;
  color: var(--text-primary);
  font-family: var(--font-code);
  font-size: 0.95rem;
}

.copy-icon {
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-icon:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.loading-state {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.load-more-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.load-more-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Friends Tab */
.friend-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  color: #fff;
  margin: 0;
}

.section-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: -0.5rem 0 0.5rem;
  line-height: 1.4;
}

.success-text {
  color: #4ade80; /* Green */
}

.input-box {
  display: flex;
  align-items: center; /* Ensure child elements are vertically centered */
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: auto; /* Let content determine height, or set fixed height */
  min-height: 3.5rem; /* Minimum height */
}

.code-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: var(--font-code);
  font-size: 0.95rem;
  padding: 0.5rem;
  outline: none;
  height: 100%;
}

.code-input.disabled {
  color: #fff !important; /* Force white text */
  -webkit-text-fill-color: #fff !important; /* Safari input disabled state compatibility */
  cursor: not-allowed;
  opacity: 1 !important; /* Force opacity */
}

/* Button Common Styles */
.btn-copy,
.btn-bind {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem; /* Fixed height */
  padding: 0 1rem; /* Increase horizontal padding to increase width */
  min-width: 80px; /* Set minimum width */
  border-radius: 10px;
  
  /* Style adjustment: Transparent background, purple border, white text */
  background: transparent;
  border: 2px solid var(--primary); /* Thicken border to 2px */
  color: #fff;
  
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1; /* Explicitly set line-height to 1 or normal to avoid inheritance */
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap; /* Prevent text wrapping */
  line-height: normal;
}

/* Hover Effect */
.btn-copy:hover:not(:disabled),
.btn-bind:hover:not(:disabled) {
  background: rgba(192, 132, 252, 0.1); /* Slight purple background on hover */
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.4);
}

/* Disabled State (Wallet not connected) */
.btn-copy:disabled,
.btn-bind:disabled {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2); /* Gray border */
  border-width: 2px; /* Ensure disabled state border width is also 2px */
  color: rgba(255, 255, 255, 0.4); /* Gray text */
  cursor: not-allowed;
  box-shadow: none;
}

.divider-horizontal {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1.5rem 0;
  width: 100%;
}

.connect-hint {
  font-size: 0.8rem;
  color: #f59e0b; /* Amber */
  background: rgba(245, 158, 11, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Background (Copied from other views) */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.code-grid-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(rgba(192, 132, 252, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(192, 132, 252, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
}

:deep(.particle) {
    position: absolute;
    font-family: var(--font-code);
    font-size: 1.5rem;
    color: var(--primary);
    opacity: 0.1;
    animation: float 15s infinite ease-in-out;
    top: 100%;
}

@keyframes float {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.1; }
    100% { transform: translateY(-120vh) rotate(180deg); opacity: 0; }
}

/* Responsive */
@media (min-width: 1024px) {
  .page-content {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 4rem;
    padding-top: 4rem;
  }

  .header-section {
    width: 40%;
    margin-bottom: 0;
    position: sticky;
    top: 100px;
    padding-top: 2rem;
    align-items: flex-start;
    text-align: left;
  }

  .page-title {
    font-size: 5rem;
    margin-bottom: 2rem;
  }

  .page-intro {
    font-size: 1.2rem;
    max-width: 100%;
  }

  .right-section {
    width: 55%;
    gap: 3rem;
  }
}
</style>
