<template>
  <div class="nft-page">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles-nft"></div>
    </div>

    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title" :data-text="t('nft.pageTitle')">{{ t('nft.pageTitle') }}</h2>
        <p class="page-intro">
          {{ t('nft.intro') }}
        </p>
      </div>

      <div class="right-section">
        <div class="nft-showcase">
          <div class="nft-card-wrapper">
            <div class="nft-card-container">
              <div class="nft-card">
                <img src="/asset/images/nft/pgnlz-node.png" alt="Exclusive NFT" class="nft-image">
                <div class="card-reflection"></div>
              </div>
              <div class="nft-shadow"></div>
            </div>
          </div>
          
          <div class="nft-showcase-info">
            <div class="showcase-header">{{ t('nft.myNodeNft') }}</div>
            
            <div class="nft-balance-info" v-if="walletState.isConnected">
              <span class="balance-label">{{ t('nft.currentHolding') }}</span>
              <span class="balance-value">{{ nftBalance }}</span>
            </div>
          </div>
        </div>

        <!-- NFT System List -->
        <div class="nft-list-section" v-if="walletState.isConnected">
          <div class="section-header">
            <h3>{{ t('nft.systemNodes') }}</h3>
            <button 
              class="harvest-all-btn" 
              :class="{ 'activate-mode': !isLoading && !hasRewards }"
              @click="handleHarvestAll" 
              :disabled="isLoading"
            >
              {{ isLoading ? t('nft.loading') : (hasRewards ? t('nft.harvestAll') : t('nft.howToActivate')) }}
            </button>
          </div>
          
          <div class="nft-grid-container">
            <div v-if="isLoading && nftList.length === 0" class="loading-state">
              {{ t('nft.loading') }}
            </div>
            <div v-else-if="nftList.length === 0" class="empty-state">
              {{ t('nft.noNfts') }}
            </div>
            <div v-else class="nft-grid-list">
               <!-- Header (PC Only) -->
               <div class="grid-header">
                 <div class="col-id">{{ t('nft.id') }}</div>
                 <div class="col-level">{{ t('nft.level') }}</div>
                 <div class="col-rewards">{{ t('nft.rewards') }}</div>
                 <div class="col-status">{{ t('nft.status') }}</div>
               </div>
               
               <!-- Items -->
               <div class="grid-item" v-for="nft in nftList" :key="nft.id">
                 <div class="item-main">
                   <div class="col-id">
                     <span class="mobile-label">{{ t('nft.id') }}</span>
                     <span class="value">#{{ nft.id }}</span>
                   </div>
                   <div class="col-level">
                     <span class="mobile-label">{{ t('nft.level') }}</span>
                     <span class="value">LV.{{ nft.level }}</span>
                   </div>
                 </div>
                 
                 <div class="item-rewards col-rewards">
                   <span class="mobile-label">{{ t('nft.rewards') }}</span>
                   <div class="reward-list">
                      <div v-for="(amount, symbol) in nft.rewards" :key="symbol" class="reward-tag">
                        <span class="amount">{{ formatReward(amount) }}</span>
                        <span class="symbol">{{ symbol }}</span>
                      </div>
                      <div v-if="Object.keys(nft.rewards).length === 0" class="no-rewards">-</div>
                   </div>
                 </div>
                 
                 <div class="item-status col-status">
                    <button 
                      v-if="nft.needsReactivation" 
                      @click="handleReactivate(nft.id)" 
                      class="action-btn reactivate-btn"
                      :disabled="isActionProcessing"
                    >
                      {{ t('nft.reactivate') }} (500 U)
                    </button>
                    <div v-else class="status-badge active">
                      <span class="dot"></span>
                      {{ t('nft.active') }}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
        
        <div class="coming-soon-section" v-else>
           <p class="connect-hint">{{ t('lp.connectWallet') }}</p>
        </div>
      </div>
    </div>

    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>

    <!-- Activation Requirements Modal -->
    <transition name="modal">
      <div v-if="isActivationModalVisible" class="modal-overlay" @click.self="closeActivationModal">
        <div class="modal-content activation-modal">
          <div class="modal-header">
            <h3>{{ t('nft.activationRequirements') }}</h3>
            <button class="close-btn" @click="closeActivationModal">&times;</button>
          </div>
          
          <div class="modal-body">
            <!-- Progress Bar 1: Direct Referrals -->
            <div class="progress-item">
              <div class="progress-label">
                <span>{{ t('nft.directReferrals') }}</span>
                <span class="progress-values">
                    <span class="current">{{ activationStats.directReferrals }}</span> / <span class="target">{{ activationStats.requiredDirectReferrals }}</span>
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: calculateProgress(activationStats.directReferrals, activationStats.requiredDirectReferrals) + '%' }"></div>
              </div>
            </div>

            <!-- Progress Bar 2: Team Performance -->
            <div class="progress-item">
              <div class="progress-label">
                <span>{{ t('nft.teamPerformance') }}</span>
                <span class="progress-values">
                    <span class="current">{{ formatNumber(activationStats.teamPerformance) }}</span> / <span class="target">{{ formatNumber(activationStats.requiredTeamPerformance) }}</span>
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: calculateProgress(activationStats.teamPerformance, activationStats.requiredTeamPerformance) + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="confirm-btn" @click="closeActivationModal">{{ t('nft.confirm') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { walletState } from '@/services/wallet.js';
import { getContractAddress } from '@/services/contracts.js';
import { showToast } from '@/services/notification.js';
import { onMounted, ref, watch, computed } from 'vue';
import { ethers } from 'ethers';
import nodeNFTAbi from '@/abis/nodeNFT.json';
import nodePoolAbi from '@/abis/nodePool.json';
import stakingAbi from '@/abis/staking.json';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';
import { t } from '@/i18n/index.js';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)"
];

