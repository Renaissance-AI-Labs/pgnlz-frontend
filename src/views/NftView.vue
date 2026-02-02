<template>
  <div class="nft-page">
    <div class="content-wrapper">
      <div class="icon-wrapper">
        <i class="fas fa-cube"></i>
      </div>
      <h1>NFT Marketplace</h1>
      <p class="subtitle">Coming Soon</p>
      <p class="description">
        We are building something amazing for you. The NFT marketplace will allow you to trade and collect unique digital assets.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NftView'
}
</script>

<style scoped>
.nft-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.content-wrapper {
  max-width: 600px;
  background: var(--bg-card);
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}

.icon-wrapper {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

h1 {
  font-family: var(--font-code);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: var(--gradient-1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.description {
  color: var(--text-muted);
  line-height: 1.6;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
</style>
