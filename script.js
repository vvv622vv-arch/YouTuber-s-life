const Game = {
    money: 1000, subs: 0, videos: [], inventory: [],
    channelName: "قناة الأسطورة", avatar: "👤",
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
            inventory: this.inventory, channelName: this.channelName
        };
        localStorage.setItem('YT_GAME_SAVE_V6', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_GAME_SAVE_V6');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    publishVideo() {
        const title = document.getElementById('video-title').value;
        const style = document.getElementById('video-style').value;
        
        if (!title.trim()) return this.showToast("⚠️ اكتب العنوان!", "error");

        let views = Math.floor(Math.random() * 5000 + 100);
        this.videos.unshift({ title, style, views });
        
        this.subs += Math.floor(views * 0.02);
        this.money += Math.floor(views * 0.01);

        document.getElementById('video-title').value = "";
        this.showToast("🚀 تم النشر!", "success");
        this.save(); this.updateUI(); this.renderVideos();
    },

    generateAmazon() {
        const items = [
            {n: "Sony PS5", p: 500, i: "🎮"},
            {n: "PC High-End", p: 2000, i: "🖥️"},
            {n: "iPhone 15", p: 1000, i: "📱"}
        ];
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        for (let i = 0; i < 40; i++) {
            const it = items[i % items.length];
            const price = it.p + (i * 10);
            grid.innerHTML += `
                <div class="v-card">
                    <div style="font-size:40px">${it.i}</div>
                    <h3>${it.n}</h3>
                    <p style="color:red; font-weight:bold">$${price}</p>
                    <button onclick="Game.buyItem('${it.n}', ${price})" style="cursor:pointer; padding:5px; width:100%">شراء</button>
                </div>`;
        }
    },

    buyItem(n, p) {
        if (this.money >= p) {
            this.money -= p;
            this.inventory.push(n);
            this.showToast(`🛍️ تم شراء ${n}`, "success");
            this.updateInventorySelect();
            this.save(); this.updateUI();
        } else this.showToast("❌ رصيدك قليل!", "error");
    },

    updateInventorySelect() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((it, idx) => `<option value="${idx}">${it}</option>`).join('')
            : "<option>المخزن فارغ</option>";
    },

    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("⚠️ لا تملك جوائز!", "error");
        if (this.activeGv.active) return this.showToast("⚠️ سحب شغال!", "error");

        const idx = document.getElementById('gv-inventory-select').value;
        const it = this.inventory[idx];
        this.activeGv = { active: true, timer: 15, item: it, participants: 0 };
        this.inventory.splice(idx, 1);

        this.videos.unshift({ title: `🎁 سحب مباشر على ${it}`, style: "🎁 قيفاوي", views: 0 });
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
                <div style="height:100px; background:#333; color:#fff; display:flex; align-items:center; justify:center; font-size:30px">🎬</div>
                <div style="padding:10px">
                    <h4>${v.title}</h4>
                    <p style="font-size:12px">${v.views.toLocaleString()} مشاهدة</p>
                </div>
            </div>
        `).join('');
    },

    switchPage(id, btn) {
        document.querySelectorAll('.game-page').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (id === 'page-giveaway') this.updateInventorySelect();
    },

    updateUI() {
        document.getElementById('stat-money').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-money-bank').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-subs').innerText = this.subs.toLocaleString();
        document.getElementById('channel-name-display').innerText = this.channelName;
    },

    showToast(m, t) {
        const el = document.getElementById('toast-container');
        el.innerText = m; el.className = `toast-${t}`;
        el.classList.remove('toast-hidden');
        setTimeout(() => el.classList.add('toast-hidden'), 3000);
    },

    customizeChannel() {
        const n = prompt("اسم قناتك:", this.channelName);
        if (n) { this.channelName = n; this.save(); this.updateUI(); }
    },

    resetGame() { if(confirm("مسح كل شيء؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();