export default {
  name: 'NftView',
  components: {
    ConnectWalletModal
  },
  setup() {
    const nftBalance = ref(0);
    const isModalVisible = ref(false);
    const nftList = ref([]);
    const isLoading = ref(false);
    const isActionProcessing = ref(false);
    const rewardCap = ref(0);
    const canReactivate = ref(false);
    
    // Activation Modal State
    const isActivationModalVisible = ref(false);
    const activationStats = ref({
      directReferrals: 0,
      requiredDirectReferrals: 0,
      teamPerformance: 0,
      requiredTeamPerformance: 0
    });
    
    // Token info
    const tokenSymbols = ref({}); 

    const openModal = () => {
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };
    
    const openActivationModal = async () => {
      isActivationModalVisible.value = true;
      try {
        const stakingAddr = getContractAddress('Staking');
        const stakingContract = new ethers.Contract(stakingAddr, stakingAbi, walletState.signer);
        
        // Fetch data in parallel
        const [
            directRefs,
            reqDirectRefs,
            teamPerf,
            reqTeamPerf
        ] = await Promise.all([
            stakingContract.validDirectReferralsCount(walletState.address),
            stakingContract.reactivateDirectReferrals(),
            stakingContract.teamTotalInvestValue(walletState.address),
            stakingContract.reactivateTeamPerformance()
        ]);

        activationStats.value = {
            directReferrals: Number(directRefs),
            requiredDirectReferrals: Number(reqDirectRefs),
            teamPerformance: parseFloat(ethers.formatUnits(teamPerf, 18)), 
            requiredTeamPerformance: parseFloat(ethers.formatUnits(reqTeamPerf, 18))
        };
      } catch (e) {
        console.error("Failed to fetch activation stats", e);
      }
    };

    const closeActivationModal = () => {
      isActivationModalVisible.value = false;
    };
    
    const calculateProgress = (current, target) => {
      if (!target || target === 0) return 100;
      return Math.min((current / target) * 100, 100);
    };
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    };

    const fetchBalance = async () => {
      if (!walletState.isConnected || !walletState.signer || !walletState.address) {
        nftBalance.value = 0;
        nftList.value = [];
        return;
      }

      try {
        const contractAddress = getContractAddress('nodeNFT');
        const contract = new ethers.Contract(contractAddress, nodeNFTAbi, walletState.signer);
        const balance = await contract.balanceOf(walletState.address);
        nftBalance.value = balance.toString();
        console.log('NFT Balance fetched:', balance.toString());
        
        if (balance > 0) {
          await fetchNftList();
        }
      } catch (error) {
        console.error('Failed to fetch NFT balance:', error);
        nftBalance.value = 0;
      }
    };

    const fetchNftList = async () => {
      isLoading.value = true;
      try {
        const nftContractAddr = getContractAddress('nodeNFT');
        const nodePoolAddr = getContractAddress('NodePool');
        const stakingAddr = getContractAddress('Staking');
        const pgnlzAddr = getContractAddress('PGNLZ');
        const usdtAddr = getContractAddress('USDT');

        const nftContract = new ethers.Contract(nftContractAddr, nodeNFTAbi, walletState.signer);
        const nodePoolContract = new ethers.Contract(nodePoolAddr, nodePoolAbi, walletState.signer);
        const stakingContract = new ethers.Contract(stakingAddr, stakingAbi, walletState.signer);

        // 1. Get My NFTs
        // Assuming reasonably small number, fetch all in one batch with size 100
        const result = await nftContract.levelsOfOwnerBySize(walletState.address, 0, 100);
        // Result is [NftInfo[], nextCursor]
        const nfts = result[0];
        
        if (nfts.length === 0) {
          nftList.value = [];
          isLoading.value = false;
          return;
        }

        const nftIds = nfts.map(n => n.id);
        
        // 2. Get Supported Tokens and Reward Cap
        const supportedTokens = await nodePoolContract.getSupportedTokens();
        const cap = await nodePoolContract.rewardCap();
        rewardCap.value = cap;

        // Initialize token symbols if not cached (simplified: map known addresses)
        // In production, might want to fetch symbol() from contract
        tokenSymbols.value[pgnlzAddr] = 'PGNLZ';
        tokenSymbols.value[usdtAddr] = 'USDT';
        // For others, just use address or fetch
        
        // 3. Batch Get Rewards
        const rewardsMap = {}; // nftId -> { symbol: amount }
        
        // Initialize map
        nftIds.forEach(id => {
          rewardsMap[id] = {};
        });

        // Fetch rewards for each token
        for (const tokenAddr of supportedTokens) {
            try {
                const amounts = await nodePoolContract.getTokenRewardsBatch(nftIds, tokenAddr);
                const symbol = tokenSymbols.value[tokenAddr] || 'Unknown';
                
                nftIds.forEach((id, index) => {
                    const amount = amounts[index];
                    if (amount > 0) {
                        rewardsMap[id][symbol] = amount;
                    }
                });
            } catch (err) {
                console.error(`Failed to fetch rewards for token ${tokenAddr}`, err);
            }
        }

        // 4. Check Reactivation Status
        const canUserReactivate = await stakingContract.checkReactivate(walletState.address);
        canReactivate.value = canUserReactivate;

        const list = [];
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            const harvested = await nodePoolContract.nftCycleHarvested(nft.id);
            const needsReactivation = harvested >= cap; // && canUserReactivate? Logic says show button if cap reached
            
            list.push({
                id: nft.id.toString(),
                level: nft.level.toString(),
                rewards: rewardsMap[nft.id] || {},
                needsReactivation: needsReactivation,
                harvested: harvested
            });
        }
        
        nftList.value = list;

      } catch (error) {
        console.error('Failed to fetch NFT list:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const handleHarvestAll = async () => {
        if (isActionProcessing.value) return;
        
        if (!hasRewards.value) {
            openActivationModal();
            return;
        }
        
        // Collect all IDs
        const ids = nftList.value.map(n => n.id);
        if (ids.length === 0) return;

        try {
            isActionProcessing.value = true;
            const nodePoolAddr = getContractAddress('NodePool');
            const nodePoolContract = new ethers.Contract(nodePoolAddr, nodePoolAbi, walletState.signer);
            
            const tx = await nodePoolContract.harvestAll(ids);
            alert(t('team.toast.txSubmitted')); // Reuse submitting toast
            await tx.wait();
            alert(t('nft.harvestSuccess'));
            
            // Refresh
            fetchNftList();
        } catch (error) {
            console.error('Harvest failed:', error);
            alert('Harvest Failed: ' + (error.reason || error.message));
        } finally {
            isActionProcessing.value = false;
        }
    };

    const handleReactivate = async (nftId) => {
        if (isActionProcessing.value) return;

        // Check if user is qualified
        // (Assuming checkReactivate is strict requirement for action)
        // If canReactivate.value is false, user might not be able to reactivate.
        // User requirements say: "Staking.checkReactivate(user): returns true... execute activate"
        // I should warn if false.
        
        try {
            const stakingAddr = getContractAddress('Staking');
            const stakingContract = new ethers.Contract(stakingAddr, stakingAbi, walletState.signer);
            const can = await stakingContract.checkReactivate(walletState.address);
            
            if (!can) {
                showToast(t('nft.activationConditionNotMet'), 'error');
                return;
            }

            isActionProcessing.value = true;
            const nodePoolAddr = getContractAddress('NodePool');
            const nodePoolContract = new ethers.Contract(nodePoolAddr, nodePoolAbi, walletState.signer);
            const usdtAddr = getContractAddress('USDT');
            const usdtContract = new ethers.Contract(usdtAddr, ERC20_ABI, walletState.signer);
            
            // 500 USDT
            const amount = ethers.parseUnits('500', 18); // Assuming 18 decimals for USDT in this testnet
            
            // Approve
            alert('Please approve 500 USDT for reactivation');
            const approveTx = await usdtContract.approve(nodePoolAddr, amount);
            await approveTx.wait();
            
            // Reactivate
            const tx = await nodePoolContract.reactivate(nftId);
            alert(t('team.toast.txSubmitted'));
            await tx.wait();
            alert(t('nft.reactivateSuccess'));
            
            fetchNftList();

        } catch (error) {
            console.error('Reactivation failed:', error);
            alert('Reactivation Failed: ' + (error.reason || error.message));
        } finally {
            isActionProcessing.value = false;
        }
    };

    const hasRewards = computed(() => {
        return nftList.value.some(nft => Object.keys(nft.rewards).length > 0);
    });

    const formatReward = (val) => {
        if (!val) return '0';
        // Assume 18 decimals for rewards
        const formatted = ethers.formatUnits(val, 18);
        return parseFloat(formatted).toFixed(4);
    };

    // Watch for wallet connection changes
    watch(
      () => [walletState.isConnected, walletState.address],
      ([isConnected, address]) => {
        if (isConnected && address) {
          fetchBalance();
        } else {
          nftBalance.value = 0;
          nftList.value = [];
        }
      },
      { immediate: true }
    );

    onMounted(() => {
        fetchBalance();
        // Simple particle generator logic
        const particlesContainer = document.getElementById('particles-nft');
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
    });

    return {
      t,
      walletState,
      nftBalance,
      isModalVisible,
      openModal,
      closeModal,
      nftList,
      isLoading,
      isActionProcessing,
      handleHarvestAll,
      handleReactivate,
      hasRewards,
      formatReward,
      isActivationModalVisible,
      activationStats,
      openActivationModal,
      closeActivationModal,
      calculateProgress,
      formatNumber
    };
  }
}
</script>

