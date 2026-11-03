// ================================================
//  Warung Mas Diky Siap Pesan - APP.JS
//  Data menu, cart, order management, UI helpers
// ================================================

// ---- MENU DATA ----
const menuData = [
  {
    id: 'm01', name: 'Ayam Geprek', category: 'Makanan',
    price: 12000, stok: 20, featured: true,
    img: 'Ayam Geprek.png',
    badge: 'Terlaris 🔥',
    desc: 'Ayam goreng crispy digeprek dengan sambal bawang pedas nampol. Disajikan dengan lalapan segar.',
  },
  {
    id: 'm02', name: 'Ayam Krispi', category: 'Makanan',
    price: 10000, stok: 25, featured: true,
    img: 'Ayam Krispi.png',
    badge: 'Favorit ⭐',
    desc: 'Ayam goreng tepung renyah dengan bumbu rempah pilihan. Garing di luar, juicy di dalam. Cocok buat semua usia!',
  },
  {
    id: 'm03', name: 'Ayam Lalapan', category: 'Makanan',
    price: 17000, stok: 15, featured: true,
    img: 'Ayam Lalapan.png',
    badge: 'Spesial 🥗',
    desc: 'Ayam goreng bumbu rempah dengan lalapan segar (timun, kemangi, kol) dan sambal terasi khas warung.',
  },
  {
    id: 'm04', name: 'Ayam Penyet', category: 'Makanan',
    price: 15000, stok: 18, featured: true,
    img: 'Ayam Penyet.png',
    badge: 'Pedas 🌶️',
    desc: 'Ayam goreng dipenyet dengan sambal terasi yang pedas dan harum. Nikmat dan menggugah selera.',
  },
  {
    id: 'm05', name: 'Tahu Goreng', category: 'Makanan',
    price: 5000, stok: 40, featured: false,
    img: 'Tahu Goreng.png',
    badge: 'Gurih',
    desc: 'Tahu goreng kuning garing dengan bumbu kunyit pilihan. Renyah di luar, lembut di dalam. Cocok jadi lauk tambahan.',
  },
  {
    id: 'm06', name: 'Tempe Goreng', category: 'Makanan',
    price: 5000, stok: 40, featured: false,
    img: 'Tempe Goreng.png',
    badge: 'Crispy',
    desc: 'Tempe goreng crispy dengan balutan tepung bumbu tipis. Gurih, renyah, dan mengenyangkan. Favorit semua kalangan!',
  },
  {
    id: 'm07', name: 'Nasi Putih', category: 'Makanan',
    price: 5000, stok: 50, featured: false,
    img: 'Nasi.png',
    badge: 'Pulen',
    desc: 'Nasi putih pulen hangat, dimasak dari beras pilihan berkualitas. Porsi cukup dan mengenyangkan.',
  },
];

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem('waroeng_cart') || '[]');

// ---- SAVE CART ----
function saveCart() {
  localStorage.setItem('waroeng_cart', JSON.stringify(cart));
}

// ---- FORMAT CURRENCY ----
function formatRp(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

// ---- GENERATE ID ----
function generateId() {
  return 'WRG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// ---- CREATE MENU CARD HTML ----
function createMenuCard(item) {
  const isHabis = item.stok === 0;
  const isLow = item.stok > 0 && item.stok <= 5;
  const stokClass = isHabis ? '' : isLow ? 'low' : 'available';
  const stokText = isHabis ? '❌ Habis' : isLow ? `⚠️ Sisa ${item.stok}` : `✅ ${item.stok} Porsi`;
  const badgeHTML = item.badge ? `<div class="menu-card-badge">${item.badge}</div>` : '';

  return `
    <div class="menu-card" data-id="${item.id}">
      <div class="menu-card-img-wrap">
        <img class="menu-card-img" src="${item.img}" alt="${item.name}" onerror="this.src='Ayam Geprek.png'">
        ${badgeHTML}
        <div class="menu-card-stok ${stokClass}">${stokText}</div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-category">${item.category}</div>
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">
            ${formatRp(item.price)}<span>/porsi</span>
          </div>
          <button
            class="add-cart-btn"
            onclick="addToCart('${item.id}')"
            id="add-btn-${item.id}"
            ${isHabis ? 'disabled title="Stok habis"' : ''}
            title="${isHabis ? 'Stok habis' : 'Tambah ke keranjang'}"
          >+</button>
        </div>
      </div>
    </div>`;
}

// ---- ADD TO CART ----
function addToCart(id) {
  const item = menuData.find(m => m.id === id);
  if (!item || item.stok === 0) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    if (existing.qty >= item.stok) {
      showToast(`Stok ${item.name} hanya ${item.stok} porsi`, 'error');
      return;
    }
    existing.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`${item.name} ditambahkan ke keranjang 🛒`, 'success');

  // Animate button
  const btn = document.getElementById(`add-btn-${id}`);
  if (btn) {
    btn.style.transform = 'scale(1.3) rotate(45deg)';
    setTimeout(() => { btn.style.transform = ''; }, 300);
  }
}

// ---- REMOVE FROM CART ----
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

// ---- CHANGE QTY ----
function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  const menuItem = menuData.find(m => m.id === id);
  const maxStok = menuItem ? menuItem.stok : 99;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  if (item.qty > maxStok) {
    item.qty = maxStok;
    showToast(`Maksimum stok ${maxStok} porsi`, 'error');
  }
  saveCart();
  updateCartUI();
}

