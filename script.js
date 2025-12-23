const Game = {
    money: 1200, subs: 0, videos: [], inventory: [],
    channelName: "قناة النجم", avatar: "👤", currentFilter: 'all',
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
        localStorage.setItem('YT_SIM_V4_SAVE', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_SIM_V4_SAVE');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    publishVideo() {
        const titleInput = document.getElementById('video-title');
        const styleInput = document.getElementById('video-style');
        
        if (!titleInput.value.trim()) {
            this.showToast("⚠️ أدخل عنوان الفيديو أولاً!", "error");
            return;
        }

        let views = Math.floor(Math.random() * 8000 + 100);
        const newVideo = {
            title: titleInput.value,
            style: styleInput.value,
            views: views,
            time: new Date().toLocaleDateString()
        };

        this.videos.unshift(newVideo);
        this.subs += Math.floor(views * 0.015);
        this.money += Math.floor(views * 0.012);

        titleInput.value = "";
        this.showToast("✅ تم نشر الفيديو بنجاح!", "success");
        this.save();
        this.updateUI();
        this.renderVideos();
    },

    generateAmazon() {
        const items = [
            {n: "PS5 Console", p: 500, i: "🎮"},
            {n: "Gaming PC", p: 2500, i: "🖥️"},
            {n: "iPhone 15", p: 1000, i: "📱"},
            {n: "Headset Pro", p: 200, i: "🎧"}
        ];
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        for (let i = 0; i < 100; i++) {
            const item = items[i % items.length];
            const price = item.p + (i * 8);
            grid.innerHTML += `
                <div class="video-item" style="padding: 20px; text-align: center;">
                    <div style="font-size: 50px;">${item.i}</div>
                    <h3 style="margin: 10px 0;">${item.n}</h3>
                    <p style="color: #e67e22; font-weight: bold; font-size: 20px;">$${price}</p>
                    <button class="big-action-btn blue-bg" style="padding: 10px; margin-top: 10px; font-size: 16px;" onclick="Game.buyItem('${item.n}', ${price})">شراء للمخزن</button>
                </div>`;
        }
    },

    buyItem(n, p) {
        if (this.money >= p) {
            this.money -= p;
            this.inventory.push(n);
            this.showToast(`🛍️ اشتريت ${n}!`, "success");
            this.updateInventorySelect();
            this.save(); this.updateUI();
        } else this.showToast("❌ رصيدك لا يكفي!", "error");
    },

    updateInventorySelect() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((it, idx) => `<option value="${idx}">${it}</option>`).join('')
            : "<option>المخزن فارغ - اشترِ من المتجر</option>";
    },

    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("❌ لا تملك جوائز!", "error");
        if (this.activeGv.active) return this.showToast("⚠️ هناك سحب جارٍ!", "error");

        const idx = document.getElementById('gv-inventory-select').value;
        const item = this.inventory[idx];
        
        this.activeGv = { active: true, timer: 30, item: item, participants: 0 };
        this.inventory.splice(idx, 1);

        this.videos.unshift({ title: `🎁 مسابقة كبرى على ${item}`, style: "🎁 قيفاوي", views: 0 });
        document.getElementById('gv-live-panel').classList.remove('hidden');
        this.updateInventorySelect();
        this.renderVideos();
    },

    startEngine() {
        setInterval(() => {
            if (this.activeGv.active) {
                this.activeGv.timer--;
                this.activeGv.participants += Math.floor(this.subs * 0.05 + Math.random() * 100);
                if (this.activeGv.timer <= 0) this.endGiveaway();
                this.updateGvUI();
            }
        }, 1000);
    },

    endGiveaway() {
        this.activeGv.active = false;
        document.getElementById('gv-live-panel').classList.add('hidden');
        const bonus = Math.floor(this.activeGv.participants * 0.1);
        this.subs += bonus;
        this.videos[0].views = this.activeGv.participants;
        this.showToast(`🎊 مبروك! كسبت ${bonus} مشترك!`, "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    updateGvUI() {
        document.getElementById('live-item').innerText = this.activeGv.item;
        document.getElementById('live-count').innerText = this.activeGv.participants.toLocaleString();
        document.getElementById('live-timer').innerText = this.activeGv.timer + " ثانية";
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        const list = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        cont.innerHTML = list.map(v => `
            <div class="video-item">
                <div class="v-thumb">${v.style.includes('Shorts') ? '📱' : '🎬'}</div>
                <div class="v-info">
                    <h3 style="font-size: 18px;">${v.title}</h3>
                    <p style="color: #666; margin-top: 5px;">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                </div>
            </div>
        `).join('');
    },

    filterContent(f, btn) {
        this.currentFilter = f;
        document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    switchPage(id, btn) {
        document.querySelectorAll('.page').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
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

    resetGame() {
        if (confirm("سيتم مسح كل شيء.. هل أنت متأكد؟")) { localStorage.clear(); location.reload(); }
    }
};

window.onload = () => Game.init();
