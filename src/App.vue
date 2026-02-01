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