// ---- UPDATE CART UI ----
function updateCartUI() {
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  // Badge
  document.querySelectorAll('#cartBadge').forEach(el => {
    el.textContent = totalQty;
    el.style.display = totalQty > 0 ? 'flex' : 'none';
  });

  // Items list
  const listEl = document.getElementById('cartItemsList');
  const footerEl = document.getElementById('cartFooter');
  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p style="font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Keranjang Kosong</p>
        <p style="font-size:13px;">Yuk pilih menu favoritmu!</p>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
  } else {
    listEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='Ayam Geprek.png'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatRp(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>`).join('');

    if (footerEl) {
      footerEl.style.display = 'block';
      document.getElementById('totalItems').textContent = totalQty;
      document.getElementById('subtotalPrice').textContent = formatRp(totalPrice);
      document.getElementById('totalPrice').textContent = formatRp(totalPrice);
    }
  }
}

// ---- OPEN / CLOSE CART ----
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  updateCartUI();
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- SUBMIT ORDER ----
function submitOrder() {
  const name = document.getElementById('customerName')?.value?.trim();
  if (!name) { showToast('Nama pemesan wajib diisi!', 'error'); return; }
  if (cart.length === 0) { showToast('Keranjang masih kosong!', 'error'); return; }

  const table = document.getElementById('tableNumber')?.value?.trim() || 'Tidak disebutkan';
  const note  = document.getElementById('orderNote')?.value?.trim() || '';
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const order = {
    id: generateId(),
    customer: name,
    table,
    note,
    items: [...cart],
    total,
    status: 'pending',
    timestamp: Date.now(),
  };

  // Save order
  const orders = JSON.parse(localStorage.getItem('waroeng_orders') || '[]');
  orders.push(order);
  localStorage.setItem('waroeng_orders', JSON.stringify(orders));

  // Show modal
  const detail = document.getElementById('orderSummaryDetail');
  if (detail) {
    detail.innerHTML = `
      <div class="modal-order-row"><span>No. Pesanan</span><strong>${order.id}</strong></div>
      <div class="modal-order-row"><span>Nama</span><strong>${order.customer}</strong></div>
      <div class="modal-order-row"><span>Meja / Keterangan</span><strong>${order.table}</strong></div>
      <div class="modal-order-row"><span>Jumlah Item</span><strong>${cart.reduce((s,c)=>s+c.qty,0)} item</strong></div>
      <div class="modal-order-row"><span>Total Bayar</span><strong style="color:var(--secondary)">${formatRp(total)}</strong></div>
    `;
  }

  // Clear cart
  cart = [];
  saveCart();
  closeCart();

  // Reset form
  ['customerName','tableNumber','orderNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  updateCartUI();
  openModal();
}

// ---- MODAL ----
function openModal() {
  document.getElementById('successModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- TOAST ----
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- NAVBAR SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }
});

// ---- INTERSECTION OBSERVER (scroll animations) ----
const observeEls = document.querySelectorAll('.animate-fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

observeEls.forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
});
