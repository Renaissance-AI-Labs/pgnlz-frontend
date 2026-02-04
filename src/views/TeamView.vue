<template>
  <div class="team-page">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles-team"></div>
    </div>

    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title" data-text="< 团队 />">&lt; 团队 /&gt;</h2>
        <p class="page-intro">
          加入PGNLZ MAX，共建未来去中心化生态。
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
              我的好友
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'team' }" 
              @click="activeTab = 'team'"
            >
              我的推荐
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            
            <!-- Tab 1: My Friends (Previously My Team - List of children) -->
            <div v-if="activeTab === 'friends'" class="team-tab fade-in">
              <div class="stats-card">
                <span class="label">好友人数</span>
                <span class="value">{{ referralCount }} <span class="unit">人</span></span>
              </div>

              <div class="children-list-container">
                <div class="list-header">
                  <span>好友列表</span>
                </div>
                
                <div v-if="childrenList.length === 0 && !loadingChildren" class="empty-state">
                  暂无好友
                </div>

                <div class="children-list">
                  <div v-for="(child, index) in childrenList" :key="index" class="child-item">
                    <span class="index">#{{ index + 1 }}</span>
                    <span class="address">{{ formatAddress(child) }}</span>
                    <div class="copy-icon" @click="copyText(child)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </div>
                  </div>
                </div>

                <div v-if="loadingChildren" class="loading-state">
                  <div class="spinner"></div> 加载中...
                </div>

                <button 
                  v-if="hasMoreChildren && !loadingChildren" 
                  class="load-more-btn"
                  @click="loadChildren(false)"
                >
                  加载更多
                </button>
              </div>
            </div>

            <!-- Tab 2: My Referral (Previously My Friends - Bind & Link) -->
            <div v-if="activeTab === 'team'" class="friends-tab fade-in">
              
              <!-- Section: My Referral Link -->
              <div class="friend-section">
                <h3 class="section-title">我的邀请链接</h3>
                <p class="section-desc">复制您的专属链接，邀请好友加入。</p>
                <div class="input-box">
                  <input type="text" :value="myReferralLink" readonly class="code-input" :class="{ 'disabled': !isBound || !walletState.isConnected }" />
                  <button 
                    class="btn-copy" 
                    @click="copyText(myReferralLink)"
                    :disabled="!walletState.isConnected || !isBound"
                  >
                    复制
                  </button>
                </div>
              </div>

              <!-- <div class="divider-horizontal"></div> -->

              <!-- Section: My Referrer -->
              <div class="friend-section">
                <h3 class="section-title">我的推荐人</h3>
                <p class="section-desc" v-if="!isBound">绑定推荐人地址，建立互动联系。</p>
                <p class="section-desc success-text" v-else>已成功绑定上级。</p>

                <div class="input-box">
                  <input 
                    type="text" 
                    :value="referrerInput" 
                    readonly 
                    :placeholder="walletState.isConnected ? '请通过邀请链接访问以自动填充' : '请先连接钱包'"
                    class="code-input disabled"
                  />
                  <button 
                    v-if="!isBound"
                    class="btn-bind" 
                    @click="handleBindReferral"
                    :disabled="bindingReferrer || !walletState.isConnected || !referrerInput"
                  >
                    <span v-if="bindingReferrer">绑定中...</span>
                    <span v-else>绑定</span>
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
            <h3>绑定推荐人</h3>
          </div>
          <div class="modal-body">
            <p class="warning-text">请仔细确认推荐人地址，绑定后不可更换。</p>
            <div class="confirm-address">{{ confirmAddress }}</div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeConfirmModal">取消</button>
            <button 
              class="modal-btn confirm" 
              :disabled="confirmCountdown > 0"
              @click="executeBind"
            >
              {{ confirmCountdown > 0 ? `确认 (${confirmCountdown}s)` : '确认' }}
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
      if (!walletState.address) return '请先连接钱包';
      if (!isBound.value) return '绑定推荐人地址后可用'; // 新增逻辑：未绑定时显示提示
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
       
       // 如果没有连接钱包，且有 ref 参数，也应该显示在输入框中（根据需求调整）
       // 根据您的最新反馈“钱包未连接，推荐人输入框不应该还填着地址”，
       // 这里的理解可能是：如果之前填了（比如从绑定状态退出），应该清空。
       // 但如果是通过邀请链接进来的（未连接钱包），通常是希望显示推荐人的。
       // 
       // 如果您的意思是“只有在已连接钱包且未绑定的情况下，才自动填充”，那么修改如下：
       
       if (!walletState.isConnected) {
           referrerInput.value = ''; // 未连接钱包时，始终清空，不预填充
           return;
       }

       if (refParam && ethers.isAddress(refParam)) {
           // Prevent self-ref in input if connected
           // 如果识别到是自己的地址，则不填入
           if (walletState.address && refParam.toLowerCase() === walletState.address.toLowerCase()) {
               console.log("Self-referral detected in URL, ignoring.");
               referrerInput.value = ''; // 清空，或者保持空
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
            showToast("请输入有效的推荐人地址");
            return;
        }

        if (!ethers.isAddress(inputAddress)) {
            showToast("地址格式不正确");
            return;
        }

        if (inputAddress.toLowerCase() === currentAccount.toLowerCase()) {
            showToast("不能绑定自己作为上级");
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
                showToast("无效的推荐人：该地址尚未加入邀请系统");
                bindingReferrer.value = false;
                return;
            }

            // Bind
            const tx = await contract.bindReferral(inputAddress);
            showToast("交易已提交，请等待确认...");
            
            await tx.wait();
            
            showToast("绑定成功！");
            isBound.value = true;
            
            // Refresh data
            fetchReferralData();

        } catch (error) {
            console.error("Binding failed:", error);
            if (error.reason) {
                 showToast("绑定失败: " + error.reason);
            } else if (error.message && error.message.includes("User already has a referral")) {
                 showToast("绑定失败：您已经有上级了");
            } else {
                 showToast("绑定失败，请检查网络或地址");
            }
        } finally {
            bindingReferrer.value = false;
        }
    };

    // Helper: Copy
    const copyText = async (text) => {
        if (!text || text.includes('请先连接钱包') || text.includes('绑定推荐人地址后可用')) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast("已复制到剪贴板");
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast("复制失败");
        }
    };

    // Watchers
    watch(() => [walletState.isConnected, walletState.address], ([newConnected, newAddress], [oldConnected, oldAddress]) => {
        // 如果断开连接
        if (!newConnected) {
            referralCount.value = 0;
            childrenList.value = [];
            childrenCursor.value = 0;
            hasMoreChildren.value = false;
            isBound.value = false;
            referrerInput.value = ''; // 确保清空输入框
            checkUrlParam(); // 断开后重新检查 URL 参数，如果有 ref 参数，则填入；如果没有，则保持空
            return;
        }

        // 如果连接状态改变 或 地址改变
        if (newConnected && newAddress) {
            // 如果只是地址变了，或者刚连接上，都重新获取
             if (newAddress !== oldAddress || !oldConnected) {
                // 重置列表状态
                childrenList.value = [];
                childrenCursor.value = 0;
                hasMoreChildren.value = false;
                
                // 重新获取数据
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
      walletState,
      formatAddress,
      isModalVisible,
      openModal,
      closeModal,
      activeTab,
      referralCount,
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

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.2rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
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
  align-items: flex-start; /* 确保整体内容（包括标题）左对齐 */
  gap: 2rem;
}

/* Header Styles */
.header-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 确保标题文字左对齐 */
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
  padding: 1rem 1.5rem; /* 减少垂直 padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem; /* 减少底部 margin */
}

.stats-card .label {
  color: var(--text-secondary);
  font-size: 1rem;
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
  align-items: center; /* 确保子元素垂直居中 */
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: auto; /* 让内容决定高度，或设置固定高度 */
  min-height: 3.5rem; /* 最小高度 */
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
  color: #fff !important; /* 强制白色文字 */
  -webkit-text-fill-color: #fff !important; /* 兼容 Safari 输入框禁用状态 */
  cursor: not-allowed;
  opacity: 1 !important; /* 强制不透明 */
}

/* 按钮通用样式 */
.btn-copy,
.btn-bind {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem; /* 固定高度 */
  padding: 0 1rem; /* 增加水平 padding 以增加宽度 */
  min-width: 80px; /* 设置最小宽度 */
  border-radius: 10px;
  
  /* 样式调整：透明背景，紫色边框，白色文字 */
  background: transparent;
  border: 2px solid var(--primary); /* 加粗边框至 2px */
  color: #fff;
  
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1; /* 显式设置 line-height 为 1 或 normal，避免继承过大行高 */
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap; /* 防止文字换行 */
  line-height: normal;
}

/* Hover 效果 */
.btn-copy:hover:not(:disabled),
.btn-bind:hover:not(:disabled) {
  background: rgba(192, 132, 252, 0.1); /* 悬停时轻微紫色背景 */
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.4);
}

/* 禁用状态 (未连接钱包) */
.btn-copy:disabled,
.btn-bind:disabled {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2); /* 灰色边框 */
  border-width: 2px; /* 确保禁用状态边框宽度也为 2px */
  color: rgba(255, 255, 255, 0.4); /* 灰色文字 */
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