<style scoped>
.nft-page {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  perspective: 1000px;
  overflow: hidden;
  position: relative;
  flex-direction: column;
}

.page-content {
  z-index: 1;
  width: 100%;
  max-width: 1200px; /* Increased from 900px for PC */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  /* padding: 0 1.5rem; */
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1rem;
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

.right-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

.nft-showcase {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(192, 132, 252, 0.1);
  box-shadow: 
    0 4px 24px -1px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(192, 132, 252, 0.05);
  border-radius: 20px;
  padding: 1rem 1.5rem; /* Reduced vertical padding */
  position: relative;
  overflow: hidden;
  /* Tilt effect for the container */
  transform: perspective(1000px) rotateY(-2deg);
  transition: transform 0.3s ease;
}

.nft-showcase:hover {
  transform: perspective(1000px) rotateY(0deg);
}

.nft-card-wrapper {
  flex-shrink: 0;
}

.nft-showcase-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.nft-list-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.4); /* Less opaque */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(192, 132, 252, 0.1);
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header h3 {
  font-family: var(--font-code);
  font-size: 1.2rem;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.harvest-all-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple-dark) 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  color: #fff;
  font-family: var(--font-code);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(192, 132, 252, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.harvest-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(192, 132, 252, 0.5);
}

.harvest-all-btn:disabled {
  opacity: 0.8; /* Higher opacity for better visibility if it's "How to Activate" */
  cursor: pointer; /* Keep pointer if it's the activate button */
  transform: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
  color: var(--text-secondary);
}

