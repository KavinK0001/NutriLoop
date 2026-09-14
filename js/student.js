const Student = {
    init(app) {
        this.app = app;
        this.choices = JSON.parse(localStorage.getItem('nutriloop_student_choices') || '{}');

        this.renderMenu();
        this.setupEventListeners();
        this.simulateSurplusAlert();
    },

    renderMenu() {
        const container = document.getElementById('menu-container');
        const items = this.app.getCurrentMenu();

        if (items.length === 0) {
            container.innerHTML = '<p>No items available for the current slot.</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="menu-item">
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: var(--muted-foreground); display: flex; flex-direction: column; gap: 0.1rem; align-items: flex-start;">
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span class="dot dot-${item.macroGrades.protein}"></span>
                            <span>Protein: ${item.macroLabels.protein}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span class="dot dot-${item.macroGrades.carbs}"></span>
                            <span>Carbs: ${item.macroLabels.carbs}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span class="dot dot-${item.macroGrades.fat}"></span>
                            <span>Fats: ${item.macroLabels.fat}</span>
                        </div>
                    </div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-id="${item.id}" data-dir="dec">−</button>
                    <span class="qty-val" id="qty-${item.id}">${this.choices[item.id] || 0}</span>
                    <button class="qty-btn" data-id="${item.id}" data-dir="inc">+</button>
                </div>
            </div>
        `).join('');
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const id = e.target.getAttribute('data-id');
                const dir = e.target.getAttribute('data-dir');
                this.updateQuantity(id, dir);
            }
        });

        document.getElementById('submit-choices').addEventListener('click', () => {
            this.submitChoices(true);
        });

        document.getElementById('submit-current').addEventListener('click', () => {
            this.submitChoices(false);
        });
    },

    isSlotActive(slot) {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const time = hour + minutes / 60;

        const windows = {
            breakfast: { start: 7, end: 9 },
            lunch: { start: 12.5, end: 14.5 },
            snacks: { start: 16.5, end: 18.25 },
            dinner: { start: 19, end: 21 }
        };

        const window = windows[slot];
        return time >= window.start && time <= window.end;
    },

    updateQuantity(id, dir) {
        let current = parseInt(this.choices[id] || 0);
        if (dir === 'inc') current++;
        else if (dir === 'dec' && current > 0) current--;

        this.choices[id] = current;
        document.getElementById(`qty-${id}`).textContent = current;
        localStorage.setItem('nutriloop_student_choices', JSON.stringify(this.choices));
    },

    submitChoices(isAllDay) {
        const allOrders = JSON.parse(localStorage.getItem('nutriloop_all_orders') || '[]');

        if (isAllDay) {
            // Check if any submitted slot is currently active
            const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];
            const activeSlots = slots.filter(slot => this.isSlotActive(slot));

            if (activeSlots.length > 0) {
                const slotNames = activeSlots.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
                alert(`Cannot submit choices for ${slotNames} as the meal is currently being served!`);
                return;
            }
            allOrders.push({ ...this.choices, timestamp: Date.now() });
        } else {
            const slot = this.app.state.currentSlot;

            if (this.isSlotActive(slot)) {
                alert(`The ${slot} meal is currently being served. Choices for this slot are now locked.`);
                return;
            }

            const currentSlotChoices = {};
            for (const [id, qty] of Object.entries(this.choices)) {
                if (id.startsWith(slot)) {
                    currentSlotChoices[id] = qty;
                }
            }

            if (Object.keys(currentSlotChoices).length === 0) {
                alert('Please select at least one item for the current slot.');
                return;
            }
            allOrders.push({ ...currentSlotChoices, timestamp: Date.now() });
        }

        localStorage.setItem('nutriloop_all_orders', JSON.stringify(allOrders));

        const msg = isAllDay
            ? 'All day choices submitted! Thank you for helping reduce food waste.'
            : `Choices for ${this.app.state.currentSlot} submitted!`;

        alert(msg);

        if (isAllDay) {
            this.choices = {};
        } else {
            const slot = this.app.state.currentSlot;
            for (const id in this.choices) {
                if (id.startsWith(slot)) delete this.choices[id];
            }
        }

        localStorage.setItem('nutriloop_student_choices', JSON.stringify(this.choices));
        this.renderMenu();
    },

    simulateSurplusAlert() {
        // Randomly show a surplus alert after a few seconds to demo the feature
        setTimeout(() => {
            const items = this.app.getCurrentMenu();
            if (items.length > 0) {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                this.app.showToast(`Extra portions of ${randomItem.name} available for the next 15 mins!`);
            }
        }, 5000);
    }
};
