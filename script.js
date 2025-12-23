const Game = {
    money: 1000, subs: 0, videos: [], inventory: [],
    
    init() {
        this.updateUI();
        this.renderAMZ();
    },

    switchPage(id, btn) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    publish() {
        const t = document.getElementById('v-title');
        if(!t.value) return alert("اكتب العنوان!");
        
        let views = Math.floor(Math.random() * 1000 + 50);
        this.videos.unshift({title: t.value, views: views});
        this.money += Math.floor(views * 0.1);
        this.subs += Math.floor(views * 0.05);
        
        t.value = "";
        this.updateUI();
        this.renderVideos();
        alert("تم النشر!");
    },

    renderVideos() {
        const list = document.getElementById('video-list');
        list.innerHTML = this.videos.map(v => `
            <div style="background:white; padding:10px; border-radius:10px; border:1px solid #ddd;">
                <h4>${v.title}</h4>
                <p>${v.views} مشاهدة</p>
            </div>
        `).join('');
    },

    renderAMZ() {
        const list = document.getElementById('amz-list');
        const items = [{n:"PS5", p:500}, {n:"PC", p:2000}, {n:"iPhone", p:1000}];
        list.innerHTML = items.map(i => `
            <div style="background:white; padding:15px; text-align:center; border-radius:10px;">
                <h4>${i.n}</h4>
                <p style="color:red">$${i.p}</p>
                <button onclick="Game.buy('${i.n}', ${i.p})">شراء</button>
            </div>
        `).join('');
    },

    buy(n, p) {
        if(this.money >= p) {
            this.money -= p;
            this.inventory.push(n);
            this.updateUI();
            this.updateInv();
            alert("اشتريت " + n);
        } else alert("ما عندك فلوس!");
    },

    updateInv() {
        const sel = document.getElementById('inv-select');
        sel.innerHTML = this.inventory.map((item, i) => `<option value="${i}">${item}</option>`).join('');
    },

    updateUI() {
        document.getElementById('money').innerText = this.money;
        document.getElementById('subs').innerText = this.subs;
    },

    reset() { if(confirm("تصفير؟")) { localStorage.clear(); location.reload(); } }
};

window.onload = () => Game.init();
