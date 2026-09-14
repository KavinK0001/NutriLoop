const App = {
    state: {
        currentView: 'student',
        menuData: [],
        currentSlot: 'lunch',
        activeDay: null,
        isKitchenAuthenticated: false,
    },

    async init() {
        console.log('NutriLoop initializing...');
        await this.loadMenu();

        // Initialize modules FIRST so they have access to the app state
        Student.init(this);
        Kitchen.init(this);
        Scanner.init(this);

        this.setupRouting();
        this.detectCurrentSlot();
        this.updateSlotDisplay();
    },

    detectCurrentSlot() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) this.state.currentSlot = 'breakfast';
        else if (hour >= 11 && hour < 16) this.state.currentSlot = 'lunch';
        else if (hour >= 16 && hour < 19) this.state.currentSlot = 'snacks';
        else this.state.currentSlot = 'dinner';

        // Set the initial tab active state
        const tab = document.querySelector(`.slot-tab[data-slot="${this.state.currentSlot}"]`);
        if (tab) tab.click();
    },

    async loadMenu() {
        try {
            console.log('Fetching menu data...');
            const response = await fetch('data/menu_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.state.menuData = await response.json();
            console.log('Menu data loaded successfully:', this.state.menuData.length, 'days found');
            this.determineActiveDay();
            console.log('Active day determined:', this.state.activeDay ? this.state.activeDay.date : 'None');
        } catch (error) {
            console.error('Error loading menu data:', error);
            this.state.activeDay = null;
        }
    },

    determineActiveDay() {
        // Use local date in YYYY-MM-DD format to match JSON keys
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - offset)).toISOString().split('T')[0];

        const found = this.state.menuData.find(day => day.date === localISOTime);
        this.state.activeDay = found || this.state.menuData[this.state.menuData.length - 1];
    },

    setupRouting() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.getAttribute('data-view');
                if (view) this.switchView(view);
            });
        });

        document.querySelectorAll('.slot-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const slot = tab.getAttribute('data-slot');
                this.switchSlot(slot);
            });
        });
    },

    switchSlot(slotId) {
        this.state.currentSlot = slotId;

        document.querySelectorAll('.slot-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-slot') === slotId);
        });

        this.updateSlotDisplay();

        // Notify Student module to re-render
        if (typeof Student !== 'undefined') {
            Student.renderMenu();
        }
    },

    switchView(viewId) {
        // Auth Guard for Kitchen
        if (viewId === 'kitchen' && !this.state.isKitchenAuthenticated) {
            this.switchView('kitchen-login');
            return;
        }

        this.state.currentView = viewId;

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-view') === viewId);
        });

        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewId}`);
        });
    },

    updateSlotDisplay() {
        const slotEl = document.getElementById('current-slot');
        const slotName = this.state.currentSlot.charAt(0).toUpperCase() + this.state.currentSlot.slice(1);
        const timing = this.state.activeDay ? this.state.activeDay[this.state.currentSlot].timing : 'N/A';
        slotEl.textContent = `${slotName} (${timing})`;
    },

    getCurrentMenu(slotId) {
        if (!this.state.activeDay) return [];

        const slot = slotId || this.state.currentSlot;
        const items = this.state.activeDay[slot]?.items || [];

        const mapEmojiToClass = (text) => {
            if (!text) return 'yellow';
            if (text.includes('🟢')) return 'green';
            if (text.includes('🟡')) return 'yellow';
            if (text.includes('🔴')) return 'red';
            return 'yellow';
        };

        const mapClassToLabel = (className) => {
            if (className === 'green') return 'Good';
            if (className === 'red') return 'Bad';
            return 'Mid';
        };

        return items.map((item, index) => {
            const pClass = mapEmojiToClass(item.protein);
            const cClass = mapEmojiToClass(item.carbs);
            const fClass = mapEmojiToClass(item.fats);

            return {
                id: `${slot}-${index}`,
                name: item.name,
                calories: 'N/A',
                macroGrades: {
                    protein: pClass,
                    carbs: cClass,
                    fat: fClass
                },
                macroLabels: {
                    protein: mapClassToLabel(pClass),
                    carbs: mapClassToLabel(cClass),
                    fat: mapClassToLabel(fClass)
                },
                macros: {
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fats
                }
            };
        });
    },

    showToast(message) {
        const toast = document.getElementById('surplus-toast');
        const msgEl = document.getElementById('toast-message');
        msgEl.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
