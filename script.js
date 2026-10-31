// ============================================
// PREMIUM TECH STORE — COMPLETE CATALOG SYSTEM
// ============================================

const categories = [
  {
    id: "laptops",
    name: "Ноутбуки",
    brands: ["ASUS", "Lenovo", "HP", "Acer", "MSI", "Apple", "Dell"],
    models: ["Gaming", "Pro", "Ultra", "Book", "Air", "Studio"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85",
    min: 4000000,
    max: 30000000
  },
  {
    id: "computers",
    name: "Компьютеры",
    brands: ["ASUS ROG", "MSI", "Custom PC", "HP", "Acer", "Lenovo"],
    models: ["Gaming PC", "Workstation", "Office PC", "Creator PC"],
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=85",
    min: 5000000,
    max: 40000000
  },
  {
    id: "components",
    name: "Комплектующие",
    brands: ["ASUS", "MSI", "Gigabyte", "AMD", "Intel", "NVIDIA", "Kingston"],
    models: ["RTX Series", "Radeon Series", "Core Series", "Ryzen Series", "Gaming"],
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=85",
    min: 300000,
    max: 20000000
  },
  {
    id: "monitors",
    name: "Мониторы",
    brands: ["Samsung", "LG", "ASUS", "AOC", "Acer", "MSI"],
    models: ["Gaming", "UltraWide", "Curved", "Professional", "4K"],
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=85",
    min: 1000000,
    max: 12000000
  },
  {
    id: "accessories",
    name: "Аксессуары",
    brands: ["Logitech", "Razer", "HyperX", "SteelSeries", "Corsair"],
    models: ["Gaming", "Wireless", "Pro", "RGB", "Elite"],
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=85",
    min: 100000,
    max: 3000000
  },
  {
    id: "peripherals",
    name: "Периферия",
    brands: ["Logitech", "Razer", "Redragon", "Corsair", "HyperX"],
    models: ["Keyboard", "Mouse", "Headset", "Controller", "Gaming Set"],
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=85",
    min: 100000,
    max: 2500000
  }
];

// Generate 1500 demo products
function generateProducts() {
  const result = [];

  categories.forEach((category, categoryIndex) => {
    for (let i = 1; i <= 250; i++) {
      const brand = category.brands[i % category.brands.length];
      const model = category.models[i % category.models.length];

      const range = category.max - category.min;
      const price = Math.round(
        (category.min + ((i * 7919) % range)) / 10000
      ) * 10000;

      result.push({
        id: categoryIndex * 250 + i,
        name: `${brand} ${model} ${String(i).padStart(3, "0")}`,
        category: category.id,
        brand,
        sku: `PT-${categoryIndex + 1}-${String(i).padStart(4, "0")}`,
        price,
        rating: Number((4 + (i % 10) / 10).toFixed(1)),
        image: category.image,
        tag: i % 5 === 0 ? "SALE" : i % 3 === 0 ? "NEW" : "POPULAR",
        inStock: i % 8 !== 0,
        description: `${brand} ${model}. Демонстрационный товар каталога PREMIUM TECH.`
      });
    }
  });

  return result;
}

const products = generateProducts();

console.log("Каталог создан:", products.length, "товаров");

// ============================================
// APPLICATION STATE
// ============================================

const state = {
  category: "all",
  brand: "all",
  minPrice: 0,
  maxPrice: Infinity,
  search: "",
  sort: "popular",
  page: 1,
  perPage: 24,
  onlyStock: false,
  favoritesOnly: false
};

let cart = [];
let favorites = new Set();

const $ = id => document.getElementById(id);

const productGrid = $("productGrid");
const categoryGrid = $("categoryGrid");
const categoryFilters = $("categoryFilters");
const brandFilters = $("brandFilters");
const pagination = $("pagination");

// ============================================
// HELPERS
// ============================================

function money(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " сум";
}

function categoryName(id) {
  return categories.find(category => category.id === id)?.name || id;
}

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

// ============================================
// CATEGORY CARDS
// ============================================

function renderCategories() {
  categoryGrid.innerHTML = categories.map((category, index) => `
    <button class="category-card" data-category="${category.id}">
      <img src="${category.image}" alt="${category.name}" loading="lazy">
      <span>
        <b>${category.name}</b>
        <small>${String(index + 1).padStart(2, "0")} / 06 · 250 товаров</small>
      </span>
    </button>
  `).join("");
}

categoryGrid.addEventListener("click", event => {
  const card = event.target.closest("[data-category]");
  if (!card) return;

  state.category = card.dataset.category;
  state.brand = "all";
  state.page = 1;
  state.favoritesOnly = false;

  syncFilterButtons();
  renderAll();
  $("catalog").scrollIntoView({ behavior: "smooth" });
});

// ============================================
// FILTER SIDEBAR
// ============================================

function renderCategoryFilters() {
  const counts = categories.map(category => ({
    ...category,
    count: products.filter(p => p.category === category.id).length
  }));

  categoryFilters.innerHTML = `
    <label class="filter-option">
      <input type="radio" name="category" value="all"
        ${state.category === "all" ? "checked" : ""}>
      Все категории <small>1500</small>
    </label>
    ${counts.map(category => `
      <label class="filter-option">
        <input type="radio" name="category" value="${category.id}"
          ${state.category === category.id ? "checked" : ""}>
        ${category.name}<small>${category.count}</small>
      </label>
    `).join("")}
  `;

  categoryFilters.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      state.category = input.value;
      state.brand = "all";
      state.page = 1;
      renderAll();
    });
  });
}

