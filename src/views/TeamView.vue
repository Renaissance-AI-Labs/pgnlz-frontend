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
        <div class="team-showcase">
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
    </div>

    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>
  </div>
</template>

<script>
import { walletState } from '@/services/wallet.js';
import { onMounted, ref } from 'vue';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';

export default {
  name: 'TeamView',
  components: {
    ConnectWalletModal
  },
  setup() {
    const isModalVisible = ref(false);

    const openModal = () => {
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    onMounted(() => {
        // Simple particle generator logic
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
    });

    return {
      walletState,
      isModalVisible,
      openModal,
      closeModal
    };
  }
}
</script>

<style scoped>
.team-page {
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
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

.team-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  /* background: rgba(15, 23, 42, 0.4); */
  /* backdrop-filter: blur(12px); */
  border-radius: 24px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
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
    top: 100%;
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

.coming-soon {
  font-family: var(--font-code);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 10px 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: inline-block;
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 6rem;
    padding-top: 4rem;
  }
  
  .header-section {
    width: 40%;
    margin-bottom: 0;
    position: sticky;
    top: 100px;
    padding-top: 2rem;
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