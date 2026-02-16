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
          
          <p class="text-block">{{ t('home.announcement.p2') }}</p>

          <p class="text-block">{{ t('home.announcement.p3') }}</p>

          <p class="text-block">{{ t('home.announcement.p4') }}</p>
          
          <p class="closing text-gradient">{{ t('home.announcement.closing') }}</p>
          
          <p class="contact-info">{{ t('home.announcement.contact') }}</p>
          
          <div class="signature-block">
            <p class="signature">{{ t('home.announcement.signature') }}</p>
            <p class="note">{{ t('home.announcement.date') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <!-- <section class="hero-section">
      <div class="hero-container">
        
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

        <div class="hero-content-bottom">
          <div class="hero-title">
            <span class="title-text">{{ t('home.subtitle') }}</span>
          </div>
        </div>

      </div>
    </section> -->

    <!-- Global Dashboard -->
    <GlobalDashboard />

    <!-- Staking Section -->
    <StakingSection />

    <!-- LP Dividend Section -->
    <LPDividendSection />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'; // Add this
import { t } from '@/i18n';
import GlobalDashboard from '@/components/GlobalDashboard.vue';
import StakingSection from '@/components/StakingSection.vue';
import LPDividendSection from '@/components/LPDividendSection.vue';

export default {
  name: 'HomeView',
  components: {
    GlobalDashboard,
    StakingSection,
    LPDividendSection
  },
  setup() {
    const showModal = ref(false);
    const router = useRouter(); // Add this

    const closeModal = () => {
      showModal.value = false;
      sessionStorage.setItem('hasVisited', 'true');
    };

    onMounted(() => {
        // const hasVisited = sessionStorage.getItem('hasVisited');
        // if (!hasVisited) {
        //     showModal.value = true;
        // }

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

