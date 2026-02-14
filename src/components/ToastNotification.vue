<template>
  <transition name="toast-fade">
    <div v-if="notification.visible" class="toast-notification">
      <div class="toast-content" :class="notification.type">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #c084fc;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </span>
        <span class="message">{{ notification.message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { notificationState } from '../services/notification';

export default {
  name: 'ToastNotification',
  setup() {
    return {
      notification: notificationState,
    };
  }
};
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none; /* Allows clicking through if needed, but toast itself should probably block or be transparent */
}

.toast-content {
  background: rgba(15, 23, 42, 0.9); /* Dark background matching theme */
  backdrop-filter: blur(12px);
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid rgba(192, 132, 252, 0.3); /* Primary border color */
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(192, 132, 252, 0.2); /* Glow effect */
  
  display: flex;
  align-items: center;
  /* gap: 10px; Replaced with margin for iOS < 14.5 compatibility */
  pointer-events: auto;
}

.toast-content > * + * {
  margin-left: 10px;
}

.message {
  color: #fff;
  font-family: var(--font-code); /* Use code font */
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.icon {
  font-size: 1.1rem;
}

/* Animation */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>