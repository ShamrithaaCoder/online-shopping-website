const C = window.CONFIG;
const $ = (s) => document.querySelector(s);
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const configured = !C.SUPABASE_URL.includes("YOUR-PROJECT");
const sb = configured ? supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;

// Demo data used until Supabase is configured
const DEMO = [
  ["Handloom Cotton Shirt","Shirts",1499,"#8FA3C7","photo-1596755094514-f87e34085b2c"],
  ["Linen Band-Collar Shirt","Shirts",1799,"#D9D2BE","photo-1603252109303-2751441dd157"],
  ["Block-Print Kurta","Kurtas",1999,"#B5543C","photo-1592878904946-b3cd8ae243d0"],
  ["Chikankari Kurta","Kurtas",2499,"#EDE8DC","photo-1597983073493-88cd35cf93b0"],
  ["Straight Fit Denim","Denim",2199,"#26357A","photo-1542272604-787c3835535d"],
  ["Relaxed Indigo Jeans","Denim",2399,"#3D4F8F","photo-1541099649105-f69ad21f3246"],
  ["Everyday Crew Tee","T-shirts",699,"#E8B923","photo-1521572163474-6864f9cf17ab"],
  ["Pocket Tee","T-shirts",799,"#4F6D5A","photo-1503342217505-b0a15ec3261c"],
].map((p, i) => ({
  id: "demo" + i, name: p[0], category: p[1], price: p[2], color: p[3],
  image_url: `https://images.unsplash.com/${p[4]}?auto=format&fit=crop&w=700&q=80`,
  sizes: ["S","M","L","XL"], description: "Breathable, pre-washed fabric with a relaxed everyday fit.", created_at: i
}));
const DEMO_IMAGES = new Map(DEMO.map((p) => [p.name.toLowerCase(), p.image_url]));

const state = { products: [], catalogError: false, cat: "All", q: "", sort: "new", user: null, cart: JSON.parse(localStorage.getItem("cart") || "[]") };

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 2400); }
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const imageUrlFor = (p) => p.image_url || DEMO_IMAGES.get(String(p.name ?? "").toLowerCase()) || "";
const imgStyle = (p) => {
  const imageUrl = imageUrlFor(p);
  return imageUrl ? `background-image:url('${encodeURI(imageUrl)}')` : `--c:${p.color || "#ccc"}`;
};

