const Game = {
    money: 200, subs: 0, vids: 0, power: 1.0, videos: [], timer: 600, pending: 0, 
    shieldTime: 0, channelName: "قناة الأساطير", avatar: "👤", currentFilter: 'all',

    init() {
        this.load();
        this.generateShop();
        this.startLoop();
        this.updateUI();
        this.renderVideos();
    },

    save() {
        const data = { 
            money: this.money, subs: this.subs, vids: this.vids, power: this.power, 
            videos: this.videos, pending: this.pending, shieldTime: this.shieldTime, 
            channelName: this.channelName, avatar: this.avatar 
        };
        localStorage.setItem('yt_sim_v_final_nodelete', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('yt_sim_v_final_nodelete');
        if (saved) Object.assign(this, JSON.parse(saved));
    },

    customizeChannel() {
        const n = prompt("ادخل اسم القناة الجديد:", this.channelName);
        const a = prompt("ادخل رمز الأفاتار (Emoji):", this.avatar);
        if (n) this.channelName = n;
        if (a) this.avatar = a;
        this.updateUI(); this.save();
    },

    publish() {
        const title = document.getElementById('input-title').value;
        const style = document.getElementById('input-style').value;
        const type = document.getElementById('input-type').value;
        if (!title) return this.showToast("العنوان مطلوب!");

        let views = Math.floor((Math.random() * 5000 + 2000) * this.power);
        this.videos.unshift({ title, views, style, type });
        this.subs += Math.floor(views * 0.02);
        this.pending += views * 0.01;
        this.vids++;

        this.updateUI(); this.renderVideos(); this.save();
        document.getElementById('input-title').value = "";
        this.switchPage('page-channel', document.querySelectorAll('.side-btn')[0]);
        this.showToast("✅ تم نشر المحتوى!", "success");
    },

    // بقية الدوال (renderVideos, updateUI, buyShield, startLoop...) ثابتة كما في السابق
    filterContent(f, btn) {
        this.currentFilter = f;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        cont.innerHTML = "";
        const filtered = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        filtered.forEach(v => {
            const isShort = v.style === '📱 Shorts';
            cont.innerHTML += `
                <div class="v-card">
                    <div class="thumb ${isShort ? 'short-thumb' : ''}">${isShort ? '📱' : '🎬'}</div>
                    <h4 style="margin-top:10px;">${v.title}</h4>
                    <p style="font-size:12px; color:#606060;">${v.views.toLocaleString()} مشاهدة • ${v.type}</p>
                </div>`;
        });
    },

    updateUI() {
        const fmt = (v) => v.toLocaleString();
        document.getElementById('stat-money').innerText = `$${fmt(this.money)}`;
        document.getElementById('stat-money-bank').innerText = `$${fmt(this.money)}`;
        document.getElementById('stat-subs').innerText = fmt(this.subs);
        document.getElementById('stat-vids').innerText = this.vids;
        document.getElementById('pending-display').innerText = `$${fmt(this.pending)}`;
        document.getElementById('channel-name-display').innerText = this.channelName;
        document.getElementById('pfp-display').innerText = this.avatar;

        const sText = document.getElementById('shield-text');
        const sTimer = document.getElementById('shield-timer');
        if (this.shieldTime > 0) {
            sText.innerText = "الحماية: مفعلة ✅"; sText.style.color = "green";
            let m = Math.floor(this.shieldTime/60), s = this.shieldTime%60;
            sTimer.innerText = `تنتهي الحماية بعد: ${m}:${s<10?'0':''}${s}`;
        } else {
            sText.innerText = "الحماية: غير مفعلة ❌"; sText.style.color = "red";
            sTimer.innerText = "أنت معرض لسرقة 15% من أموالك!";
        }

        const badge = document.getElementById('trophy-badge');
        if (this.subs >= 1000000) badge.innerText = "💎";
        else if (this.subs >= 100000) badge.innerText = "🥇";
        else if (this.subs >= 10000) badge.innerText = "🥈";
        else badge.innerText = "";
    },

    buyShield() {
        if (this.money >= 1000) {
            this.money -= 1000; this.shieldTime += 1800;
            this.showToast("🛡️ تم تفعيل الحماية!", "success");
            this.updateUI(); this.save();
        } else this.showToast("❌ رصيدك غير كافٍ!");
    },

    generateShop() {
        const grid = document.getElementById('shop-display');
        grid.innerHTML = "";
        for (let i = 1; i <= 25; i++) {
            let p = i * 1500;
            grid.innerHTML += `<div class="item-card"><h3>ترقية القناة V${i}</h3><p style="color:green; font-weight:bold;">$${p.toLocaleString()}</p><button class="buy-btn-green" style="width:100%; padding:10px; background:green; color:white; border:none; border-radius:8px; margin-top:10px; cursor:pointer;" onclick="Game.buy(${p}, 0.5)">شراء</button></div>`;
        }
    },

    buy(p, b) {
        if (this.money >= p) { this.money -= p; this.power += b; this.updateUI(); this.save(); this.showToast("🛒 تم التطوير!", "success"); }
        else this.showToast("❌ رصيدك قليل");
    },

    switchPage(id, btn) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    showToast(m, t) {
        const el = document.getElementById('toast-container');
        el.innerText = m; el.className = t === 'success' ? 'toast-success' : 'toast-error';
        el.classList.remove('toast-hidden'); setTimeout(() => el.classList.add('toast-hidden'), 3000);
    },

    startLoop() {
        setInterval(() => {
            if (this.timer > 0) this.timer--;
            if (this.shieldTime > 0) this.shieldTime--;
            if (this.timer <= 0) {
                if (this.shieldTime <= 0 && this.money > 200) {
                    let theft = Math.floor(this.money * 0.15);
                    this.money -= theft;
                    this.showToast(`🚨 سُرقت منك $${theft.toLocaleString()}`, "error");
                }
                this.money += this.pending; this.pending = 0; this.timer = 600; this.save();
            }
            let m = Math.floor(this.timer/60), s = this.timer%60;
            document.getElementById('timer').innerText = `${m}:${s<10?'0':''}${s}`;
            this.updateUI();
        }, 1000);
    },
    
    resetGame() { if(confirm("تصفير؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();