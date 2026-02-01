<template>
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="brand-social-wrapper">
                    <div class="brand-logo-large">
                        <span class="logo-text">PGNLZ MAX</span>
                    </div>
                    <div class="footer-social-row">
                        <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Telegram">
                            <i class="fab fa-telegram-plane"></i>
                        </a>
                        <a href="https://twitter.com/your_twitter" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="footer-social-btn" title="Whitepaper">
                            <i class="fas fa-file-alt"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom-bar">
                <div class="copyright-section">
                    © 2026 PGNLZ MAX. ALL RIGHTS RESERVED.
                </div>
                <div class="version-badge">
                    <span class="env-label">Env: {{ envLabel }}</span>
                    <span class="ver-label">v1.0.0</span>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
import { APP_ENV } from '@/services/environment.js';

export default {
    name: 'Footer',
    computed: {
        envLabel() {
            return APP_ENV === 'PROD' ? 'A' : 'B';
        }
    }
}
</script>

<style scoped lang="scss">
.main-footer {
    background: var(--bg-darker);
    border-top: 1px solid var(--border);
    padding: 2rem 0 1rem; /* Compressed padding */
    margin-top: auto;
    position: relative;
    overflow: hidden;
}

.main-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(rgba(192, 132, 252, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(192, 132, 252, 0.03) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
}

.footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
}

.footer-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
}

.brand-social-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
}

.brand-logo-large .logo-text {
    font-family: var(--font-code);
    font-size: 1.8rem;
    font-weight: 800;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
}

.footer-social-row {
    display: flex;
    gap: 1rem;
}

.footer-social-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition);
    font-size: 1rem;
}

.footer-social-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(192, 132, 252, 0.2);
}

/* Bottom Bar */
.footer-bottom-bar {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
}

.copyright-section {
    color: var(--text-muted);
    font-family: var(--font-code);
}

.version-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-family: var(--font-code);
    color: var(--text-muted);
    font-size: 0.7rem;
}

.env-label {
    color: var(--text-secondary);
}

.ver-label {
    opacity: 0.6;
}

@media (max-width: 768px) {
    .brand-social-wrapper {
        align-items: center;
        text-align: center;
    }
    
    .footer-bottom-bar {
        flex-direction: column;
        gap: 0.8rem;
        text-align: center;
    }
}
</style>
