document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("product-grid");
  const loader = document.getElementById("loader");
  const cartBtn = document.getElementById("cart-btn");
  const cartCount = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const closeCart = document.getElementById("close-cart");
  const waAll = document.getElementById("wa-all");

  const modal = document.getElementById("productModal");
  const modalAddToCartBtn = document.getElementById("modal-add-to-cart");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const whatsappBtn = document.getElementById("whatsapp-btn");
  const modalImage = document.getElementById("modal-image");
  const modalProductName = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-price");
  const modalDescription = document.getElementById("modal-description");
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category-select");

  const WHATSAPP_NUMBER = "6285785036109";
  let products = [];
  let cart = [];
  let filtered = [];

  // === Fetch produk dan kategori ===
  async function fetchProducts() {
    const res = await fetch("https://fakestoreapi.com/products");
    products = await res.json();
    filtered = [...products];
    loader.style.display = "none";
    displayProducts(filtered);
    fetchCategories();
  }

  async function fetchCategories() {
    const res = await fetch("https://fakestoreapi.com/products/categories");
    const categories = await res.json();
    categories.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c.toUpperCase();
      categorySelect.appendChild(opt);
    });
  }

  // === Filter dan pencarian ===
  searchInput.addEventListener("input", () => filterProducts());
  categorySelect.addEventListener("change", () => filterProducts());

  function filterProducts() {
    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    filtered = products.filter(p => 
      (category === "all" || p.category === category) &&
      p.title.toLowerCase().includes(search)
    );
    displayProducts(filtered);
  }

  // === Tampilkan produk ===
  function displayProducts(list) {
    productGrid.innerHTML = "";
    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card cursor-pointer overflow-hidden";
      card.innerHTML = `
        <div class="p-4 h-48 flex items-center justify-center">
          <img src="${p.image}" alt="${p.title}" class="max-h-full max-w-full object-contain">
        </div>
        <div class="p-4 border-t">
          <h3 class="text-md font-semibold text-blue-900">${p.title.substring(0, 40)}...</h3>
          <p class="text-lg font-bold text-blue-700 mt-2">Rp ${(p.price * 15000).toLocaleString("id-ID")}</p>
        </div>`;
      card.onclick = () => showProductDetail(p.id);
      productGrid.appendChild(card);
    });
  }

  // === Detail produk ===
  function showProductDetail(id) {
    const p = products.find(pr => pr.id == id);
    modalImage.src = p.image;
    modalProductName.textContent = p.title;
    modalPrice.textContent = `Rp ${(p.price * 15000).toLocaleString("id-ID")}`;
    modalDescription.textContent = p.description;
    modal.classList.remove("hidden");

    modalAddToCartBtn.onclick = () => {
      addToCart(p);
      modal.classList.add("hidden");
    };

    const pesan = `Halo, saya tertarik dengan *${p.title}*. Apakah masih tersedia?`;
    whatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`;
  }

  // === Tambahkan ke keranjang ===
  function addToCart(p) {
    const exist = cart.find(i => i.id === p.id);
    if (exist) exist.qty++;
    else cart.push({ ...p, qty: 1 });
    updateCart();
  }

  // === Update isi keranjang ===
  function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(c => {
      const subtotal = c.qty * c.price * 15000;
      total += subtotal;
      const div = document.createElement("div");
      div.className = "flex justify-between items-center border-b py-2";
      div.innerHTML = `
        <span class="w-1/2">${c.title.substring(0, 30)}...</span>
        <div class="flex items-center space-x-2">
          <button class="px-2 bg-blue-200 rounded" data-id="${c.id}" data-action="minus">-</button>
          <span>${c.qty}</span>
          <button class="px-2 bg-blue-200 rounded" data-id="${c.id}" data-action="plus">+</button>
        </div>
        <span class="text-blue-700 font-semibold">Rp ${subtotal.toLocaleString("id-ID")}</span>`;
      cartItems.appendChild(div);
    });

    cartTotal.textContent = `Total: Rp ${total.toLocaleString("id-ID")}`;
    cartCount.textContent = cart.reduce((a, b) => a + b.qty, 0);
    waAll.classList.toggle("hidden", cart.length === 0);

    const pesan = cart.map(i => `- ${i.title} (${i.qty}x)`).join("%0A");
    waAll.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Halo,%20saya%20ingin%20memesan:%0A${pesan}%0ATotal%20Rp%20${total.toLocaleString("id-ID")}`;
  }

  // === Event tombol plus/minus ===
  cartItems.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (btn.dataset.action === "plus") item.qty++;
    else if (btn.dataset.action === "minus") item.qty--;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    updateCart();
  });

  // === Modal handling ===
  cartBtn.onclick = () => { updateCart(); cartModal.classList.remove("hidden"); };
  closeCart.onclick = () => cartModal.classList.add("hidden");
  closeModalBtn.onclick = () => modal.classList.add("hidden");
  modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };
  cartModal.onclick = e => { if (e.target === cartModal) cartModal.classList.add("hidden"); };

  fetchProducts();
});
