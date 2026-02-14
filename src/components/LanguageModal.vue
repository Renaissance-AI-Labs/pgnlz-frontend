<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content glass">
      <div class="modal-header">
        <h3 class="modal-title">{{ t('language.switchTitle') }}</h3>
        <button @click="close" class="close-button">
            <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="language-list">
          <button 
            v-for="language in languages" 
            :key="language.code"
            class="lang-option"
            :class="{ active: currentLang === language.code }"
            @click="selectLanguage(language.code)"
          >
            <div class="lang-info">
                <span class="lang-flag" v-if="language.code === 'en'">🇺🇸</span>
                <span class="lang-flag" v-else-if="language.code === 'zh-cn'">🇨🇳</span>
                <span class="lang-flag" v-else-if="language.code === 'zh-tw'">🇭🇰</span>
                <span class="lang-flag" v-else-if="language.code === 'ja'">🇯🇵</span>
                <span class="lang-flag" v-else-if="language.code === 'ko'">🇰🇷</span>
                <span class="lang-name">{{ language.name }}</span>
            </div>
            <i class="fas fa-check check-icon" v-if="currentLang === language.code"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { availableLanguages, setLanguage, currentLanguage, t } from '@/i18n';

export default {
  name: 'LanguageModal',
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const selectLanguage = (languageCode) => {
      setLanguage(languageCode);
      close();
    };

    return {
      languages: availableLanguages,
      currentLang: computed(() => currentLanguage.value),
      close,
      selectLanguage,
      t,
    };
  },
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(2, 6, 23, 0.8); /* var(--bg-darker) opacity */
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 320px;
  background: rgba(30, 41, 59, 0.9); /* var(--bg-card) */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.5);
}

.modal-title {
  margin: 0;
  font-family: var(--font-primary);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
  }
}

.modal-body {
  padding: 1rem;
}

.language-list {
  display: flex;
  flex-direction: column;
  /* gap: 0.5rem; Replaced with margin for iOS < 14.5 compatibility */
}

.language-list > * + * {
  margin-top: 0.5rem;
}

.lang-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
      background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
      background: rgba(192, 132, 252, 0.1); /* primary color tint */
      border-color: rgba(192, 132, 252, 0.5);
  }
}

.lang-info {
    display: flex;
    align-items: center;
    /* gap: 0.8rem; Replaced with margin for iOS < 14.5 compatibility */
}

.lang-info > * + * {
    margin-left: 0.8rem;
}

.lang-flag {
    font-size: 1.2rem;
}

.lang-name {
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 500;
}

.check-icon {
    color: var(--primary);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