function renderBrandFilters() {
  let available = products;

  if (state.category !== "all") {
    available = available.filter(p => p.category === state.category);
  }

  const brands = [...new Set(available.map(p => p.brand))].sort();

  if (!brands.includes(state.brand)) {
    state.brand = "all";
  }

  brandFilters.innerHTML = `
    <label class="filter-option">
      <input type="radio" name="brand" value="all"
        ${state.brand === "all" ? "checked" : ""}>
      Все бренды
    </label>
    ${brands.map(brand => `
      <label class="filter-option">
        <input type="radio" name="brand" value="${brand}"
          ${state.brand === brand ? "checked" : ""}>
        ${brand}
      </label>
    `).join("")}
  `;

  brandFilters.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      state.brand = input.value;
      state.page = 1;
      renderAll();
    });
  });
}

function syncFilterButtons() {
  document.querySelectorAll("#categoryFilters input").forEach(input => {
    input.checked = input.value === state.category;
  });
}

// ============================================
// PRODUCT FILTERING
// ============================================

function getFilteredProducts() {
  let result = products.filter(product => {
    const matchesCategory =
      state.category === "all" ||
      product.category === state.category;

    const matchesBrand =
      state.brand === "all" ||
      product.brand === state.brand;

    const matchesPrice =
      product.price >= state.minPrice &&
      product.price <= state.maxPrice;

    const query = state.search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      categoryName(product.category).toLowerCase().includes(query);

    const matchesStock =
      !state.onlyStock || product.inStock;

    const matchesFavorite =
      !state.favoritesOnly || favorites.has(product.id);

    return matchesCategory &&
      matchesBrand &&
      matchesPrice &&
      matchesSearch &&
      matchesStock &&
      matchesFavorite;
  });

  if (state.sort === "low") {
    result.sort((a, b) => a.price - b.price);
  } else if (state.sort === "high") {
    result.sort((a, b) => b.price - a.price);
  } else if (state.sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

// ============================================
// PRODUCT CARDS
// ============================================

function renderProducts() {
  const filtered = getFilteredProducts();

  const totalPages = Math.ceil(filtered.length / state.perPage);

  if (state.page > Math.max(totalPages, 1)) {
    state.page = 1;
  }

  const start = (state.page - 1) * state.perPage;
  const visible = filtered.slice(start, start + state.perPage);

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image" data-view="${product.id}">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>

        <button class="favorite-btn ${favorites.has(product.id) ? "active" : ""}"
          data-favorite="${product.id}" aria-label="Add to favorites">
          <i class="fa-solid fa-heart"></i>
        </button>
      </div>

      <div class="product-info">
        <span class="product-category">${categoryName(product.category)}</span>
        <h3>${product.name}</h3>
        <div class="product-meta">
          ${product.brand} · ${product.sku}
        </div>
        <div class="product-rating">★★★★★ ${product.rating}</div>

        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button class="add-cart" data-add="${product.id}"
            aria-label="Add to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `).join("");

  $("catalogCount").textContent =
    `Найдено: ${filtered.length} из ${products.length}`;

  $("activeFilter").textContent =
    state.favoritesOnly ? "Избранные товары" :
    state.category === "all" ? "Все товары" :
    categoryName(state.category);

  $("emptyState").hidden = filtered.length !== 0;

  renderPagination(totalPages);
}

// ============================================
// PAGINATION
// ============================================

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = `
    <button class="page-btn" data-page="${state.page - 1}"
      ${state.page === 1 ? "disabled" : ""}>←</button>
  `;

  let pages = [];

  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = [1];

    if (state.page > 3) pages.push("...");

    for (
      let i = Math.max(2, state.page - 1);
      i <= Math.min(totalPages - 1, state.page + 1);
      i++
    ) {
      pages.push(i);
    }

    if (state.page < totalPages - 2) pages.push("...");

    pages.push(totalPages);
  }

  html += pages.map(page => {
    if (page === "...") {
      return `<span class="page-dots">...</span>`;
    }

    return `
      <button class="page-btn ${page === state.page ? "active" : ""}"
        data-page="${page}">${page}</button>
    `;
  }).join("");

  html += `
    <button class="page-btn" data-page="${state.page + 1}"
      ${state.page === totalPages ? "disabled" : ""}>→</button>
  `;

  pagination.innerHTML = html;
}

