const Game = {
    // 1. البيانات الأساسية
    money: 100,
    subs: 0,
    vids: 0,
    power: 1.0,
    videos: [],
    shieldTime: 0,
    giveawayTimer: 300,
    giveawayEntries: [],
    channelName: "قناة جديدة",
    avatar: "👤",
    currentFilter: 'all',

    init() {
        this.load(); // تحميل البيانات أولاً
        this.generateAmazon();
        this.generateShop();
        this.startMainLoop();
        this.updateUI();
        this.renderVideos();
    },

    // 2. نظام الحفظ الواقعي
    save() {
        const data = {
            money: this.money,
            subs: this.subs,
            vids: this.vids,
            power: this.power,
            videos: this.videos,
            shieldTime: this.shieldTime,
            channelName: this.channelName,
            avatar: this.avatar
        };
        localStorage.setItem('YT_STUDIO_SAVE_DATA', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_STUDIO_SAVE_DATA');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(this, parsed);
        }
    },

    // 3. نظام النشر (مع البث المباشر)
    publish() {
        const titleInput = document.getElementById('input-title');
        const styleInput = document.getElementById('input-style');
        
        if (!titleInput.value) return this.showToast("أدخل عنواناً للمحتوى!", "error");

        let views = Math.floor((Math.random() * 4000 + 500) * this.power);
        const newVideo = {
            title: titleInput.value,
            style: styleInput.value,
            views: views,
            date: new Date().toLocaleDateString()
        };

        this.videos.unshift(newVideo);
        this.subs += Math.floor(views * 0.015);
        this.money += Math.floor(views * 0.008);
        this.vids++;

        titleInput.value = ""; // تصفير الحقل
        this.save();
        this.updateUI();
        this.renderVideos();
        this.showToast("تم النشر بنجاح!", "success");
    },

    // 4. نظام أمازون والقيفاوي
    generateAmazon() {
        const grid = document.getElementById('amazon-products');
        const items = [
            {n: "PS5 Console", p: 499, i: "🎮"},
            {n: "Gaming PC High", p: 2500, i: "🖥️"},
            {n: "RTX 4090 GPU", p: 1600, i: "⚙️"},
            {n: "iPhone 15", p: 999, i: "📱"},
            {n: "Gaming Monitor", p: 400, i: "📺"}
        ];

        grid.innerHTML = "";
        for (let i = 0; i < 100; i++) {
            const template = items[i % items.length];
            const price = template.p + (i * 12);
            grid.innerHTML += `
                <div class="amazon-card">
                    <div style="font-size:40px; text-align:center;">${template.i}</div>
                    <h4 style="font-size:13px;">${template.n} #PRO-${i+1}</h4>
                    <p style="font-weight:bold; color:#B12704;">$${price.toLocaleString()}</p>
                    <button class="buy-amz-btn" onclick="Game.buyAmazon('${template.n}', ${price})">شراء ودخول السحب</button>
                </div>`;
        }
    },

    buyAmazon(name, price) {
        if (this.money >= price) {
            this.money -= price;
            this.giveawayEntries.push(name);
            this.showToast(`تم شراء ${name} ودخلت السحب!`, "success");
            this.save();
            this.updateUI();
        } else {
            this.showToast("الرصيد غير كافٍ في محفظتك!", "error");
        }
    },

    // 5. المحرك الرئيسي (Loop)
    startMainLoop() {
        setInterval(() => {
            // عداد القيفاوي
            if (this.giveawayTimer > 0) {
                this.giveawayTimer--;
            } else {
                this.runGiveawayDraw();
                this.giveawayTimer = 300;
            }

            if (this.shieldTime > 0) this.shieldTime--;

            this.updateUI();
        }, 1000);
    },

    runGiveawayDraw() {
        if (this.giveawayEntries.length > 0) {
            const win = this.giveawayEntries[Math.floor(Math.random() * this.giveawayEntries.length)];
            alert(`🎁 مبروك! فزت في سحب أمازون على: ${win}`);
            this.giveawayEntries = [];
        }
    },

    // 6. واجهة المستخدم والتعديل
    updateUI() {
        document.getElementById('stat-money').innerText = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('stat-money-bank').innerText = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('stat-subs').innerText = this.subs.toLocaleString();
        document.getElementById('channel-name-display').innerText = this.channelName;
        document.getElementById('pfp-display').innerText = this.avatar;

        const timerEl = document.getElementById('giveaway-timer');
        if (timerEl) {
            let m = Math.floor(this.giveawayTimer / 60), s = this.giveawayTimer % 60;
            timerEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        const shieldStatus = document.getElementById('shield-status');
        if (this.shieldTime > 0) {
            shieldStatus.innerText = "🛡️ الحماية نشطة"; shieldStatus.style.color = "green";
        } else {
            shieldStatus.innerText = "⚠️ الحماية غير مفعلة"; shieldStatus.style.color = "red";
        }
    },

    filterContent(type, btn) {
        this.currentFilter = type;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        cont.innerHTML = "";
        const filtered = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        
        if (filtered.length === 0) {
            cont.innerHTML = "<p style='padding:20px; color:#606060;'>لا يوجد محتوى لعرضه هنا.</p>";
            return;
        }

        filtered.forEach(v => {
            cont.innerHTML += `
                <div class="v-card" style="background:#fff; border-radius:8px; overflow:hidden; border:1px solid #ddd;">
                    <div class="thumb" style="height:140px; background:#f2f2f2;">${v.style.split(' ')[0]}</div>
                    <div style="padding:10px;">
                        <h4 style="font-size:14px; margin-bottom:5px;">${v.title}</h4>
                        <p style="font-size:12px; color:#606060;">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                    </div>
                </div>`;
        });
    },

    customizeChannel() {
        const name = prompt("أدخل اسم القناة الجديد:", this.channelName);
        const icon = prompt("أدخل إيموجي الأفاتار:", this.avatar);
        if (name) this.channelName = name;
        if (icon) this.avatar = icon;
        this.save();
        this.updateUI();
    },

    buyShield() {
        if (this.money >= 1500) {
            this.money -= 1500;
            this.shieldTime += 3600; // ساعة كاملة
            this.showToast("تم تفعيل نظام الحماية لمدة ساعة!", "success");
            this.save();
            this.updateUI();
        } else this.showToast("رصيدك قليل جداً!", "error");
    },

    generateShop() {
        const grid = document.getElementById('shop-display');
        grid.innerHTML = "";
        for (let i = 1; i <= 20; i++) {
            let cost = i * 3000;
            grid.innerHTML += `
                <div style="background:#fff; padding:20px; border-radius:8px; text-align:center; border:1px solid #ddd;">
                    <h3>تطوير الكاميرا V${i}</h3>
                    <p style="color:green; font-weight:bold;">$${cost.toLocaleString()}</p>
                    <button onclick="Game.buyUpgrade(${cost}, 0.8)" style="margin-top:10px; padding:8px 15px; cursor:pointer;">شراء الترقية</button>
                </div>`;
        }
    },

    buyUpgrade(cost, boost) {
        if (this.money >= cost) {
            this.money -= cost;
            this.power += boost;
            this.showToast("تم ترقية القناة!", "success");
            this.save();
            this.updateUI();
        } else this.showToast("رصيدك لا يكفي!", "error");
    },

    switchPage(id, btn) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    showToast(msg, type) {
        const t = document.getElementById('toast-container');
        t.innerText = msg;
        t.className = type === 'success' ? 'toast-success' : 'toast-error';
        setTimeout(() => t.classList.add('toast-hidden'), 3000);
        t.classList.remove('toast-hidden');
    },

    resetGame() {
        if (confirm("هل أنت متأكد؟ سيتم حذف كل تقدمك نهائياً!")) {
            localStorage.clear();
            location.reload();
        }
    }
};

// تشغيل اللعبة
window.onload = () => Game.init();
