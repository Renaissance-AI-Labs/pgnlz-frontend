<template>
  <div class="home-container">
    <div class="background-animation">
      <div class="cyber-grid"></div>
      <div class="cyber-glow-overlay"></div>
      <div class="floating-particles" id="particles"></div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="announcement-card glass modal-content">
        <button class="close-btn" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
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

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        
        <!-- Combined Visual & Title Area -->
        <div class="hero-header-visual">
          <div class="hero-image-wrapper">
            <div class="hero-image-container">
              <div class="profile-image-glow"></div>
              <div class="profile-image-frame">
                <div class="profile-image">
                  <div class="profile-placeholder">
                    <div class="cyber-core-container">
                      <div class="cyber-ring ring-outer"></div>
                      <div class="cyber-ring ring-middle"></div>
                      <div class="cyber-ring ring-inner"></div>
                      <div class="cyber-core">
                        <div class="core-glitch"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Orbital System -->
              <div class="orbital-system">
                <div class="orbit-ring ring-1">
                    <div class="orbit-object"></div>
                </div>
                <div class="orbit-ring ring-2">
                    <div class="orbit-object"></div>
                </div>
                <div class="orbit-ring ring-3">
                    <div class="orbit-object"></div>
                </div>
              </div>
            </div>
          </div>
          
          <h1 class="hero-name-overlay">
            <span class="name-value">PGNLZ</span>
          </h1>
        </div>

        <!-- Content Below -->
        <div class="hero-content-bottom">
          <!-- <div class="hero-greeting">
            <span class="greeting-text">Hello, Welcome to</span>
            <span class="greeting-cursor">|</span>
          </div> -->
          
          <div class="hero-title">
            <!-- <span class="title-prefix">//</span> -->
            <span class="title-text">与PGNLZ MAX一起打造去中心化世界</span>
          </div>
          
          <!-- <p class="hero-description">
            Passionate developers creating exceptional digital experiences with modern technologies.
          </p> -->
          
          <!-- <div class="hero-buttons">
            <a href="#contact" class="btn btn-primary">
              <span>Get In Touch</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            <a href="#projects" class="btn btn-secondary">
              <span>View Projects</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </a>
          </div> -->
        </div>

      </div>
    </section>

    <!-- Global Dashboard -->
    <GlobalDashboard />

    <!-- Staking Section -->
    <StakingSection />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'; // Add this
import { t } from '@/i18n';
import GlobalDashboard from '@/components/GlobalDashboard.vue';
import StakingSection from '@/components/StakingSection.vue';

export default {
  name: 'HomeView',
  components: {
    GlobalDashboard,
    StakingSection
  },
  setup() {
    const showModal = ref(false);
    const router = useRouter(); // Add this

    const closeModal = () => {
      showModal.value = false;
      sessionStorage.setItem('hasVisited', 'true');
    };

    onMounted(() => {
        const hasVisited = sessionStorage.getItem('hasVisited');
        if (!hasVisited) {
            showModal.value = true;
        }

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

    return { t, showModal, closeModal };
  }
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - var(--header-height)); /* Subtract header height */
  position: relative;
  /* display: flex;  Removed to allow block flow for hero section */
  /* justify-content: center; */
  /* align-items: center; */
  padding: 0rem 1rem;
  overflow-x: hidden;
}

/* Hero Section Styles */
.hero-section {
    /* min-height: calc(100vh - var(--header-height)); */
    display: flex;
    align-items: center;
    position: relative;
    padding: 1rem 0;
    z-index: 1; /* Above background animation */
}

.hero-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    position: relative;
}

.hero-header-visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 500px;
    /* margin-bottom: 3rem; */
}

.hero-image-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    transform: scale(1);
    filter: blur(0px);
    transition: all 0.5s ease-out;
}

.hero-name-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    font-family: var(--font-code);
    font-size: 8rem;
    font-weight: 800;
    line-height: 1;
    pointer-events: none;
    /* mix-blend-mode: overlay; Removed to make text stand out more */
    text-shadow: 0 0 50px rgba(192, 132, 252, 0.8), 0 0 20px rgba(0,0,0,0.5); /* Stronger shadow */
    opacity: 1;
}

