import { reactive } from 'vue';

export const notificationState = reactive({
  visible: false,
  message: '',
  type: '',
  timeoutId: null,
});

export function showToast(message, type = '', duration = 3000) {
  if (notificationState.timeoutId) {
    clearTimeout(notificationState.timeoutId);
  }

  notificationState.message = message;
  notificationState.type = type;
  notificationState.visible = true;

  notificationState.timeoutId = setTimeout(() => {
    notificationState.visible = false;
  }, duration);
}
