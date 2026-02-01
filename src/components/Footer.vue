<template>
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-text-wrapper">
                    <p class="footer-text">
                        <span class="footer-copyright">© 2026 PGNLZ MAX. ALL RIGHTS RESERVED.</span>
                        <span class="footer-divider">•</span>
                        <span class="footer-built">
                            Env: {{ envLabel }} - v1.0.0
                        </span>
                    </p>
                    <div class="footer-links-row">
                        <a href="#" class="footer-link">Whitepaper</a>
                    </div>
                </div>
                <div class="footer-social">
                    <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" class="footer-social-link" title="Telegram">
                        <i class="fab fa-telegram-plane"></i>
                    </a>
                    <a href="https://twitter.com/your_twitter" target="_blank" rel="noopener noreferrer" class="footer-social-link" title="Twitter">
                        <i class="fab fa-twitter"></i>
                    </a>
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
            // "测试用B，正式环境用A"
            return APP_ENV === 'PROD' ? 'A' : 'B';
        }
    }
}
</script>

<style scoped lang="scss">
.main-footer {
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    padding: 3rem 0;
    margin-top: auto; /* Ensure it pushes down */
}

.footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.footer-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
}

.footer-copyright {
    font-family: var(--font-code);
    color: var(--text-primary);
    font-weight: 500;
}

.footer-divider {
    color: var(--text-muted);
}

.footer-built {
    font-family: var(--font-code);
    color: var(--text-muted);
    font-size: 0.8rem;
    background: var(--bg-darker);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border);
}

.footer-links-row {
    margin-top: 0.5rem;
}

.footer-link {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color var(--transition);
    
    &:hover {
        color: var(--cyan);
        text-decoration: underline;
    }
}

.footer-social {
    display: flex;
    gap: 1rem;
}

.footer-social-link {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-darker);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition);
    font-size: 1.2rem;
}

.footer-social-link:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
}

@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }
    
    .footer-text {
        justify-content: center;
        flex-direction: column;
    }
    
    .footer-divider {
        display: none;
    }
}
</style>
