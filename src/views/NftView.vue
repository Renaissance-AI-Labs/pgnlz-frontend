<template>
  <div class="nft-page">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles-nft"></div>
    </div>

    <div class="nft-showcase">
      <div class="nft-card-container">
        <div class="nft-card">
          <img src="/asset/images/nft/pgnlz-node.png" alt="Exclusive NFT" class="nft-image">
          <div class="card-reflection"></div>
          
          <!-- Balance Badge -->
          <div class="nft-balance-badge" v-if="walletState.isConnected">
            <div class="balance-content">12</div>
          </div>
        </div>
        <div class="nft-shadow"></div>
      </div>
      
      <div class="nft-info">
        <h1>NODE</h1>
        <p class="subtitle">Energy Burst NFT</p>
        <p class="coming-soon">COMING SOON</p>
      </div>
    </div>
  </div>
</template>

<script>
import { walletState } from '@/services/wallet.js';
import { onMounted } from 'vue';

export default {
  name: 'NftView',
  setup() {
    onMounted(() => {
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
      walletState
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
  padding: 2rem;
  perspective: 1000px;
  overflow: hidden;
  position: relative;
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

.nft-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  z-index: 1;
}

.nft-card-container {
  position: relative;
  width: 260px;
  height: 260px;
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
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%) translateZ(30px);
  padding: 2px; /* Border width */
  border-radius: 16px;
  background: var(--gradient-1); /* Gradient border color */
  box-shadow: 0 0 20px rgba(192, 132, 252, 0.5);
  z-index: 10;
}

.balance-content {
  background: var(--bg-dark);
  padding: 6px 24px;
  border-radius: 14px;
  color: #fff;
  font-family: var(--font-code);
  font-size: 1.3rem;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
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

@media (min-width: 768px) {
  .nft-card-container {
    width: 340px;
    height: 340px;
  }
  
  h1 {
    font-size: 3.5rem;
  }
}
</style>