/* Specific style for when it is "How to Activate" - actually we reuse the main style but handle logic */
.harvest-all-btn.activate-mode {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(192, 132, 252, 0.3);
  color: var(--primary);
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.1);
}

.harvest-all-btn.activate-mode:hover {
  background: rgba(192, 132, 252, 0.15);
  box-shadow: 0 0 15px rgba(192, 132, 252, 0.2);
  transform: translateY(-2px);
}

/* Grid Layout Styles */
.nft-grid-container {
  width: 100%;
}

.nft-grid-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Reduced gap for PC as well */
}

.grid-header {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1.5fr;
  padding: 0 1rem 0.6rem;
  color: var(--text-secondary);
  font-family: var(--font-code);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.grid-item {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1.5fr;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px; /* Slightly reduced radius */
  padding: 0.8rem 1rem; /* Compact padding */
  align-items: center;
  transition: all 0.2s ease;
}

.grid-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(192, 132, 252, 0.2);
  transform: translateX(4px);
}

.item-main {
  display: contents; /* PC ignores this wrapper */
}

.col-id .value {
  font-family: var(--font-code);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.col-level .value {
  font-family: var(--font-code);
  color: var(--primary);
  font-weight: 700;
  background: rgba(192, 132, 252, 0.1);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.reward-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reward-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.reward-tag .amount {
  color: #fff;
  font-family: var(--font-code);
  font-weight: 600;
  font-size: 0.9rem;
}

.reward-tag .symbol {
  color: var(--text-secondary);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.mobile-label {
  display: none; /* Hidden on PC */
}

.action-btn {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: var(--font-code);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  font-size: 0.8rem;
  text-align: center;
}

.reactivate-btn {
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #facc15;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.1);
}

.reactivate-btn:hover:not(:disabled) {
  background: rgba(234, 179, 8, 0.25);
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
  transform: translateY(-1px);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  font-size: 0.8rem;
  color: #4ade80;
  font-weight: 500;
}

.status-badge.active .dot {
  width: 5px;
  height: 5px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-family: var(--font-code);
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .nft-list-section {
    padding: 0.8rem;
  }
  
  .grid-header {
    display: none; /* Hide header on mobile */
  }
  
  .nft-grid-list {
    gap: 0.5rem;
  }

  .grid-item {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    min-height: 50px;
  }
  
  .grid-item:hover {
    transform: none;
  }
  
  .item-main {
    display: contents;
  }
  
  .col-id {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }
  
  .col-id .value {
    font-size: 0.9rem;
  }

  .col-level {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }
  
  .col-level .value {
    font-size: 0.8rem;
    padding: 2px 6px;
  }
  
  .mobile-label {
    display: none; 
  }
  
  .item-rewards {
    flex: 1;
    min-width: 0; /* Allow flex shrinking */
    overflow-x: auto; /* Scroll if needed */
    white-space: nowrap;
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .item-rewards::-webkit-scrollbar {
    display: none;
  }
  
  .reward-list {
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
  }

  .reward-tag {
    padding: 2px 6px;
    font-size: 0.75rem;
    background: rgba(0,0,0,0.3);
    white-space: nowrap;
  }
  
  .reward-tag .amount {
    font-size: 0.8rem;
  }
  
  .item-status {
    flex: 0 0 auto;
    width: auto;
    display: flex;
    justify-content: flex-end;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
    width: auto;
    min-width: unset;
    white-space: nowrap;
  }
  
  .status-badge {
    padding: 4px 8px;
    font-size: 0.75rem;
    white-space: nowrap;
  }
}


.coming-soon-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  opacity: 0.8;
}

.divider {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
  opacity: 0.3;
}

.line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}

.icon-separator {
  color: var(--primary);
  font-size: 0.8rem;
}

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
    top: 100%; /* Start below */
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.1;
    }
    100% {
        transform: translateY(-120vh) rotate(180deg);
        opacity: 0;
    }
}

