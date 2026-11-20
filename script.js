// ====== Data produk ======
const products = [
  { id: 1, name: "Sprint Pro",     cat: "Lari",   price: 749000, badge: "Terlaris", img: "images/sepatu-1.svg", sizes: [39,40,41,42,43] },
  { id: 2, name: "Biru Laut",      cat: "Santai", price: 459000, img: "images/sepatu-2.svg", sizes: [38,39,40,41,42] },
  { id: 3, name: "Hitam Klasik",   cat: "Formal", price: 599000, img: "images/sepatu-3.svg", sizes: [40,41,42,43,44] },
  { id: 4, name: "Hutan Trail",    cat: "Lari",   price: 689000, img: "images/sepatu-4.svg", sizes: [39,40,41,42,43] },
  { id: 5, name: "Kulit Cokelat",  cat: "Formal", price: 825000, badge: "Baru", img: "images/sepatu-5.svg", sizes: [40,41,42,43,44] },
  { id: 6, name: "Kuning Harian",  cat: "Santai", price: 389000, img: "images/sepatu-6.svg", sizes: [37,38,39,40,41] },
];
const WA_NUMBER = "6281234567890"; // ganti dengan nomor WhatsApp toko

// ====== State ======
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let activeCat = "Semua";
let keyword = "";
const selectedSize = {}; // id produk -> ukuran

// ====== Elemen ======
const grid = document.getElementById("productGrid");
const emptyMsg = document.getElementById("emptyMsg");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const toastEl = document.getElementById("toast");

const rupiah = n => "Rp" + n.toLocaleString("id-ID");

// ====== Tampilkan produk ======
function renderProducts() {
  const list = products.filter(p =>
    (activeCat === "Semua" || p.cat === activeCat) &&
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );
  emptyMsg.hidden = list.length > 0;
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="card-img">
        <img src="${p.img}" alt="Sepatu ${p.name}" loading="lazy">
        <span class="pill">${p.cat}</span>
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      </div>
      <div class="card-body">
        <div class="row"><h3>${p.name}</h3><span class="price">${rupiah(p.price)}</span></div>
        <div class="sizes" data-id="${p.id}">
          ${p.sizes.map(s => `<button class="size ${selectedSize[p.id] === s ? "selected" : ""}" data-size="${s}">${s}</button>`).join("")}
        </div>
        <button class="btn" data-add="${p.id}">Tambah ke keranjang</button>
      </div>
    </article>`).join("");
}

// ====== Keranjang ======
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function addToCart(id) {
  const size = selectedSize[id];
  if (!size) return showToast("Pilih ukuran dulu");
  const found = cart.find(i => i.id === id && i.size === size);
  if (found) found.qty++; else cart.push({ id, size, qty: 1 });
  saveCart(); renderCart();
  showToast("Ditambahkan ke keranjang");
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(); renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart(); renderCart();
}

function renderCart() {
  let total = 0, count = 0;
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Keranjang masih kosong. Pilih sepatu dulu ya.</p>`;
  } else {
    cartItems.innerHTML = cart.map((item, i) => {
      const p = products.find(x => x.id === item.id);
      total += p.price * item.qty; count += item.qty;
      return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <strong>${p.name}</strong><br>
          <small>Ukuran ${item.size} · ${rupiah(p.price)}</small>
          <div class="qty">
            <button data-dec="${i}" aria-label="Kurangi">−</button>
            <span>${item.qty}</span>
            <button data-inc="${i}" aria-label="Tambah">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${i}">Hapus</button>
      </div>`;
    }).join("");
  }
  cartTotal.textContent = rupiah(total);
  cartCount.textContent = count;
}

function toggleCart(open) {
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  overlay.hidden = !open;
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function checkout() {
  if (cart.length === 0) return showToast("Keranjang masih kosong");
  let text = "Halo, saya mau pesan:\n";
  let total = 0;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    total += p.price * item.qty;
    text += `- ${p.name} (ukuran ${item.size}) x${item.qty} = ${rupiah(p.price * item.qty)}\n`;
  });
  text += `Total: ${rupiah(total)}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
}

// ====== Event ======
document.getElementById("filters").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  activeCat = chip.dataset.cat;
  renderProducts();
});

document.getElementById("search").addEventListener("input", e => {
  keyword = e.target.value;
  renderProducts();
});

grid.addEventListener("click", e => {
  const sizeBtn = e.target.closest(".size");
  if (sizeBtn) {
    const id = Number(sizeBtn.parentElement.dataset.id);
    selectedSize[id] = Number(sizeBtn.dataset.size);
    sizeBtn.parentElement.querySelectorAll(".size").forEach(b => b.classList.remove("selected"));
    sizeBtn.classList.add("selected");
    return;
  }
  const add = e.target.closest("[data-add]");
  if (add) addToCart(Number(add.dataset.add));
});

cartItems.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
  if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
  if (t.dataset.remove) removeItem(Number(t.dataset.remove));
});

document.getElementById("openCart").addEventListener("click", () => toggleCart(true));
document.getElementById("closeCart").addEventListener("click", () => toggleCart(false));
overlay.addEventListener("click", () => toggleCart(false));
document.getElementById("checkout").addEventListener("click", checkout);
document.addEventListener("keydown", e => { if (e.key === "Escape") toggleCart(false); });

// ====== Hero miring mengikuti kursor ======
const hero = document.querySelector(".hero");
const heroShoe = document.querySelector(".hero-shoe");
if (hero && heroShoe && matchMedia("(hover:hover)").matches) {
  hero.addEventListener("mousemove", e => {
    const x = (e.clientX / innerWidth - .5) * 2, y = (e.clientY / innerHeight - .5) * 2;
    heroShoe.style.transform = `rotate(${-6 + x * 3}deg) translate(${x * 12}px, ${y * 8}px)`;
  });
}

// ====== Mulai ======
renderProducts();
renderCart();
