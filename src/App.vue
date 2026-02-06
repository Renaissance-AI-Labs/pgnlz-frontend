<template>
  <div>
    <!-- Retaining core wallet functionality components -->
    <ToastNotification />
    
    <Header @open-get-started-modal="openModal" @open-language-modal="openLanguageModal" />
    
    <!-- Simplified Layout Wrapper -->
    <div id="wrapper">
      <router-view />
    </div>
    
    <Footer />

    <BottomNav />
    
    <transition name="modal">
      <ConnectWalletModal v-if="isModalVisible" @close="closeModal" />
    </transition>

    <transition name="modal">
      <LanguageModal v-if="isLanguageModalVisible" @close="closeLanguageModal" />
    </transition>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import BottomNav from './components/BottomNav.vue';
import ConnectWalletModal from './components/ConnectWalletModal.vue';
import LanguageModal from './components/LanguageModal.vue';
import ToastNotification from './components/ToastNotification.vue';
import { autoConnectWallet } from './services/wallet.js';
import { initializeLanguage } from './i18n';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    BottomNav,
    ConnectWalletModal,
    LanguageModal,
    ToastNotification
  },
  data() {
    return {
      isModalVisible: false,
      isLanguageModalVisible: false,
    };
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    openLanguageModal() {
      this.isLanguageModalVisible = true;
    },
    closeLanguageModal() {
      this.isLanguageModalVisible = false;
    }
  },
  mounted() {
    initializeLanguage();
    autoConnectWallet();

    // 如果 URL 中包含 ref 参数，且当前不是团队页面，则跳转到团队页面
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      // 使用 router.push 并保留 query 参数
      // 检查当前路由是否已经是 Team，避免重复跳转 (虽然 router.push 也会处理)
      // 注意：此时 this.$route 可能还未完全解析完成，直接检查 pathname 或者在 nextTick
      if (this.$router && this.$route.path !== '/team') {
         this.$router.push({ path: '/team', query: { ref } });
      }
    }
  }
}
</script>

<style scoped>
/* Removed visual styles, retained necessary layout if any */
#wrapper {
  padding-top: var(--header-height); /* Ensure content doesn't hide behind fixed header */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
</style>
