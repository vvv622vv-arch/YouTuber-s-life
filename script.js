const Game = {
    money: 1500, subs: 0, videos: [], inventory: [],
    channelName: "قناة الأساطير", avatar: "👤", currentFilter: 'all',
    activeGv: { active: false, timer: 0, item: "", participants: 0 },

    init() {
        this.load();
        this.generateAmazon();
        this.updateUI();
        this.renderVideos();
        this.startEngine();
    },

    save() {
        const data = {
            money: this.money, subs: this.subs, videos: this.videos,
            inventory: this.inventory, channelName: this.channelName, avatar: this.avatar
        };
        localStorage.setItem('YT_SIM_V5_FIXED', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_SIM_V5_FIXED');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    publishVideo() {
        const titleInput = document.getElementById('video-title');
        const styleInput = document.getElementById('video-style');
        
        if (!titleInput.value.trim()) {
            this.showToast("⚠️ يا بطل اكتب عنوان الفيديو!", "error");
            return;
        }

        let baseViews = Math.floor(Math.random() * 5000 + 100);
        this.videos.unshift({
            title: titleInput.value,
            style: styleInput.value,
            views: baseViews
        });

        this.subs += Math.floor(baseViews * 0.02);
        this.money += Math.floor(baseViews * 0.012);
        
        titleInput.value = "";
        this.showToast("🚀 تم نشر المقطع بنجاح!", "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    generateAmazon() {
        const products = [
            {n: "Sony PS5 Pro", p: 700, i: "🎮"},
            {n: "Gaming PC Ultra", p: 3000, i: "🖥️"},
            {n: "iPhone 15 Max", p: 1200, i: "📱"},
            {n: "Mouse & Keyboard", p: 150, i: "⌨️"}
        ];
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        for (let i = 0; i < 50; i++) {
            const it = products[i % products.length];
            const price = it.p + (i * 12);
            grid.innerHTML += `
                <div class="v-card" style="padding: 20px; text-align: center;">
                    <div style="font-size: 50px;">${it.i}</div>
                    <h3 style="margin: 15px 0;">${it.n}</h3>
                    <p style="color: #e67e22; font-weight: bold; font-size: 24px;">$${price}</p>
                    <button class="btn-action blue" style="padding: 10px; font-size: 16px; margin-top: 10px;" onclick="Game.buyItem('${it.n}', ${price})">شراء</button>
                </div>`;
        }
    },

    buyItem(n, p) {
        if (this.money >= p) {
            this.money -= p;
            this.inventory.push(n);
            this.showToast(`🛍️ تم شراء ${n} بنجاح!`, "success");
            this.updateInventorySelect();
            this.save(); this.updateUI();
        } else this.showToast("❌ فلوسك ما تكفي يا بطل!", "error");
    },

    updateInventorySelect() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((it, idx) => `<option value="${idx}">${it}</option>`).join('')
            : "<option>المخزن فارغ (اشترِ من المتجر)</option>";
    },

    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("⚠️ ما عندك جوائز!", "error");
        if (this.activeGv.active) return this.showToast("⚠️ فيه سحب شغال حالياً!", "error");

        const idx = document.getElementById('gv-inventory-select').value;
        const it = this.inventory[idx];
        this.activeGv = { active: true, timer: 20, item: it, participants: 0 };
        this.inventory.splice(idx, 1);

        this.videos.unshift({ title: `🎁 قيفاوي مباشر على ${it}`, style: "🎁 قيفاوي", views: 0 });
        document.getElementById('gv-live-box').classList.remove('hidden');
        this.updateInventorySelect();
        this.renderVideos();
    },

    startEngine() {
        setInterval(() => {
            if (this.activeGv.active) {
                this.activeGv.timer--;
                this.activeGv.participants += Math.floor(this.subs * 0.1 + Math.random() * 100);
                if (this.activeGv.timer <= 0) this.endGiveaway();
                this.updateGvUI();
            }
        }, 1000);
    },

    endGiveaway() {
        this.activeGv.active = false;
        document.getElementById('gv-live-box').classList.add('hidden');
        const bonus = Math.floor(this.activeGv.participants * 0.1);
        this.subs += bonus;
        this.videos[0].views = this.activeGv.participants;
        this.showToast(`🎊 مبروك! كسبت ${bonus} مشترك!`, "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    updateGvUI() {
        document.getElementById('live-item').innerText = this.activeGv.item;
        document.getElementById('live-count').innerText = this.activeGv.participants.toLocaleString();
        document.getElementById('live-timer').innerText = this.activeGv.timer + " ث";
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        cont.innerHTML = this.videos.map(v => `
            <div class="v-card">
                <div class="v-thumb">${v.style.includes('Shorts') ? '📱' : '🎬'}</div>
                <div style="padding: 15px;">
                    <h3>${v.title}</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                </div>
            </div>
        `).join('');
    },

    switchPage(id, btn) {
        document.querySelectorAll('.page').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (id === 'page-giveaway') this.updateInventorySelect();
    },

    updateUI() {
        document.getElementById('stat-money').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-money-bank').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-subs').innerText = this.subs.toLocaleString();
        document.getElementById('channel-name-display').innerText = this.channelName;
        document.getElementById('pfp-display').innerText = this.avatar;
    },

    showToast(m, t) {
        const el = document.getElementById('toast-container');
        el.innerText = m; el.className = `toast-${t}`;
        el.classList.remove('toast-hidden');
        setTimeout(() => el.classList.add('toast-hidden'), 3000);
    },

    customizeChannel() {
        const n = prompt("اسم القناة الجديد:", this.channelName);
        if (n) { this.channelName = n; this.save(); this.updateUI(); }
    },

    resetGame() { if(confirm("حذف كل شيء؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();