pagination.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;

  const page = Number(button.dataset.page);

  if (page > 0) {
    state.page = page;
    renderProducts();
    $("catalog").scrollIntoView({ behavior: "smooth" });
  }
});

// ============================================
// PRICE FILTER
// ============================================

$("applyPrice").addEventListener("click", () => {
  const min = Number($("minPrice").value) || 0;
  const max = $("maxPrice").value
    ? Number($("maxPrice").value)
    : Infinity;

  if (min < 0 || max < min) {
    toast("Проверь диапазон цен");
    return;
  }

  state.minPrice = min;
  state.maxPrice = max;
  state.page = 1;

  renderProducts();
});

$("inStock").addEventListener("change", event => {
  state.onlyStock = event.target.checked;
  state.page = 1;
  renderProducts();
});

// ============================================
// SEARCH
// ============================================

$("searchToggle").addEventListener("click", () => {
  $("searchPanel").classList.toggle("show");
  $("searchInput").focus();
});

$("searchClose").addEventListener("click", () => {
  $("searchPanel").classList.remove("show");
});

$("searchInput").addEventListener("input", event => {
  state.search = event.target.value.trim();
  state.page = 1;
  renderProducts();
});

// ============================================
// SORTING
// ============================================

$("sortSelect").addEventListener("change", event => {
  state.sort = event.target.value;
  state.page = 1;
  renderProducts();
});

// ============================================
// FAVORITES
// ============================================

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    toast("Удалено из избранного");
  } else {
    favorites.add(id);
    toast("Добавлено в избранное");
  }

  renderProducts();
}

productGrid.addEventListener("click", event => {
  const favorite = event.target.closest("[data-favorite]");
  const add = event.target.closest("[data-add]");
  const view = event.target.closest("[data-view]");

  if (favorite) {
    toggleFavorite(Number(favorite.dataset.favorite));
    return;
  }

  if (add) {
    addToCart(Number(add.dataset.add));
    return;
  }

  if (view) {
    const product = products.find(p => p.id === Number(view.dataset.view));
    if (product) {
      toast(`${product.name} · ${money(product.price)}`);
    }
  }
});

$("favoritesToggle").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  state.page = 1;
  state.category = "all";
  state.brand = "all";
  renderAll();
  $("catalog").scrollIntoView({ behavior: "smooth" });
});

