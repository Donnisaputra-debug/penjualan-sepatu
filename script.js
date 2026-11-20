/* ========= DATA ========= */
const USERS = [{ username: "admin", password: "12345", nama: "Admin" }];

// Gambar dibuat otomatis (SVG). Untuk foto asli, isi `img`,
// contoh: img: "images/sepatu1.jpg"
const PRODUCTS = [
  { id: 1, nama: "Sprint Air",    kategori: "Lari",   harga: 450000, warna: "#e4572e", bg: "#fbe3da" },
  { id: 2, nama: "Urban Walk",    kategori: "Santai", harga: 380000, warna: "#14213d", bg: "#dfe3ee" },
  { id: 3, nama: "Court Classic", kategori: "Casual", harga: 520000, warna: "#2a9d8f", bg: "#d9efec" },
  { id: 4, nama: "Trail Master",  kategori: "Lari",   harga: 610000, warna: "#6a994e", bg: "#e4eedb" },
  { id: 5, nama: "Kanvas Pagi",   kategori: "Santai", harga: 299000, warna: "#f4a261", bg: "#fdebd8" },
  { id: 6, nama: "Street Hi-Top", kategori: "Casual", harga: 575000, warna: "#8338ec", bg: "#e9dcfa" },
];

function shoeSVG(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
  <ellipse cx="200" cy="235" rx="165" ry="14" fill="rgba(0,0,0,.12)"/>
  <path d="M30 190 C30 150 60 140 90 120 L120 70 C130 55 150 55 160 68 L175 95 C200 110 250 115 300 130 C350 142 375 165 372 195 L372 205 Q372 215 360 215 L45 215 Q30 215 30 200 Z" fill="${color}"/>
  <path d="M30 195 L372 195 L372 215 Q372 225 360 225 L45 225 Q30 225 30 210 Z" fill="#fff"/>
  <path d="M30 195 L372 195" stroke="rgba(0,0,0,.15)" stroke-width="3"/>
  <path d="M140 80 L165 108 M158 72 L182 100 M176 82 L198 108" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
  <path d="M95 175 Q200 140 330 175" stroke="rgba(255,255,255,.7)" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
PRODUCTS.forEach(p => { if (!p.img) p.img = shoeSVG(p.warna); });

/* ========= HELPER ========= */
const $ = id => document.getElementById(id);
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const saveCart = c => localStorage.setItem("cart", JSON.stringify(c));

let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function updateCartCount() {
  const n = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = n);
}