.showcase-header {
  font-family: var(--font-code);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-align: left;
  margin-bottom: 0.2rem;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
  letter-spacing: 1px;
  padding: 0;
  border-bottom: none;
  width: auto;
}

.nft-card-container {
  position: relative;
  width: 100px; /* Condensed size for mobile */
  height: 100px;
  perspective: 1500px;
}

.nft-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: float-rotate 6s ease-in-out infinite;
  border-radius: 12px;
}

.nft-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}

.nft-balance-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.nft-balance-info .balance-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nft-balance-info .balance-value {
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
  line-height: 1.1;
}

/* Enhancing the glow on hover or via animation */
.nft-card::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 25px;
  background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);
  opacity: 0.6;
  z-index: -1;
  animation: pulse-glow 3s ease-in-out infinite alternate;
}

.nft-shadow {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%) rotateX(90deg);
  width: 200px;
  height: 20px;
  background: radial-gradient(rgba(0,0,0,0.5), transparent 70%);
  opacity: 0.6;
  animation: shadow-scale 6s ease-in-out infinite;
}

.nft-info {
  text-align: center;
  opacity: 0;
  animation: fade-up 1s ease-out forwards 0.5s;
}

h1 {
  font-family: var(--font-code);
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
  background: linear-gradient(to right, #fff, var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(192, 132, 252, 0.3);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.coming-soon {
  font-family: var(--font-code);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: var(--text-muted);
  /* margin-top: 2rem; */
  text-transform: uppercase;
  padding: 10px 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: inline-block;
}

/* Removed pulse animation to make it more formal */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--text-primary);
  backdrop-filter: blur(5px);
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--green);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--green);
  animation: blink 2s infinite;
}