// ============================================
// SHOPPING CART
// ============================================

function addToCart(id) {
  const item = cart.find(p => p.id === id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  updateCart();
  toast("Товар добавлен в корзину");
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  $("cartCount").textContent = count;
  $("cartTotal").textContent = money(total);

  if (!cart.length) {
    $("cartItems").innerHTML =
      `<p style="text-align:center;color:#92908a;padding:35px">Корзина пока пуста.</p>`;
    return;
  }

  $("cartItems").innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <div class="cart-row">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <small>${money(product.price)} × ${item.quantity}</small>
        </div>
        <button data-remove="${product.id}" aria-label="Remove">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join("");
}

$("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (button) removeFromCart(Number(button.dataset.remove));
});

function openCart() {
  $("cartDrawer").classList.add("open");
  $("overlay").classList.add("show");
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("overlay").classList.remove("show");
}

$("cartOpen").addEventListener("click", openCart);
$("cartClose").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    toast("Сначала добавь товар");
    return;
  }

  toast("Оформление заказов подключим следующим этапом");
});

// ============================================
// RESET FILTERS
// ============================================

$("resetFilters").addEventListener("click", () => {
  Object.assign(state, {
    category: "all",
    brand: "all",
    minPrice: 0,
    maxPrice: Infinity,
    search: "",
    sort: "popular",
    page: 1,
    onlyStock: false,
    favoritesOnly: false
  });

  $("minPrice").value = "";
  $("maxPrice").value = "";
  $("inStock").checked = false;
  $("searchInput").value = "";
  $("sortSelect").value = "popular";

  renderAll();
  toast("Фильтры сброшены");
});

// ============================================
// LANGUAGE SWITCH — BASIC UI
// ============================================

const languageText = {
  ru: {
    home: "Главная",
    categories: "Категории",
    catalog: "Каталог",
    contacts: "Контакты"
  },
  uz: {
    home: "Bosh sahifa",
    categories: "Kategoriyalar",
    catalog: "Katalog",
    contacts: "Aloqa"
  },
  en: {
    home: "Home",
    categories: "Categories",
    catalog: "Catalog",
    contacts: "Contacts"
  }
};

$("language").addEventListener("change", event => {
  const language = languageText[event.target.value];

  document.querySelectorAll(".nav a").forEach((link, index) => {
    const keys = ["home", "categories", "catalog", "contacts"];
    link.textContent = language[keys[index]];
  });

  document.documentElement.lang = event.target.value;
});

// ============================================
// MOBILE MENU
// ============================================

$("menuToggle").addEventListener("click", () => {
  $("nav").classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    $("nav").classList.remove("open");
  });
});

// ============================================
// BUILDER PLACEHOLDER
// ============================================

$("builderButton").addEventListener("click", () => {
  toast("3D-конфигуратор появится на следующем этапе");
});

// ============================================
// KEYBOARD
// ============================================

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    $("searchPanel").classList.remove("show");
  }
});

// ============================================
// INITIALIZATION
// ============================================

function renderAll() {
  renderCategoryFilters();
  renderBrandFilters();
  renderProducts();
}

renderCategories();
renderAll();
updateCart();

console.log("PREMIUM TECH запущен!");
console.log("Количество товаров:", products.length);

// SCROLL REVEAL ANIMATION

const revealElements = document.querySelectorAll(
  ".section-heading, .category-card, .benefits > div, .promo, .newsletter"
);

revealElements.forEach(element => {
  element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

revealElements.forEach(element => {
  revealObserver.observe(element);
});

// =================================
// 3D MOUSE TILT EFFECT
// =================================

function activate3DTilt() {
  const cards = document.querySelectorAll(
    ".product-card, .category-card"
  );

  cards.forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-5px)
        scale3d(1.02, 1.02, 1.02)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Повторно активируем после обновления каталога
const originalRenderProducts = renderProducts;

renderProducts = function() {
  originalRenderProducts();
  activate3DTilt();
};

activate3DTilt();