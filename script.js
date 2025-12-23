/* الأكواد السابقة ثابتة + إضافة التالي */

.amazon-banner {
    background: #232f3e;
    color: white;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
}

.giveaway-timer-box {
    text-align: center;
    background: #febd69;
    color: #111;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
}

.amazon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 30px;
    background: #eaeded;
}

.amazon-card {
    background: white;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.amazon-card img {
    max-width: 100%;
    height: 150px;
    object-fit: contain;
    margin-bottom: 10px;
}

.amazon-card h3 {
    font-size: 14px;
    height: 40px;
    overflow: hidden;
    color: #007185;
}

.amazon-card .price {
    font-size: 20px;
    font-weight: bold;
    margin: 10px 0;
}

.buy-amazon-btn {
    background: #ffd814;
    border: 1px solid #fcd200;
    border-radius: 20px;
    padding: 8px;
    cursor: pointer;
    font-weight: bold;
}

.buy-amazon-btn:hover { background: #f7ca00; }
