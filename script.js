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
        localStorage.setItem('YT_SIM_V3_SAVE', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_SIM_V3_SAVE');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    // إصلاح النشر
    publishVideo() {
        const titleInput = document.getElementById('video-title');
        const styleInput = document.getElementById('video-style');
        
        if (!titleInput.value.trim()) {
            this.showToast("يا أسطورة اكتب عنوان المقطع!", "error");
            return;
        }

        let views = Math.floor(Math.random() * 5000 + 50);
        const newVideo = {
            title: titleInput.value,
            style: styleInput.value,
            views: views,
            id: Date.now()
        };

        this.videos.unshift(newVideo);
        this.subs += Math.floor(views * 0.02);
        this.money += Math.floor(views * 0.01);

        titleInput.value = ""; // تصفير الحقل
        this.showToast("🚀 تم نشر المقطع بنجاح!", "success");
        this.save();
        this.updateUI();
        this.renderVideos();
    },

    generateAmazon() {
        const products = [
            {n: "Sony PS5 Pro", p: 700, i: "🎮"},
            {n: "PC High-End", p: 3000, i: "🖥️"},
            {n: "iPhone 15", p: 1000, i: "📱"},
            {n: "شاشة 4K", p: 500, i: "📺"}
        ];
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        for (let i = 0; i < 100; i++) {
            const item = products[i % products.length];
            const price = item.p + (i * 10);
            grid.innerHTML += `
                <div class="v-card" style="padding:15px; text-align:center;">
                    <div style="font-size:40px;">${item.i}</div>
                    <h3>${item.n}</h3>
                    <p style="color:red; font-weight:bold; margin:10px 0;">$${price}</p>
                    <button onclick="Game.buyItem('${item.n}', ${price})" style="width:100%; padding:8px; cursor:pointer;">شراء للمخزن</button>
                </div>`;
        }
    },

    buyItem(name, price) {
        if (this.money >= price) {
            this.money -= price;
            this.inventory.push(name);
            this.showToast(`تم شراء ${name} للمخزن!`, "success");
            this.updateInventorySelect();
            this.save(); this.updateUI();
        } else this.showToast("ما عندك فلوس كافية!", "error");
    },

    updateInventorySelect() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((it, idx) => `<option value="${idx}">${it}</option>`).join('')
            : "<option>المخزن فارغ (اشترِ جوائز)</option>";
    },

    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("اشترِ جائزة من المتجر أولاً!", "error");
        if (this.activeGv.active) return this.showToast("فيه سحب شغال!", "error");

        const idx = document.getElementById('gv-inventory-select').value;
        const item = this.inventory[idx];
        
        this.activeGv = { active: true, timer: 30, item: item, participants: 0 };
        this.inventory.splice(idx, 1); // حذف من المخزن

        this.videos.unshift({ title: `🎁 سحب مباشر على ${item}`, style: "🎁 قيفاوي", views: 0 });
        document.getElementById('gv-live-box').classList.remove('hidden');
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
        document.getElementById('gv-live-box').classList.add('hidden');
        const bonusSubs = Math.floor(this.activeGv.participants * 0.2);
        this.subs += bonusSubs;
        this.videos[0].views = this.activeGv.participants;
        this.showToast(`🎊 انتهى القيفاوي! كسبت ${bonusSubs} مشترك!`, "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    updateGvUI() {
        document.getElementById('live-item').innerText = this.activeGv.item;
        document.getElementById('live-count').innerText = this.activeGv.participants.toLocaleString();
        document.getElementById('live-timer').innerText = this.activeGv.timer + "ث";
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        const list = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        cont.innerHTML = list.map(v => `
            <div class="v-card">
                <div class="thumb">${v.style.includes('Shorts') ? '📱' : '🎬'}</div>
                <div style="padding:15px;">
                    <h3>${v.title}</h3>
                    <p style="font-size:13px; color:#606060;">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                </div>
            </div>
        `).join('');
    },

    filterContent(f, btn) {
        this.currentFilter = f;
        document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    switchPage(id, btn) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
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
        const n = prompt("اسم قناتك الجديد:", this.channelName);
        if (n) { this.channelName = n; this.save(); this.updateUI(); }
    },

    resetGame() {
        if (confirm("هل تريد مسح كل شيء؟")) { localStorage.clear(); location.reload(); }
    }
};

window.onload = () => Game.init();
