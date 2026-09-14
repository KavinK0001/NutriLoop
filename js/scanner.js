const Scanner = {
    init(app) {
        this.app = app;
        this.setupEventListeners();
    },

    setupEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const resetBtn = document.getElementById('reset-scanner');

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.processImage(e.target.files[0]);
            }
        });

        resetBtn.addEventListener('click', () => this.reset());
    },

    async processImage(file) {
        const loading = document.getElementById('scanner-loading');
        const result = document.getElementById('scanner-result');
        const dropZone = document.getElementById('drop-zone');
        const resetBtn = document.getElementById('reset-scanner');
        const statusText = document.getElementById('scanner-status');

        // UI Transition
        dropZone.style.display = 'none';
        loading.style.display = 'block';
        result.style.display = 'none';
        resetBtn.style.display = 'none';

        const statuses = [
            "Analyzing tray contents...",
            "Matching with today's menu...",
            "Calculating nutritional balance...",
            "Finalizing grade..."
        ];

        // Simulate async API pipeline
        for (const status of statuses) {
            statusText.textContent = status;
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        this.renderResult();

        loading.style.display = 'none';
        result.style.display = 'block';
        resetBtn.style.display = 'inline-block';
    },

    renderResult() {
        const resultContainer = document.getElementById('scanner-result');
        const items = this.app.getCurrentMenu();

        // Mock Logic: Randomly select 2 items detected
        const detected = [];
        const shuffle = [...items].sort(() => 0.5 - Math.random());
        for (let i = 0; i < Math.min(2, shuffle.length); i++) {
            detected.push(shuffle[i]);
        }

        const totalCals = detected.reduce((sum, item) => sum + item.calories, 0);

        // Random grade logic
        const score = Math.random() * 100;
        let grade = 'F';
        let gradeClass = 'grade-F';

        if (score > 90) { grade = 'S'; gradeClass = 'grade-S'; }
        else if (score > 70) { grade = 'A'; gradeClass = 'grade-A'; }
        else if (score > 50) { grade = 'B'; gradeClass = 'grade-B'; }
        else if (score > 30) { grade = 'C'; gradeClass = 'grade-C'; }

        resultContainer.innerHTML = `
            <div class="card nutrition-card">
                <div class="grade-badge ${gradeClass}">${grade}-Tier Plate</div>
                <h3 style="margin-bottom: 0.5rem;">Analysis Summary</h3>
                <div style="margin-bottom: 1rem;">
                    <strong>Detected Items:</strong><br>
                    ${detected.map(item => `• ${item.name} (${item.calories} kcal)`).join('<br>')}
                </div>
                <div style="font-size: 1.1rem; font-weight: 600;">
                    Total Calories: ${totalCals} kcal
                </div>
                <p style="font-size: 0.875rem; color: var(--muted-foreground); margin-top: 1rem;">
                    ${this.getGradeComment(grade)}
                </p>
            </div>
        `;
    },

    getGradeComment(grade) {
        const comments = {
            'S': 'Perfect balance of macros! You are fueling your body optimally.',
            'A': 'Excellent choice. Highly nutrient-dense plate.',
            'B': 'Good, but consider adding more greens or protein.',
            'C': 'Moderate. A bit high on processed carbs/fats.',
            'F': 'Low nutritional value. Try adding a fruit or vegetable!'
        };
        return comments[grade] || 'Keep tracking your meals!';
    },

    reset() {
        document.getElementById('drop-zone').style.display = 'block';
        document.getElementById('scanner-result').style.display = 'none';
        document.getElementById('reset-scanner').style.display = 'none';
        document.getElementById('file-input').value = '';
    }
};
