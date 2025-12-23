const Game = {
    money: 1000, subs: 0, videos: [], inventory: [],
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
        localStorage.setItem('YT_SIM_FINAL_FIX', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_SIM_FINAL_FIX');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    // دالة النشر (إصلاح النشر)
    publishVideo() {
        const titleInput = document.getElementById('video-title');
        const styleInput = document.getElementById('video-style');
        
        if (!titleInput.value.trim()) {
            this.showToast("⚠️ اكتب عنوان الفيديو يا ذكي!", "error");
            return;
        }

        let views = Math.floor(Math.random() * 6000 + 50);
        this.videos.unshift({
            title: titleInput.value,
            style: styleInput.value,
            views: views
        });

        this.subs += Math.floor(views * 0.02);
        this.money += Math.floor(views * 0.015);
        titleInput.value = "";
        this.showToast("🚀 تم نشر المقطع!", "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    generateAmazon() {
        const products = [
            {n: "Sony PS5 Pro", p: 700, i: "🎮"},
            {n: "PC High-End", p: 2500, i: "🖥️"},
            {n: "iPhone 16", p: 1200, i: "📱"},
            {n: "شاشة للألعاب", p: 400, i: "📺"}
        ];
        const cont = document.getElementById('amazon-products');
        cont.innerHTML = "";
        for (let i = 0; i < 60; i++) {
            const it = products[i % products.length];
            const pr = it.p + (i * 10);
            cont.innerHTML += `
                <div class="v-card" style="padding:15px">
                    <div style="font-size:40px">${it.i}</div>
                    <h3>${it.n}</h3>
                    <p style="color:red; font-weight:bold">$${pr}</p>
                    <button onclick="Game.buyItem('${it.n}', ${pr})" style="width:100%; padding:8px; cursor:pointer">شراء</button>
                </div>`;
        }
    },

    buyItem(n, p) {
        if (this.money >= p) {
            this.money -= p;
            this.inventory.push(n);
            this.showToast(`🛍️ تم الشراء: ${n}`, "success");
            this.updateInventorySelect();
            this.save(); this.updateUI();
        } else this.showToast("فلوسك ما تكفي!", "error");
    },

    updateInventorySelect() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((it, idx) => `<option value="${idx}">${it}</option>`).join('')
            : "<option>المخزن فارغ</option>";
    },

    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("اشترِ جائزة أولاً!", "error");
        if (this.activeGv.active) return this.showToast("هناك سحب جارٍ!", "error");

        const idx = document.getElementById('gv-inventory-select').value;
        const it = this.inventory[idx];
        this.activeGv = { active: true, timer: 30, item: it, participants: 0 };
        this.inventory.splice(idx, 1);

        this.videos.unshift({ title: `🎁 مسابقة كبرى على ${it}`, style: "🎁 قيفاوي", views: 0 });
        document.getElementById('gv-live-panel').classList.remove('hidden');
        this.updateInventorySelect();
        this.renderVideos();
    },

    startEngine() {
        setInterval(() => {
            if (this.activeGv.active) {
                this.activeGv.timer--;
                this.activeGv.participants += Math.floor(this.subs * 0.1 + Math.random() * 50);
                if (this.activeGv.timer <= 0) this.endGiveaway();
                this.updateGvUI();
            }
        }, 1000);
    },

    endGiveaway() {
        this.activeGv.active = false;
        document.getElementById('gv-live-panel').classList.add('hidden');
        const bonus = Math.floor(this.activeGv.participants * 0.15);
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
        const list = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        cont.innerHTML = list.map(v => `
            <div class="v-card">
                <div class="thumb">${v.style.includes('Shorts') ? '📱' : '🎬'}</div>
                <div style="padding:10px">
                    <h3 style="font-size:16px">${v.title}</h3>
                    <p style="color:#606060; font-size:13px">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                </div>
            </div>
        `).join('');
    },

    filterContent(f, btn) {
        this.currentFilter = f;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    switchPage(id, btn) {
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
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
        const n = prompt("تغيير اسم القناة:", this.channelName);
        if (n) { this.channelName = n; this.save(); this.updateUI(); }
    },

    resetGame() { if(confirm("مسح كل شيء؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();
