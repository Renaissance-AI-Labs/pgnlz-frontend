<template>
  <div class="orders-view-container">
    <div class="background-animation">
      <div class="cyber-grid"></div>
      <div class="cyber-glow-overlay"></div>
    </div>

    <div class="page-content">
      <div class="header-section">
        <h2 class="page-title" :data-text="t('orders.title')">{{ t('orders.title') }}</h2>
        <p class="page-intro">
          {{ t('orders.intro') }}
        </p>
      </div>

      <div class="right-section">
        <MyOrders />
      </div>
    </div>
  </div>
</template>

<script>
import MyOrders from '@/components/MyOrders.vue';
import { t } from '@/i18n';

export default {
  name: 'OrdersView',
  components: {
    MyOrders
  },
  setup() {
    return { t };
  }
}
</script>

<style scoped>
.orders-view-container {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px;
  position: relative;
  flex-direction: column;
}

.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
  pointer-events: none;
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

.page-content {
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* gap: 1rem; */
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* gap: 1.5rem; Replaced with margin for iOS < 14.5 compatibility */
  width: 100%;
  margin-bottom: 1rem;
}

.header-section > * + * {
  margin-top: 1.5rem;
}

.page-title {
  font-family: var(--font-code);
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-align: left;
  position: relative;
  text-shadow: 
    0 0 20px rgba(192, 132, 252, 0.6);
  letter-spacing: -1px;
  line-height: 1;
  background: linear-gradient(135deg, #fff 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-intro {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: left;
  max-width: 480px;
  line-height: 1.6;
  margin: 0;
  padding: 0 0 0 10px;
  font-weight: 400;
  border-left: 3px solid var(--primary);
  opacity: 0.9;
}

.right-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* gap: 2rem; Replaced with margin for iOS < 14.5 compatibility */
  width: 100%;
}

.right-section > * + * {
  margin-top: 2rem;
}

@media (min-width: 1024px) {
  .page-content {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6rem;
    padding-top: 4rem;
  }
  
  .header-section {
    width: 40%;
    margin-bottom: 0;
    position: sticky;
    top: 100px;
    padding-top: 2rem;
  }

  .page-title {
    font-size: 5rem;
    margin-bottom: 2rem;
  }

  .page-intro {
    font-size: 1.2rem;
    max-width: 100%;
  }
  
  .right-section {
    width: 55%;
    gap: 3rem;
  }
}
</style>