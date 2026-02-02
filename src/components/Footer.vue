<template>
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="brand-social-wrapper">
                    <div class="brand-logo-large">
                        <img src="/asset/images/logo/pgnlz-logo.png" alt="PGNLZ Logo" class="footer-logo-img">
                        <!-- <span class="logo-text">PGNLZ MAX</span> -->
                    </div>
                    <div class="footer-social-row">
                        <a href="https://t.me/RsPGNLZ" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Telegram">
                            <i class="fab fa-telegram-plane"></i>
                        </a>
                        <a href="https://x.com/wttpp81197815?s=11&t=eP2dub4o-vYMAx8asgwuPw" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <!-- <a href="https://pgnlz.com/PGNLZbook.pdf" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Whitepaper">
                            <i class="fas fa-file-alt"></i>
                        </a> -->
                    </div>
                </div>
            </div>

            <div class="footer-bottom-bar">
                <div class="copyright-group">
                    <div class="copyright-section">
                        © 2026 PGNLZ MAX. ALL RIGHTS RESERVED.
                    </div>
                    <div class="version-badge">
                        <span class="ver-label">{{ envLabel }}-1.0.0</span>
                    </div>
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
    padding: 3rem 0 1.5rem;
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
    padding: 0 1.5rem;
    position: relative;
    z-index: 1;
}

.footer-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
    /* Removed padding/margin that might cause centering visual issues */
}

.brand-social-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start; /* Strictly Left Aligned */
    padding-left: 0; /* Ensure no left padding */
}

.brand-logo-large {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.footer-logo-img {
    height: 30px;
    width: auto;
}

.brand-logo-large .logo-text {
    font-family: var(--font-code);
    font-size: 1.5rem;
    font-weight: 800;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.footer-social-row {
    display: flex;
    gap: 1rem;
}

.footer-social-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition);
    font-size: 1.1rem;
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
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.85rem;
}

.copyright-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
}

.copyright-section {
    color: var(--text-muted);
    font-family: var(--font-code);
    text-align: left;
}

.version-badge {
    display: inline-flex;
    align-items: center;
    background: transparent;
    padding: 0;
    border: none;
    font-family: var(--font-code);
    color: var(--text-muted);
    font-size: 0.75rem;
    opacity: 0.5;
}

.env-label {
    display: none;
}

.ver-label {
    opacity: 1;
}

@media (max-width: 768px) {
    .brand-social-wrapper {
        align-items: flex-start; 
        text-align: left;
    }
    
    .footer-bottom-bar {
        padding-top: 1rem;
    }
}
</style>