.hero-name-overlay .name-value {
    background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(192, 132, 252, 0.8));
    /* Ensure text fill is visible */
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1); 
}

.hero-content-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 5;
    max-width: 800px;
}

.hero-content {
    /* Legacy class, kept for structure if needed, or remove */
    display: none; 
}

/* Adjust animation container to be more subtle behind text */
.profile-image-glow {
    /* ... existing ... */
    opacity: 0.4;
}

.profile-image-frame {
    /* ... existing ... */
    border-width: 2px;
    box-shadow: 0 0 40px rgba(192, 132, 252, 0.2);
    background: rgba(30, 41, 59, 0.3);
    backdrop-filter: blur(5px);
}

.hero-greeting {
    font-family: var(--font-code);
    font-size: 1.2rem;
    color: var(--primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .hero-name-overlay {
        font-size: 4rem;
    }
    
    .hero-header-visual {
        min-height: auto;
        /* margin-bottom: 2rem; */
    }
    
    .hero-image-wrapper {
        transform: scale(0.7);
    }
}

.greeting-cursor {
    animation: blink 1s infinite;
    color: var(--primary);
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.hero-name {
    font-family: var(--font-code);
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 2rem;
    line-height: 1.2;
}

.name-prefix {
    color: var(--purple);
}

.name-operator {
    color: var(--cyan);
    margin: 0 0.5rem;
}

.name-value {
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.name-suffix {
    color: var(--primary);
}

.hero-title {
    font-family: var(--font-code);
    font-size: 1rem;
    color: var(--cyan);
    margin-bottom: 2rem;
}

.title-prefix {
    color: var(--text-muted);
    margin-inline-end: 0.5rem;
}

.hero-description {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    line-height: 1.8;
    max-width: 600px;
}

.hero-buttons {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
}

.hero-image-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-image-container {
    position: relative;
    width: 400px;
    height: 400px;
}

.profile-image-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%); /* Adjusted color to match primary */
    border-radius: 50%;
    animation: pulse 3s ease-in-out infinite;
    z-index: 0;
}

@keyframes pulse {
    0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.5;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 0.8;
    }
}

.profile-image-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid var(--primary);
    box-shadow: 
        0 0 30px rgba(192, 132, 252, 0.3),
        0 0 60px rgba(192, 132, 252, 0.1);
    overflow: hidden;
    background: var(--bg-card);
}

.profile-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    will-change: transform;
}

.profile-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background: radial-gradient(circle at 30% 30%, rgba(192, 132, 252, 0.1), transparent 60%);
}

.tech-core {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 30px var(--primary), 0 0 60px var(--primary);
  animation: corePulse 3s infinite ease-in-out;
  position: relative;
  z-index: 2;
}

.tech-ring-outer {
  position: absolute;
  width: 80%;
  height: 80%;
  border: 1px solid rgba(192, 132, 252, 0.3);
  border-top: 1px solid var(--cyan);
  border-bottom: 1px solid var(--purple);
  border-radius: 50%;
  animation: spin 8s linear infinite;
  z-index: 1;
}

.tech-ring-inner {
  position: absolute;
  width: 60%;
  height: 60%;
  border: 1px solid rgba(192, 132, 252, 0.2);
  border-left: 2px solid var(--accent);
  border-right: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 6s linear infinite reverse;
  z-index: 1;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes corePulse {
  0%, 100% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 50px var(--primary), 0 0 80px var(--primary); }
}

/* Advanced Orbital System */
.orbital-system {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160%;
    height: 160%;
    pointer-events: none;
    z-index: 5;
}

.orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(192, 132, 252, 0.05); /* Extremely subtle path */
    box-shadow: 0 0 20px rgba(192, 132, 252, 0.05);
}

