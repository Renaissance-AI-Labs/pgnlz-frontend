<template>
  <div class="home-container">
    <div class="background-animation">
      <div class="code-grid-bg"></div>
      <div class="floating-particles" id="particles"></div>
    </div>

    <div class="announcement-wrapper">
      <div class="announcement-card glass">
        <h1 class="announcement-title text-gradient">{{ t('home.announcement.title') }}</h1>
        
        <div class="announcement-content">
          <p class="greeting">{{ t('home.announcement.greeting') }}</p>
          
          <p class="text-block">{{ t('home.announcement.p1') }}</p>
          
          <p class="bullet-intro">{{ t('home.announcement.bullet_intro') }}</p>
          <ul class="bullet-list">
            <li>{{ t('home.announcement.b1') }}</li>
            <li>{{ t('home.announcement.b2') }}</li>
            <li>{{ t('home.announcement.b3') }}</li>
            <li>{{ t('home.announcement.b4') }}</li>
          </ul>
          
          <p class="text-block">{{ t('home.announcement.p2') }}</p>
          <!-- Combined p2 and p3 slightly -->
          <p class="text-block">{{ t('home.announcement.p3') }}</p>
          
          <p class="closing text-gradient">{{ t('home.announcement.closing') }}</p>
          
          <p class="contact-info">{{ t('home.announcement.contact') }}</p>
          
          <div class="signature-block">
            <p class="signature">{{ t('home.announcement.signature') }}</p>
            <p class="note">{{ t('home.announcement.note') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { t } from '@/i18n';

export default {
  name: 'HomeView',
  setup() {
    onMounted(() => {
        // Simple particle generator logic
        const particlesContainer = document.getElementById('particles');
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

    return { t };
  }
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - var(--header-height)); /* Subtract header height */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
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

/* Particle animation styles global in index.html/main.css or defined here if scoped works for dynamic elements (deep selector needed) */
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

.announcement-wrapper {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
}

.announcement-card {
  padding: 2.5rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.announcement-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  font-family: var(--font-primary);
}

.announcement-content {
  color: var(--text-primary);
  line-height: 1.5;
  font-size: 0.9rem;
}

.greeting {
  font-weight: 700;
  margin-bottom: 0.75rem;
  white-space: pre-line;
}

.text-block {
  margin-bottom: 0.6rem;
  text-align: justify;
}

.bullet-intro {
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--cyan);
}

.bullet-list {
  list-style: none;
  padding: 0;
  margin-bottom: 0.75rem;
}

.bullet-list li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.4rem;
}

.bullet-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  background-color: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--primary);
}

.closing {
  margin: 1.25rem 0;
  font-weight: 700;
  text-align: center;
  font-size: 1rem;
}

.contact-info {
  margin-bottom: 1.25rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.signature-block {
  text-align: right;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1rem;
}

.signature {
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.3rem;
}

.note {
  font-size: 0.85rem;
  color: var(--text-muted);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .announcement-card {
    padding: 1.5rem;
  }
  
  .announcement-title {
    font-size: 1.4rem;
  }
}
</style>
