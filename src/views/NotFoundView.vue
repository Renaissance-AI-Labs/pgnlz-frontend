<template>
  <div class="not-found-page">
    <div class="background-glow glow-left"></div>
    <div class="background-glow glow-right"></div>

    <div class="not-found-card">
      <div class="status-code">404</div>
      <h1 class="title">页面不存在</h1>
      <p class="desc">
        你访问的页面不存在，或当前地址没有访问权限。
      </p>
      <router-link to="/" class="back-btn">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
};
</script>

<style scoped>
.not-found-page {
  position: relative;
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(192, 132, 252, 0.16), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(34, 211, 238, 0.14), transparent 42%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.96));
}

.not-found-card {
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
  padding: 1.6rem 1.2rem;
  text-align: center;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(192, 132, 252, 0.25);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.status-code {
  font-family: var(--font-code);
  font-size: clamp(3.4rem, 12vw, 5.2rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  margin-bottom: 0.7rem;
  background: linear-gradient(90deg, #c084fc, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title {
  font-size: 1.45rem;
  color: var(--text-primary);
  margin: 0;
}

.desc {
  margin: 0.75rem 0 1.2rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 138px;
  height: 40px;
  padding: 0 1rem;
  border-radius: 10px;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(90deg, #a855f7, #06b6d4);
  box-shadow: 0 8px 18px rgba(126, 34, 206, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(126, 34, 206, 0.45);
}

.background-glow {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  filter: blur(36px);
  opacity: 0.45;
  pointer-events: none;
}

.glow-left {
  left: -70px;
  top: 15%;
  background: rgba(192, 132, 252, 0.7);
}

.glow-right {
  right: -80px;
  bottom: 10%;
  background: rgba(34, 211, 238, 0.65);
}

@media (max-width: 768px) {
  .not-found-card {
    padding: 1.4rem 1rem;
  }
}
</style>
