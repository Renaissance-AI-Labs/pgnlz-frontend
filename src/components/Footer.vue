<template>
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-content">
                <!-- Left Side: Social & Brand -->
                <div class="footer-primary">
                    <div class="footer-social-column">
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
                    
                    <div class="footer-brand-section">
                        <div class="brand-logo-large">
                            <span class="logo-text">PGNLZ MAX</span>
                        </div>
                        <p class="brand-slogan">Mobile First Web3 Experience</p>
                    </div>
                </div>

                <!-- Right Side: Links (Optional, can be used for Whitepaper text link if preferred) -->
                <div class="footer-links">
                     <a href="#" class="footer-nav-link">Whitepaper</a>
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
    padding: 4rem 0 2rem;
    margin-top: auto;
    position: relative;
    overflow: hidden;
}

/* Subtle grid background effect */
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
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4rem;
}

.footer-primary {
    display: flex;
    align-items: center;
    gap: 3rem;
}

.footer-social-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.footer-social-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
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
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(192, 132, 252, 0.2);
}

.footer-brand-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.brand-logo-large .logo-text {
    font-family: var(--font-code);
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient-1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
}

.brand-slogan {
    color: var(--text-muted);
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.footer-links {
    display: flex;
    gap: 2rem;
}

.footer-nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition);
    position: relative;
}

.footer-nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: width var(--transition);
}

.footer-nav-link:hover {
    color: var(--primary);
}

.footer-nav-link:hover::after {
    width: 100%;
}

/* Bottom Bar */
.footer-bottom-bar {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
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
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-family: var(--font-code);
    color: var(--text-muted);
    font-size: 0.75rem;
}

.env-label {
    color: var(--text-secondary);
}

.ver-label {
    opacity: 0.6;
}

@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        gap: 3rem;
        align-items: center;
        text-align: center;
    }
    
    .footer-primary {
        flex-direction: column;
        gap: 2rem;
    }
    
    .footer-social-column {
        flex-direction: row;
    }
    
    .footer-social-btn:hover {
        transform: translateY(-5px);
    }
    
    .footer-bottom-bar {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>
