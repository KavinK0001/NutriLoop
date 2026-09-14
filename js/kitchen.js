const Kitchen = {
    init(app) {
        this.app = app;
        this.setupEventListeners();

        // Whenever the Kitchen view becomes active, we refresh the data
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.renderAnalytics();
                }
            });
        });

        const kitchenView = document.getElementById('view-kitchen');
        observer.observe(kitchenView, { attributes: true, attributeFilter: ['class'] });
    },

    setupEventListeners() {
        // Login Form
        document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());

        // Logout Button
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

        // Reset Data
        document.getElementById('clear-analytics').addEventListener('click', () => {
            if (confirm('Clear all historical order data?')) {
                localStorage.setItem('nutriloop_all_orders', '[]');
                this.renderAnalytics();
            }
        });
    },

    handleLogin() {
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (user === 'admin' && pass === 'password') {
            this.app.state.isKitchenAuthenticated = true;
            errorEl.style.display = 'none';
            this.app.switchView('kitchen');
        } else {
            errorEl.style.display = 'block';
        }
    },

    handleLogout() {
        this.app.state.isKitchenAuthenticated = false;
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        this.app.switchView('student');
    },

    renderAnalytics() {
        const container = document.getElementById('analytics-container');
        const allOrders = JSON.parse(localStorage.getItem('nutriloop_all_orders') || '[]');

        if (!this.app.state.activeDay) {
            container.innerHTML = '<p>No menu data available.</p>';
            return;
        }

        const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];
        let fullHtml = '';

        slots.forEach(slot => {
            const items = this.app.getCurrentMenu(slot);

            const totals = {};
            allOrders.forEach(order => {
                for (const [id, qty] of Object.entries(order)) {
                    if (id.startsWith(slot)) {
                        totals[id] = (totals[id] || 0) + qty;
                    }
                }
            });

            const slotItemsHtml = items.map((item, index) => {
                const id = item.id;
                const count = totals[id] || 0;
                return `
                    <div class="stat-card">
                        <span class="stat-val">${count}</span>
                        <span class="stat-label">${item.name}</span>
                    </div>
                `;
            }).join('');

            fullHtml += `
                <div style="grid-column: 1 / -1; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem;">
                    <h3 style="text-transform: capitalize;">${slot} Demand</h3>
                </div>
                <div style="display: contents;">${slotItemsHtml}</div>
            `;
        });

        container.innerHTML = fullHtml || '<p>No orders submitted yet.</p>';
    }
};