/* Animations */
@keyframes float-rotate {
  0% {
    transform: rotateY(-15deg);
  }
  50% {
    transform: rotateY(15deg);
  }
  100% {
    transform: rotateY(-15deg);
  }
}

@keyframes pulse-glow {
  0% {
    transform: scale(0.95);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes shadow-scale {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) scale(1); /* No scaling */
    opacity: 0.6;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (min-width: 1024px) {
  .page-content {
    flex-direction: row;
    align-items: flex-start; /* Align to top for better balance */
    justify-content: space-between;
    gap: 6rem; /* Increased gap */
    padding-top: 4rem; /* Add some top padding */
  }
  
  .header-section {
    width: 40%;
    margin-bottom: 0;
    position: sticky;
    top: 100px; /* Sticky effect for scrolling if needed */
    padding-top: 2rem;
  }

  .page-title {
    font-size: 5rem; /* Larger title on PC */
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

  .nft-showcase {
    padding: 4rem 3rem; /* More padding inside card */
    transform: perspective(1000px) rotateY(-5deg); /* Stronger tilt initially */
    gap: 3rem;
  }
  
  .showcase-header {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .nft-balance-info .balance-value {
    font-size: 2.5rem;
  }
  
  .nft-balance-info .balance-label {
    font-size: 0.9rem;
  }
  
  .nft-showcase:hover {
    transform: perspective(1000px) rotateY(0deg) scale(1.02); /* Slight scale on hover */
    box-shadow: 
      0 10px 40px -5px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(192, 132, 252, 0.1);
  }

  .nft-card-container {
    width: 300px; /* Larger NFT on PC */
    height: 300px;
  }
  
  h1 {
    font-size: 4rem;
  }

  .coming-soon-section {
    flex-direction: row;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .divider {
    width: auto;
    flex: 1;
    margin: 0 2rem;
  }
}

/* Activation Modal Styles - Matching Team View Modal */
.activation-modal {
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
  overflow: hidden;
}

.modal-header {
  padding: 0;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.2rem;
  text-align: left;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
  width: 100%;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  position: absolute;
  top: 20px;
  right: 20px;
}

.modal-body {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  text-align: left;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-family: var(--font-code);
  width: 100%;
}

.progress-values {
  color: #fff;
}

.progress-values .current {
  color: var(--primary);
  font-weight: 600;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.4);
}

.modal-footer {
  padding: 0;
  border-top: none;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 10px;
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  line-height: normal;
  background: var(--primary);
  color: #000;
  font-family: var(--font-code);
  box-shadow: none;
  text-transform: none;
  letter-spacing: normal;
}

.confirm-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
  transform: none;
}

.modal-overlay {
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

.modal-content {
  /* Inherits from activation-modal but keep for transition target */
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>