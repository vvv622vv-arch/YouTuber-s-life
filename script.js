const Game = {
    money: 1000, subs: 0, vids: 0, power: 1.0, videos: [], timer: 600,
    shieldTime: 0, channelName: "قناة الأساطير", avatar: "👤", currentFilter: 'all',
    giveawayTimer: 300, // سحب كل 5 دقائق
    giveawayEntries: [], // سلة المشتريات لدخول السحب

    init() {
        this.load();
        this.generateShop();
        this.generateAmazon();
        this.startLoop();
        this.updateUI();
        this.renderVideos();
    },

    // مجمع المنتجات
    amazonPool: [
        { name: "Sony PS5 Pro", price: 700, icon: "🎮" },
        { name: "Gaming PC RTX 4090", price: 4000, icon: "🖥️" },
        { name: "Xbox Series X", price: 500, icon: "🕹️" },
        { name: "Samsung 4K Monitor 144Hz", price: 600, icon: "📺" },
        { name: "iPhone 15 Pro", price: 1000, icon: "📱" },
        { name: "Razer Gaming Chair", price: 400, icon: "💺" },
        { name: "Logitech G Pro Setup", price: 300, icon: "🖱️" }
    ],

    generateAmazon() {
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        for (let i = 1; i <= 100; i++) {
            const item = this.amazonPool[i % this.amazonPool.length];
            const finalPrice = item.price + (i * 5);
            grid.innerHTML += `
                <div class="amazon-card">
                    <div style="font-size:50px; text-align:center; padding:10px;">${item.icon}</div>
                    <h3>${item.name} #MOD-${i}</h3>
                    <p class="price">$${finalPrice.toLocaleString()}</p>
                    <button class="buy-amazon-btn" onclick="Game.buyAmazon('${item.name}', ${finalPrice})">شراء ودخول السحب</button>
                </div>`;
        }
    },

    buyAmazon(name, price) {
        if (this.money >= price) {
            this.money -= price;
            this.giveawayEntries.push(name);
            this.showToast(`✅ اشتريت ${name} ودخلت السحب!`, "success");
            this.updateUI(); this.save();
        } else {
            this.showToast("❌ رصيدك لا يكفي!", "error");
        }
    },

    publish() {
        const title = document.getElementById('input-title').value;
        const style = document.getElementById('input-style').value;
        if (!title) return this.showToast("أدخل العنوان!");

        let views = Math.floor((Math.random() * 5000 + 1000) * this.power);
        this.videos.unshift({ title, views, style });
        this.subs += Math.floor(views * 0.02);
        this.money += Math.floor(views * 0.01);
        this.vids++;

        this.updateUI(); this.renderVideos(); this.save();
        document.getElementById('input-title').value = "";
        this.showToast("🚀 تم النشر بنجاح!", "success");
    },

    startLoop() {
        setInterval(() => {
            // عداد القيفاوي
            if (this.giveawayTimer > 0) {
                this.giveawayTimer--;
            } else {
                this.finishGiveaway();
                this.giveawayTimer = 300;
            }

            if (this.shieldTime > 0) this.shieldTime--;

            // تحديث واجهة العداد
            const gt = document.getElementById('giveaway-timer');
            if (gt) {
                let m = Math.floor(this.giveawayTimer/60), s = this.giveawayTimer%60;
                gt.innerText = `${m}:${s<10?'0':''}${s}`;
            }
            this.updateUI();
        }, 1000);
    },

    finishGiveaway() {
        if (this.giveawayEntries.length > 0) {
            const winner = this.giveawayEntries[Math.floor(Math.random() * this.giveawayEntries.length)];
            alert(`🎉 مبروك! لقد فزت في السحب على: ${winner}`);
            this.giveawayEntries = []; // تصفير السلة
        } else {
            this.showToast("🔔 انتهى السحب ولم يشارك أحد", "error");
        }
    },

    customizeChannel() {
        const n = prompt("تغيير اسم القناة:", this.channelName);
        const a = prompt("تغيير الأفاتار (إيموجي):", this.avatar);
        if (n) this.channelName = n;
        if (a) this.avatar = a;
        this.updateUI(); this.save();
    },

    updateUI() {
        document.getElementById('stat-money').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-money-bank').innerText = `$${this.money.toLocaleString()}`;
        document.getElementById('stat-subs').innerText = this.subs.toLocaleString();
        document.getElementById('stat-vids').innerText = this.vids;
        document.getElementById('channel-name-display').innerText = this.channelName;
        document.getElementById('pfp-display').innerText = this.avatar;

        const sText = document.getElementById('shield-text');
        if (this.shieldTime > 0) {
            sText.innerText = "الحماية: مفعلة ✅"; sText.style.color = "green";
        } else {
            sText.innerText = "الحماية: غير مفعلة ❌"; sText.style.color = "red";
        }

        const badge = document.getElementById('trophy-badge');
        if (this.subs >= 1000000) badge.innerText = "💎";
        else if (this.subs >= 100000) badge.innerText = "🥇";
        else if (this.subs >= 10000) badge.innerText = "🥈";
    },

    switchPage(id, btn) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

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
            cont.innerHTML += `<div class="v-card"><div class="thumb">🎬</div><div style="padding:10px;"><h4>${v.title}</h4><p>${v.views.toLocaleString()} مشاهدة</p></div></div>`;
        });
    },

    buyShield() {
        if (this.money >= 1000) { this.money -= 1000; this.shieldTime += 1800; this.updateUI(); this.save(); this.showToast("🛡️ تم تفعيل الحماية!", "success"); }
        else this.showToast("❌ مالك قليل!");
    },

    generateShop() {
        const grid = document.getElementById('shop-display');
        grid.innerHTML = "";
        for (let i = 1; i <= 20; i++) {
            let p = i * 2000;
            grid.innerHTML += `<div class="item-card" style="background:#fff; padding:20px; border-radius:12px; text-align:center;"><h3>تطوير القناة V${i}</h3><p style="color:green;">$${p.toLocaleString()}</p><button onclick="Game.buy(${p}, 0.5)" style="background:green; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; margin-top:10px;">شراء</button></div>`;
        }
    },

    buy(p, b) {
        if (this.money >= p) { this.money -= p; this.power += b; this.updateUI(); this.save(); this.showToast("🛒 تم التطوير!", "success"); }
        else this.showToast("❌ رصيدك قليل");
    },

    showToast(m, t) {
        const el = document.getElementById('toast-container');
        el.innerText = m; el.className = t === 'success' ? 'toast-success' : 'toast-error';
        el.classList.remove('toast-hidden'); setTimeout(() => el.classList.add('toast-hidden'), 3000);
    },

    save() { localStorage.setItem('yt_sim_v_mega', JSON.stringify({money:this.money, subs:this.subs, vids:this.vids, videos:this.videos, channelName:this.channelName, avatar:this.avatar})); },
    load() { const s = localStorage.getItem('yt_sim_v_mega'); if(s) Object.assign(this, JSON.parse(s)); },
    resetGame() { if(confirm("تصفير؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();
