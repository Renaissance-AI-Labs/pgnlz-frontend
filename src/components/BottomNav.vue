<template>
  <div class="bottom-nav-wrapper">
    <nav class="bottom-nav" :class="{ 'hidden': !isVisible }">
      <router-link to="/" class="nav-item" active-class="active">
        <div class="icon-container">
          <i class="fas fa-home"></i>
        </div>
        <span class="nav-label">{{ t('nav.home') || '首页' }}</span>
      </router-link>
      
      <router-link to="/nft" class="nav-item" active-class="active">
        <div class="icon-container">
          <i class="fas fa-cube"></i>
        </div>
        <span class="nav-label">{{ t('nav.nft') || 'NFT' }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { t } from '@/i18n';

export default {
  name: 'BottomNav',
  setup() {
    const isVisible = ref(true);
    let scrollTimer = null;

    const handleScroll = () => {
      // Hide immediately on scroll
      isVisible.value = false;
      
      // Clear previous timer
      if (scrollTimer) clearTimeout(scrollTimer);
      
      // Show again after scrolling stops (200ms delay)
      scrollTimer = setTimeout(() => {
        isVisible.value = true;
      }, 200);
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    });

    onUnmounted(() => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      isVisible,
      t
    };
  }
}
</script>

<style scoped>
.bottom-nav-wrapper {
  /* Only show on mobile/tablet by default, or global if preferred. 
     For now, we make it global but optimized for touch. */
  display: block; 
}

.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  background: rgba(30, 41, 59, 0.95); /* var(--bg-card) with opacity */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.bottom-nav.hidden {
  transform: translate(-50%, 150%); /* Move down out of view */
  opacity: 0;
  pointer-events: none;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-muted);
  gap: 4px;
  transition: all 0.2s ease;
  position: relative;
  padding: 4px 12px;
}

.icon-container {
  font-size: 1.2rem;
  margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Active State */
.nav-item.active {
  color: var(--primary);
}

.nav-item.active .icon-container {
  transform: translateY(-2px);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--primary);
}

.nav-item:hover:not(.active) {
  color: var(--text-primary);
}

@media (min-width: 769px) {
  /* Optional: Hide on desktop if we add header links later. 
     For now keeping it as requested. */
}
</style>
