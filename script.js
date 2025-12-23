const Game = {
    // 1. البيانات المتغيرة
    money: 200,
    subs: 0,
    vids: 0,
    power: 1.0,
    videos: [],
    inventory: [], // لتخزين جوائز أمازون
    shieldTime: 0,
    channelName: "قناتي الجديدة",
    avatar: "👤",
    currentFilter: 'all',
    
    // بيانات القيفاوي الحالي
    activeGv: { active: false, timer: 0, item: "", participants: 0 },

    init() {
        this.load();
        this.generateAmazonProducts();
        this.updateUI();
        this.renderVideos();
        this.updateInventoryList();
        this.startMainEngine();
    },

    // 2. نظام حفظ البيانات
    save() {
        const data = {
            money: this.money,
            subs: this.subs,
            vids: this.vids,
            power: this.power,
            videos: this.videos,
            inventory: this.inventory,
            shieldTime: this.shieldTime,
            channelName: this.channelName,
            avatar: this.avatar
        };
        localStorage.setItem('YT_SIM_ULTIMATE_SAVE', JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem('YT_SIM_ULTIMATE_SAVE');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(this, parsed);
        }
    },

    // 3. متجر أمازون الواقعي
    generateAmazonProducts() {
        const categories = [
            {n: "PS5 Console", p: 500, i: "🎮"},
            {n: "Gaming PC RTX 4090", p: 3500, i: "🖥️"},
            {n: "Xbox Series X", p: 480, i: "🕹️"},
            {n: "Curved Gaming Screen", p: 800, i: "📺"},
            {n: "iPhone 15 Pro", p: 1100, i: "📱"}
        ];
        const grid = document.getElementById('amazon-products');
        grid.innerHTML = "";
        
        for (let i = 0; i < 100; i++) {
            const item = categories[i % categories.length];
            const price = item.p + (i * 5);
            grid.innerHTML += `
                <div class="amazon-card">
                    <div style="font-size:45px; text-align:center;">${item.i}</div>
                    <h4 style="font-size:13px; margin:10px 0;">${item.n} - V${i+1}</h4>
                    <p style="font-weight:bold; color:#B12704;">$${price.toLocaleString()}</p>
                    <button class="buy-amz-btn" onclick="Game.buyForInventory('${item.n}', ${price})">شراء للمخزن</button>
                </div>`;
        }
    },

    buyForInventory(name, price) {
        if (this.money >= price) {
            this.money -= price;
            this.inventory.push(name);
            this.showToast(`تم شراء ${name}، وهي الآن في مخزن الجوائز!`, "success");
            this.updateInventoryList();
            this.updateUI();
            this.save();
        } else {
            this.showToast("رصيدك لا يكفي لشراء هذه الجائزة!", "error");
        }
    },

    updateInventoryList() {
        const sel = document.getElementById('gv-inventory-select');
        if (!sel) return;
        sel.innerHTML = this.inventory.length > 0 
            ? this.inventory.map((item, index) => `<option value="${index}">${item}</option>`).join('')
            : "<option>المخزن فارغ (اشترِ من أمازون)</option>";
    },

    // 4. نظام القيفاوي (المسابقات)
    startGiveaway() {
        if (this.inventory.length === 0) return this.showToast("لا تملك جوائز لتوزيعها!", "error");
        if (this.activeGv.active) return this.showToast("هناك سحب جارٍ بالفعل!", "error");

        const invIdx = document.getElementById('gv-inventory-select').value;
        const duration = parseInt(document.getElementById('gv-duration').value);
        const itemName = this.inventory[invIdx];

        // تفعيل السحب
        this.activeGv = { active: true, timer: duration, item: itemName, participants: 0 };
        this.inventory.splice(invIdx, 1); // حذف من المخزن

        // نشر فيديو القيفاوي
        this.videos.unshift({
            title: `🎁 مسابقة كبرى على ${itemName} - شاركوا!`,
            style: "🎁 قيفاوي",
            views: 0
        });

        document.getElementById('live-gv-status').classList.remove('hidden');
        this.updateInventoryList();
        this.renderVideos();
        this.showToast("تم نشر فيديو المسابقة بنجاح!", "success");
        this.save();
    },

    // 5. المحرك الزمني الرئيسي
    startMainEngine() {
        setInterval(() => {
            if (this.activeGv.active) {
                this.activeGv.timer--;
                // زيادة المشاركين بناءً على عدد المشتركين الحقيقيين + عشوائية
                this.activeGv.participants += Math.floor(this.subs * 0.1 + Math.random() * 20 + 1);
                
                if (this.activeGv.timer <= 0) {
                    this.endGiveaway();
                }
                this.updateGvUI();
            }
            if (this.shieldTime > 0) this.shieldTime--;
            this.updateUI();
        }, 1000);
    },

    endGiveaway() {
        this.activeGv.active = false;
        document.getElementById('live-gv-status').classList.add('hidden');
        
        // نتائج المسابقة (زيادة مشتركين هائلة)
        const bonusSubs = Math.floor(this.activeGv.participants * 0.2);
        this.subs += bonusSubs;
        this.videos[0].views = this.activeGv.participants; // تحديث مشاهدات الفيديو

        alert(`🎊 انتهى السحب!\nالجائزة: ${this.activeGv.item}\nالمشاركون: ${this.activeGv.participants}\nلقد حصلت على ${bonusSubs.toLocaleString()} مشترك جديد!`);
        this.save();
        this.updateUI();
        this.renderVideos();
    },

    updateGvUI() {
        document.getElementById('live-item').innerText = this.activeGv.item;
        document.getElementById('live-count').innerText = this.activeGv.participants.toLocaleString();
        document.getElementById('live-timer').innerText = this.activeGv.timer + "ث";
    },

    // 6. النشر العادي
    publishVideo() {
        const title = document.getElementById('video-title').value;
        const style = document.getElementById('video-style').value;
        if (!title) return this.showToast("أدخل عنواناً للمقطع!", "error");

        let baseViews = Math.floor(Math.random() * 5000 + 200);
        let finalViews = Math.floor(baseViews * this.power);
        
        this.videos.unshift({ title, style, views: finalViews });
        this.subs += Math.floor(finalViews * 0.02);
        this.money += Math.floor(finalViews * 0.015);
        this.vids++;

        document.getElementById('video-title').value = "";
        this.showToast("تم النشر بنجاح!", "success");
        this.save();
        this.updateUI();
        this.renderVideos();
    },

    // 7. الواجهة الأساسية
    updateUI() {
        document.getElementById('stat-money').innerText = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('stat-money-bank').innerText = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('stat-subs').innerText = this.subs.toLocaleString();
        document.getElementById('channel-name-display').innerText = this.channelName;
        document.getElementById('pfp-display').innerText = this.avatar;

        const sStatus = document.getElementById('shield-status');
        if (this.shieldTime > 0) {
            sStatus.innerText = "🛡️ الحماية: نشطة"; sStatus.style.color = "green";
        } else {
            sStatus.innerText = "⚠️ الحماية: غير نشطة"; sStatus.style.color = "red";
        }
    },

    renderVideos() {
        const cont = document.getElementById('video-display');
        cont.innerHTML = "";
        const filtered = this.currentFilter === 'all' ? this.videos : this.videos.filter(v => v.style === this.currentFilter);
        
        if (filtered.length === 0) {
            cont.innerHTML = "<p style='padding:20px; color:gray;'>لا توجد فيديوهات في هذا القسم.</p>";
            return;
        }

        filtered.forEach(v => {
            cont.innerHTML += `
                <div class="v-card">
                    <div class="thumb">${v.style.split(' ')[0]}</div>
                    <div style="padding:10px;">
                        <h4 style="font-size:14px; margin-bottom:5px;">${v.title}</h4>
                        <p style="font-size:12px; color:#606060;">${v.views.toLocaleString()} مشاهدة • ${v.style}</p>
                    </div>
                </div>`;
        });
    },

    filterContent(type, btn) {
        this.currentFilter = type;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVideos();
    },

    switchPage(id, btn) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (id === 'page-giveaway') this.updateInventoryList();
    },

    customizeChannel() {
        const n = prompt("تغيير اسم القناة:", this.channelName);
        const a = prompt("إيموجي الأفاتار:", this.avatar);
        if (n) this.channelName = n;
        if (a) this.avatar = a;
        this.save(); this.updateUI();
    },

    buyShield() {
        if (this.money >= 1500) {
            this.money -= 1500; this.shieldTime += 3600;
            this.showToast("تم تفعيل الحماية لمدة ساعة!", "success");
            this.save(); this.updateUI();
        } else this.showToast("رصيدك لا يكفي!", "error");
    },

    showToast(m, t) {
        const el = document.getElementById('toast-container');
        el.innerText = m; el.className = t === 'success' ? 'toast-success' : 'toast-error';
        el.classList.remove('toast-hidden');
        setTimeout(() => el.classList.add('toast-hidden'), 3000);
    },

    resetGame() {
        if (confirm("هل تريد مسح كل شيء والبدء من جديد؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

window.onload = () => Game.init();
