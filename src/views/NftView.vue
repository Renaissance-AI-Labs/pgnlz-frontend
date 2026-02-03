<template>
  <div class="nft-page">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles-nft"></div>
    </div>

    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title" data-text="< NFT NODE />">&lt; NFT NODE /&gt;</h2>
        <p class="page-intro">
          持有PGNLZ MAX NODE NFT，可获得网络质押收益及代币交易税收入分成。
        </p>
      </div>

      <div class="right-section">
        <div class="nft-showcase">
          <div class="showcase-header">我的 NODE NFT</div>
          
          <div class="nft-card-container">
            <div class="nft-card">
              <img src="/asset/images/nft/pgnlz-node.png" alt="Exclusive NFT" class="nft-image">
              <div class="card-reflection"></div>
              
              <!-- Balance Badge -->
              <div class="nft-balance-badge" v-if="walletState.isConnected">
                <span class="balance-label">当前持有</span>
                <span class="balance-value">{{ nftBalance }}</span>
              </div>
            </div>
            <div class="nft-shadow"></div>
          </div>
          
          <div class="nft-info">
            <!-- <h1>NODE</h1>
            <p class="subtitle">Energy Burst NFT</p> -->
          </div>
        </div>

        <div class="coming-soon-section">
          <div class="divider">
            <div class="line"></div>
            <div class="icon-separator">◆</div>
            <div class="line"></div>
          </div>
          <p class="coming-soon">COMING SOON</p>
        </div>
      </div>
    </div>

    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>
  </div>
</template>

<script>
import { walletState } from '@/services/wallet.js';
import { onMounted, ref, watch } from 'vue';
import { ethers } from 'ethers';
import nodeNFTAbi from '@/abis/nodeNFT.json';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';

export default {
  name: 'NftView',
  components: {
    ConnectWalletModal
  },
  setup() {
    const nftBalance = ref(0);
    const isModalVisible = ref(false);
    const contractAddress = '0xAfa9f8df415eDe1410Efc2c4E551C78f91Dc8EB9';

    const openModal = () => {
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    const fetchBalance = async () => {
      if (!walletState.isConnected || !walletState.signer || !walletState.address) {
        nftBalance.value = 0;
        return;
      }

      try {
        const contract = new ethers.Contract(contractAddress, nodeNFTAbi, walletState.signer);
        const balance = await contract.balanceOf(walletState.address);
        nftBalance.value = balance.toString();
        console.log('NFT Balance fetched:', balance.toString());
      } catch (error) {
        console.error('Failed to fetch NFT balance:', error);
        nftBalance.value = 0;
      }
    };

    // Watch for wallet connection changes
    watch(
      () => [walletState.isConnected, walletState.address],
      ([isConnected, address]) => {
        if (isConnected && address) {
          fetchBalance();
        } else {
          nftBalance.value = 0;
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
      walletState,
      nftBalance,
      isModalVisible,
      openModal,
      closeModal
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
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(192, 132, 252, 0.1);
  box-shadow: 
    0 4px 24px -1px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(192, 132, 252, 0.05);
  border-radius: 24px;
  padding: 1rem 1rem 1rem 1.5rem;
  position: relative;
  overflow: hidden;
  /* Tilt effect for the container */
  transform: perspective(1000px) rotateY(-2deg);
  transition: transform 0.3s ease;
}

.nft-showcase:hover {
  transform: perspective(1000px) rotateY(0deg);
}

/* Remove old sections styles */
/* .nft-section-1 { ... } */
/* .nft-section-2 { ... } */

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

/* Remove unused styles */
/* .nft-section-2 { ... } */

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

.nft-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  z-index: 1;
}

.showcase-header {
  font-family: var(--font-code);
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
  letter-spacing: 1px;
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(192, 132, 252, 0.2);
  width: 100%;
}

.nft-card-container {
  position: relative;
  width: 220px;
  height: 220px;
  perspective: 1500px;
}

.nft-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: float-rotate 6s ease-in-out infinite;
  border-radius: 20px;
}

.nft-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Ensure full image is visible */
  border-radius: 20px;
  /* White glow effect */
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}

.nft-balance-badge {
  position: absolute;
  left: 50%;
  width: auto;
  min-width: 90px;
  transform: translateX(-50%) translateZ(30px);
  z-index: 10;
  bottom: -40px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(192, 132, 252, 0.3);
  border-radius: 12px;
  padding: 6px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.nft-balance-badge .balance-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nft-balance-badge .balance-value {
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
  line-height: 1;
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
    transform: translateY(0) rotateY(-15deg) rotateX(5deg);
  }
  50% {
    transform: translateY(-20px) rotateY(15deg) rotateX(-5deg);
  }
  100% {
    transform: translateY(0) rotateY(-15deg) rotateX(5deg);
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
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) scale(0.8);
    opacity: 0.4;
  }
  100% {
    transform: translateX(-50%) scale(1);
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
</style>