.orbit-object {
    position: absolute;
    top: 50%;
    left: 50%; /* Start center relative to ring container if needed, but here we use calc on pseudo */
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    animation: orbitRotate linear infinite;
}

.orbit-object::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 15px var(--cyan), 0 0 30px var(--cyan);
    filter: blur(1px);
}

/* Ring 1 - Close & Fast */
.ring-1 {
    width: 120%;
    height: 120%;
    border-color: rgba(103, 232, 249, 0.1);
}
.ring-1 .orbit-object {
    animation-duration: 8s;
}
.ring-1 .orbit-object::after {
    top: 0;
    left: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
}

/* Ring 2 - Mid & Elliptical Illusion */
.ring-2 {
    width: 160%;
    height: 160%;
    border: none; /* Invisible path */
}
.ring-2 .orbit-object {
    animation-duration: 15s;
    animation-direction: reverse;
}
.ring-2 .orbit-object::after {
    top: 15%; /* Offset to create non-perfect circular visual weight */
    left: 85%;
    width: 10px;
    height: 10px;
    background: var(--primary);
    box-shadow: 0 0 20px var(--primary);
}

/* Ring 3 - Far & Slow - The "Satellite" */
.ring-3 {
    width: 200%;
    height: 200%;
    border: 1px dashed rgba(192, 132, 252, 0.1);
}
.ring-3 .orbit-object {
    animation-duration: 25s;
}
.ring-3 .orbit-object::after {
    bottom: 0;
    left: 50%;
    width: 14px;
    height: 14px;
    transform: translate(-50%, 50%);
    background: white; /* Brightest star */
    box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px var(--primary);
}

@keyframes orbitRotate {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@media (max-width: 768px) {
    .orbital-system {
        width: 140%;
        height: 140%;
    }
}

@media (max-width: 1024px) {
    .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
        /* gap: 4rem; */
    }
    
    .hero-image-wrapper {
        order: -1;
    }
    
    .hero-buttons {
        justify-content: center;
    }
    
    .hero-greeting {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .hero-name {
        font-size: 2.5rem;
    }
    
    .hero-image-container {
        width: 280px;
        height: 280px;
    }
    
    .cyber-floater {
        display: none; /* Hide old floaters if any remain */
    }
    
    /* Hide far orbit on mobile to reduce clutter */
    .ring-3 {
        display: none;
    }
    
    .ring-1 { width: 140%; height: 140%; }
    .ring-2 { width: 180%; height: 180%; }
}

@media (max-width: 480px) {
    .hero-name {
        font-size: 2rem;
    }
    
    .hero-image-container {
        width: 220px;
        height: 220px;
    }
}

/* Original Modal and Animation Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 1rem;
}

.modal-content {
  position: relative;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--primary);
  border-color: var(--primary);
  transform: rotate(90deg);
}


.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
}

.cyber-grid {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: 
        linear-gradient(transparent 95%, rgba(192, 132, 252, 0.1) 95%),
        linear-gradient(90deg, transparent 95%, rgba(192, 132, 252, 0.1) 95%);
    background-size: 50px 50px;
    transform: perspective(500px) rotateX(60deg);
    animation: gridMove 20s linear infinite;
    pointer-events: none;
}

.cyber-glow-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, transparent 20%, #020617 90%);
    pointer-events: none;
}

@keyframes gridMove {
    0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
    100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
}

/* Particle animation styles global in index.html/main.css or defined here if scoped works for dynamic elements (deep selector needed) */
:deep(.particle) {
    position: absolute;
    font-family: var(--font-code);
    font-size: 1.5rem;
    color: var(--primary);
    opacity: 0.1;
    animation: float 25s infinite linear;
    top: 100%;
    pointer-events: none;
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }
    10% { opacity: 0.1; }
    90% { opacity: 0.1; }
    100% {
        transform: translateY(-120vh) rotate(180deg);
        opacity: 0;
    }
}

.announcement-card {
  padding: 2.5rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  height: 60% !important;
}

.announcement-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  font-family: var(--font-primary);
  padding: 0 3rem;
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