/* ========= LOGIN ========= */
function setupLogin() {
  $("login-visual").innerHTML = `<img src="${shoeSVG("#14213d")}" alt="Sepatu">`;

  $("toggle-pass").addEventListener("click", () => {
    const input = $("password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("toggle-pass").textContent = show ? "Sembunyi" : "Lihat";
  });

  $("login-form").addEventListener("submit", e => {
    e.preventDefault();
    const u = $("username").value.trim();
    const p = $("password").value;
    if (!u || !p) { $("login-error").textContent = "Isi username dan password."; return; }
    const user = USERS.find(x => x.username === u && x.password === p);
    if (!user) { $("login-error").textContent = "Username atau password salah. Coba lagi."; return; }
    localStorage.setItem("user", JSON.stringify(user));
    $("login-error").textContent = "";
    location.hash = "toko";
  });

  $("logout").addEventListener("click", () => {
    localStorage.removeItem("user");
    $("login-form").reset();
    location.hash = "login";
  });
}

/* ========= TOKO ========= */
let filter = "Semua";

function renderFilters() {
  const cats = ["Semua", ...new Set(PRODUCTS.map(p => p.kategori))];
  $("filters").innerHTML = cats.map(c =>
    `<button class="chip ${c === filter ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
  $("filters").querySelectorAll(".chip").forEach(b =>
    b.addEventListener("click", () => { filter = b.dataset.cat; renderFilters(); renderProducts(); }));
}

function renderProducts() {
  const list = PRODUCTS.filter(p => filter === "Semua" || p.kategori === filter);
  $("product-grid").innerHTML = list.map(p => `
    <article class="card">
      <div class="pic" style="background:${p.bg}"><img src="${p.img}" alt="${p.nama}"></div>
      <div class="info">
        <span class="cat">${p.kategori}</span>
        <h3>${p.nama}</h3>
        <span class="price">${rupiah(p.harga)}</span>
        <button class="btn" data-add="${p.id}">Tambah ke keranjang</button>
      </div>
    </article>`).join("");
  $("product-grid").querySelectorAll("[data-add]").forEach(b =>
    b.addEventListener("click", () => addToCart(+b.dataset.add)));
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart(cart); updateCartCount();
  toast(PRODUCTS.find(p => p.id === id).nama + " masuk keranjang");
}

/* ========= KERANJANG ========= */
function setupCart() {
  $("checkout").addEventListener("click", () => {
    const cart = getCart();
    if (!cart.length) return toast("Keranjang masih kosong");
    const total = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).harga * i.qty, 0);
    saveCart([]);
    $("cart-layout").hidden = true;
    $("success").hidden = false;
    $("success-msg").textContent = "Total pembayaran " + rupiah(total) + ". Terima kasih sudah berbelanja.";
    updateCartCount();
  });
}

function changeQty(id, d) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart); renderCart();
}

function removeItem(id) { saveCart(getCart().filter(i => i.id !== id)); renderCart(); }

function renderCart() {
  const cart = getCart();
  updateCartCount();
  if (!cart.length) {
    $("cart-items").innerHTML = `<div class="empty"><p>Keranjang masih kosong.</p><a href="index.html" class="btn">Pilih sepatu</a></div>`;
    $("cart-total").textContent = rupiah(0);
    return;
  }
  let total = 0;
  $("cart-items").innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    total += p.harga * i.qty;
    return `
    <div class="item">
      <img src="${p.img}" alt="${p.nama}" style="background:${p.bg}">
      <div>
        <b>${p.nama}</b><br><span class="muted">${p.kategori} · ${rupiah(p.harga)}</span>
        <div class="qty">
          <button data-min="${p.id}" aria-label="Kurangi">−</button>
          <span>${i.qty}</span>
          <button data-plus="${p.id}" aria-label="Tambah">+</button>
        </div>
      </div>
      <div class="right"><b>${rupiah(p.harga * i.qty)}</b><br><button class="del" data-del="${p.id}">Hapus</button></div>
    </div>`;
  }).join("");
  $("cart-total").textContent = rupiah(total);
  $("cart-items").querySelectorAll("[data-min]").forEach(b => b.onclick = () => changeQty(+b.dataset.min, -1));
  $("cart-items").querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQty(+b.dataset.plus, 1));
  $("cart-items").querySelectorAll("[data-del]").forEach(b => b.onclick = () => removeItem(+b.dataset.del));
}

/* ========= ROUTER (pindah halaman lewat #hash) ========= */
const VIEWS = ["login", "toko", "keranjang"];

function route() {
  const user = getUser();
  let view = location.hash.slice(1);
  if (!VIEWS.includes(view)) view = user ? "toko" : "login";
  if (!user) view = "login";                 // wajib login
  else if (view === "login") view = "toko";  // sudah login

  VIEWS.forEach(v => $("view-" + v).hidden = v !== view);
  $("topbar").hidden = view === "login";
  $("nav-cart").hidden = view === "keranjang";
  $("nav-shop").hidden = view !== "keranjang";
  window.scrollTo(0, 0);

  if (view === "toko") { $("welcome").textContent = "Halo, " + user.nama; renderFilters(); renderProducts(); }
  if (view === "keranjang") { $("cart-layout").hidden = false; $("success").hidden = true; renderCart(); }
  updateCartCount();
}

setupLogin();
setupCart();
window.addEventListener("hashchange", route);
route();