// ---------- Catalogue ----------
async function loadProducts() {
  if (!configured) { state.products = DEMO; return; }
  const { data, error } = await sb.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (error) { toast("Could not load products"); state.products = []; state.catalogError = true; return; }
  state.catalogError = false;
  state.products = data;
  const byName = new Map(data.map((p) => [p.name.toLowerCase(), p]));
  let migrated = false;
  state.cart = state.cart.map((line) => {
    const product = byName.get(String(line.name).toLowerCase());
    if (!String(line.id).startsWith("demo") || !product) return line;
    migrated = true;
    return { ...line, id: product.id, name: product.name, price: product.price, image_url: product.image_url, color: product.color };
  });
  if (migrated) localStorage.setItem("cart", JSON.stringify(state.cart));
}
function renderCats() {
  const cats = ["All", ...new Set(state.products.map((p) => p.category))];
  $("#cats").innerHTML = cats.map((c) => `<button class="chip" aria-pressed="${c === state.cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
}
function renderGrid() {
  let list = state.products.filter((p) => (state.cat === "All" || p.category === state.cat) && p.name.toLowerCase().includes(state.q.toLowerCase()));
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  $("#productCount").textContent = state.catalogError ? "Catalog unavailable" : `${list.length} ${list.length === 1 ? "piece" : "pieces"} to love`;
  $("#grid").innerHTML = list.length ? list.map((p) => `
    <button class="card" data-id="${esc(p.id)}" aria-label="View ${esc(p.name)}, ${inr(p.price)}"><div class="img" style="${imgStyle(p)}"><span class="card-hint">Quick view&nbsp; ↗</span></div><h3>${esc(p.name)}</h3><p>${inr(p.price)}</p></button>`).join("")
    : `<p class="empty">${state.catalogError ? "Catalog unavailable. Apply supabase/schema.sql in your Supabase project, then reload." : "No products match. Try another category or search term."}</p>`;
}
function showShop(show) { $(".hero").hidden = $("#grid").parentElement.querySelector(".toolbar").hidden = $("#grid").hidden = !show; $("#ordersView").hidden = show; }

function openProduct(id) {
  const p = state.products.find((x) => String(x.id) === id); if (!p) return;
  let size = null;
  const d = $("#pdp");
  d.innerHTML = `<div class="pdp"><div class="img" style="${imgStyle(p)};aspect-ratio:4/5"></div>
    <div><h2>${esc(p.name)}</h2><div class="price">${inr(p.price)}</div><p>${esc(p.description)}</p>
    <h4 style="margin-top:20px">Size</h4><div class="sizes">${(p.sizes || []).map((s) => `<button data-size="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join("")}</div>
    <button class="primary" id="addBtn">Add to bag</button><p style="margin-top:12px"><button class="link" data-close>Close</button></p></div></div>`;
  d.onclick = (e) => {
    const b = e.target.closest("[data-size]");
    if (b) { size = b.dataset.size; d.querySelectorAll("[data-size]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    if (e.target.closest("[data-close]")) d.close();
    if (e.target.id === "addBtn") {
      if (!size) return toast("Choose a size first");
      addToCart(p, size); d.close();
    }
  };
  d.showModal();
}

// ---------- Cart ----------
function saveCart() { localStorage.setItem("cart", JSON.stringify(state.cart)); renderCart(); }
function addToCart(p, size) {
  const line = state.cart.find((l) => l.id === p.id && l.size === size);
  line ? line.qty++ : state.cart.push({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, color: p.color, size, qty: 1 });
  saveCart(); toast("Added to bag");
}
function renderCart() {
  $("#cartCount").textContent = state.cart.reduce((n, l) => n + l.qty, 0);
  $("#cartTotal").textContent = inr(state.cart.reduce((n, l) => n + l.qty * l.price, 0));
  $("#cartItems").innerHTML = state.cart.length ? state.cart.map((l, i) => {
    const imageUrl = imageUrlFor(l);
    const imageStyle = imageUrl ? "" : `--c:${esc(l.color || "#ccc")}`;
    return `
    <div class="item"><div class="img" style="${imageStyle}">${imageUrl ? `<img src="${esc(imageUrl)}" alt="">` : ""}</div>
    <div><strong>${esc(l.name)}</strong><div>Size ${esc(l.size)} · ${inr(l.price)}</div>
    <div class="qty"><button data-dec="${i}" aria-label="Decrease">−</button>${l.qty}<button data-inc="${i}" aria-label="Increase">+</button></div></div>
    <button class="link" data-rm="${i}">Remove</button></div>`;
  }).join("") : `<p class="empty">Your bag is empty. Pick something from the shop.</p>`;
}
function toggleDrawer(open) {
  $("#drawer").classList.toggle("open", open); $("#scrim").classList.toggle("on", open);
  $("#drawer").setAttribute("aria-hidden", !open);
  if (!open) { $("#checkoutForm").hidden = true; $("#checkoutBtn").textContent = "Checkout"; }
}

// ---------- Auth ----------
let signup = false;
function setUser(u) {
  state.user = u; $("#authBtn").textContent = u ? "Sign out" : "Sign in"; $("#ordersBtn").hidden = !u;
}
async function initAuth() {
  if (!sb) return;
  const { data } = await sb.auth.getSession(); setUser(data.session?.user ?? null);
  sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
}
$("#authBtn").onclick = async () => {
  if (state.user) { await sb.auth.signOut(); showShop(true); return toast("Signed out"); }
  if (!sb) return toast("Add your Supabase keys in config.js first");
  $("#authDlg").showModal();
};
$("#authSwitch").onclick = () => {
  signup = !signup; $("#authTitle").textContent = signup ? "Create account" : "Sign in";
  $("#authSwitch").textContent = signup ? "Have an account? Sign in" : "New here? Create an account";
};
$("#authForm").onsubmit = async (e) => {
  e.preventDefault(); const f = new FormData(e.target);
  const creds = { email: f.get("email"), password: f.get("password") };
  const { error } = signup ? await sb.auth.signUp(creds) : await sb.auth.signInWithPassword(creds);
  if (error) { $("#authErr").textContent = error.message; return; }
  $("#authErr").textContent = ""; $("#authDlg").close(); toast(signup ? "Check your email to confirm, then sign in" : "Signed in");
};

// ---------- Checkout (Razorpay) ----------
async function checkout() {
  if (!state.cart.length) return toast("Your bag is empty");
  if (!sb) return toast("Add your Supabase and Razorpay keys in config.js first");
  if (!C.RAZORPAY_KEY_ID) return toast("Razorpay checkout is not configured yet");
  if (!state.user) { toggleDrawer(false); return $("#authDlg").showModal(); }
  const form = $("#checkoutForm");
  if (form.hidden) { form.hidden = false; $("#checkoutBtn").textContent = "Pay with Razorpay"; return; }
  if (!form.reportValidity()) return;
  const address = Object.fromEntries(new FormData(form));
  const btn = $("#checkoutBtn"); btn.disabled = true;
  try {
    // 1. Server computes the amount from DB prices and creates the Razorpay order
    const { data: order, error } = await sb.functions.invoke("create-order", {
      body: { items: state.cart.map((l) => ({ product_id: l.id, size: l.size, qty: l.qty })), address },
    });
    if (error || order?.error) throw new Error(order?.error || error.message);
    // 2. Open Razorpay Checkout
    const rzp = new Razorpay({
      key: C.RAZORPAY_KEY_ID, amount: order.amount, currency: "INR", name: C.STORE_NAME,
      order_id: order.razorpay_order_id, prefill: { name: address.name, contact: address.phone, email: state.user.email },
      theme: { color: "#26357A" },
      handler: async (resp) => {
        // 3. Server verifies the signature before marking the order paid
        const { data: v, error: ve } = await sb.functions.invoke("verify-payment", { body: { ...resp, order_id: order.order_id } });
        if (ve || !v?.ok) return toast("Payment could not be verified. Contact support.");
        state.cart = []; saveCart(); toggleDrawer(false); toast("Order placed. Thank you!"); showOrders();
      },
      modal: { ondismiss: () => (btn.disabled = false) },
    });
    rzp.on("payment.failed", () => toast("Payment failed. Please try again."));
    rzp.open();
  } catch (e) { toast(e.message || "Checkout failed"); }
  btn.disabled = false;
}

// ---------- Orders ----------
async function showOrders() {
  showShop(false); const v = $("#ordersView"); v.innerHTML = `<h2>Your orders</h2><p class="empty">Loading…</p>`;
  const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
  if (error) { v.innerHTML = `<p class="err">Could not load orders.</p>`; return; }
  v.innerHTML = `<h2 style="font:700 28px var(--display);margin-bottom:16px">Your orders</h2>` + (data.length ? data.map((o) => `
    <div class="order"><div style="display:flex;justify-content:space-between"><strong>${inr(o.amount / 100)}</strong><span class="badge">${esc(o.status)}</span></div>
    <div>${new Date(o.created_at).toLocaleDateString("en-IN")}</div>
    <div>${(o.items || []).map((i) => `${esc(i.name)} (${esc(i.size)}) × ${i.qty}`).join(", ")}</div></div>`).join("") : `<p class="empty">No orders yet.</p>`);
}

// ---------- Events ----------
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.closest("[data-close]")) t.closest("dialog")?.close();
  const cat = t.closest("[data-cat]"); if (cat) { state.cat = cat.dataset.cat; renderCats(); renderGrid(); }
  const card = t.closest(".card"); if (card) openProduct(card.dataset.id);
  const inc = t.dataset.inc, dec = t.dataset.dec, rm = t.dataset.rm;
  if (inc != null) { state.cart[inc].qty++; saveCart(); }
  if (dec != null) { if (--state.cart[dec].qty < 1) state.cart.splice(dec, 1); saveCart(); }
  if (rm != null) { state.cart.splice(rm, 1); saveCart(); }
});
$("#search").oninput = (e) => { state.q = e.target.value; showShop(true); renderGrid(); };
$("#sort").onchange = (e) => { state.sort = e.target.value; renderGrid(); };
$("#cartBtn").onclick = () => toggleDrawer(true);
$("#closeCart").onclick = $("#scrim").onclick = () => toggleDrawer(false);
$("#checkoutBtn").onclick = checkout;
$("#ordersBtn").onclick = showOrders;
$("#logo").onclick = (e) => { e.preventDefault(); showShop(true); };

(async function init() {
  await Promise.all([loadProducts(), initAuth()]);
  renderCats(); renderGrid(); renderCart();
  if (!configured) toast("Demo mode: add Supabase keys in config.js");
})();
