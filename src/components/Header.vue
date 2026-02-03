<template>
    <header class="main-header" :class="{ 'scrolled': isScrolled }" id="site-header">
        <nav class="nav-container">
            <!-- Logo -->
            <div class="nav-brand">
                <router-link to="/" class="brand-logo">
                    <img src="/asset/images/logo/pgnlz-logo.png" alt="PGNLZ Logo" class="logo-img">
                    <!-- <span class="logo-text">PGNLZ MAX</span> -->
                </router-link>
            </div>

            <!-- Desktop Navigation -->
            <div class="nav-menu">
                <!-- Add navigation links here if needed in future -->
            </div>

            <!-- Right Actions -->
            <div class="nav-controls">
                <!-- Wallet Connect -->
                <a v-if="!walletState.isConnected" href="#" @click.prevent="openModal" class="btn connect-btn gradient-border">
                    <i class="fas fa-wallet"></i>
                    <span>{{ t('header.connectWallet') || 'Connect Wallet' }}</span>
                </a>
                <a v-else href="#" @click.prevent="openModal" class="btn connect-btn connected">
                    <span class="status-dot"></span>
                    <span class="address-text">{{ formattedAddress }}</span>
                </a>

                <!-- Language Selector -->
                <button class="lang-toggle" @click="openLanguageModal" title="Change Language">
                    <i class="fas fa-language"></i>
                </button>
            </div>
        </nav>
    </header>
</template>

<script>
import { walletState, formatAddress } from '@/services/wallet.js';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { t } from '@/i18n';

export default {
  name: 'Header',
  setup() {
    const formattedAddress = computed(() => formatAddress(walletState.address));
    const isScrolled = ref(false);

    const handleScroll = () => {
        isScrolled.value = window.scrollY > 50;
    };

    onMounted(() => {
        window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
    });

    return {
      walletState,
      formattedAddress,
      t,
      isScrolled
    };
  },
  methods: {
    openModal() {
      this.$emit('open-get-started-modal');
    },
    openLanguageModal() {
      this.$emit('open-language-modal');
    }
  }
}
</script>

<style scoped lang="scss">
.main-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(15, 23, 42, 0.8); /* var(--bg-dark) with opacity */
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    z-index: 1000;
    transition: all var(--transition);
    height: var(--header-height);
}

.main-header.scrolled {
    background: rgba(15, 23, 42, 0.95);
    box-shadow: var(--shadow-md);
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
}

.brand-logo {
    font-family: var(--font-code);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
}

.logo-img {
    height: 35px;
    width: auto;
}

.logo-bracket {
    color: var(--purple);
}

.logo-text {
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
}

.nav-menu {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.lang-toggle {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-primary);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    transition: all var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}

.lang-toggle:hover {
    background: var(--bg-hover);
    border-color: var(--primary);
    color: var(--primary);
}

.connect-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 38px;
    padding: 0 1rem;
    font-size: 0.85rem;
    transition: all var(--transition);
}

.connect-btn.gradient-border {
    position: relative;
    background: linear-gradient(var(--bg-card), var(--bg-card)) padding-box,
                var(--gradient-1) border-box;
    border: 2px solid transparent;
    border-radius: 12px;
    color: var(--text-primary);
}

.connect-btn.gradient-border:hover {
    box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
    transform: translateY(-2px);
    color: white;
}

.connect-btn.connected {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    border-radius: 12px;
}

.connect-btn.connected:hover {
    border-color: var(--green);
    color: var(--text-primary);
}

.status-dot {
    width: 8px;
    height: 8px;
    background: var(--green);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--green);
}

@media (max-width: 768px) {
    .nav-container {
        padding: 0 1rem;
    }
    
    .logo-text {
        font-size: 1.2rem;
    }
    
    .connect-btn {
        padding: 0 1rem;
    }
    
    .connect-btn span:not(.address-text) {
        display: none;
    }
    
    .connect-btn i {
        margin: 0;
    }
}
</style>
