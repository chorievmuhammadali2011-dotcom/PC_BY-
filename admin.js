
const STORAGE_KEY = "premiumTechProducts";

let products = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const categories = [
  "Ноутбуки",
  "Компьютеры",
  "Комплектующие",
  "Мониторы",
  "Периферия",
  "Аксессуары"
];

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  renderAll();
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(item => {
    item.classList.add("hidden");
  });

  document.getElementById(page).classList.remove("hidden");

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  const titles = {
    dashboard: "Панель управления",
    products: "Управление товарами",
    orders: "Заказы",
    categories: "Категории"
  };

  document.getElementById("pageTitle").textContent = titles[page];
}

document.querySelectorAll(".nav").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

function openProductForm(id = null) {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";

  if (id !== null) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    document.getElementById("formTitle").textContent = "Редактировать товар";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
    document.getElementById("productImage").value = product.image || "";
  } else {
    document.getElementById("formTitle").textContent = "Новый товар";
  }

  document.getElementById("productModal").classList.remove("hidden");
}

function closeProductForm() {
  document.getElementById("productModal").classList.add("hidden");
}

document.getElementById("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("productId").value;

  const product = {
    id: id || String(Date.now()),
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value,
    price: Number(document.getElementById("productPrice").value),
    stock: Number(document.getElementById("productStock").value),
    image: document.getElementById("productImage").value.trim()
  };

  if (!product.name || product.price < 0 || product.stock < 0) {
    alert("Проверь введённые данные");
    return;
  }

  if (id) {
    products = products.map(item => item.id === id ? product : item);
  } else {
    products.push(product);
  }

  saveProducts();
  closeProductForm();
});

function editProduct(id) {
  openProductForm(id);
}

function deleteProduct(id) {
  if (!confirm("Удалить этот товар?")) return;

  products = products.filter(item => item.id !== id);
  saveProducts();
}

function renderProducts(search = "") {
  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const table = document.getElementById("productTable");

  if (!filtered.length) {
    table.innerHTML = `
      <tr><td colspan="5">Товары не найдены</td></tr>
    `;
    return;
  }

  table.innerHTML = filtered.map(product => `
    <tr>
      <td>${escapeHTML(product.name)}</td>
      <td>${escapeHTML(product.category)}</td>
      <td>${product.price.toLocaleString("ru-RU")} UZS</td>
      <td>${product.stock}</td>
      <td>
        <button class="action" onclick="editProduct('${product.id}')">Изменить</button>
        <button class="action delete" onclick="deleteProduct('${product.id}')">Удалить</button>
      </td>
    </tr>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderAll() {
  document.getElementById("totalProducts").textContent = products.length;
  document.getElementById("totalOrders").textContent = "0";
  document.getElementById("totalCategories").textContent = categories.length;

  renderProducts(document.getElementById("searchProduct").value || "");

  document.getElementById("categoryList").innerHTML =
    categories.map(category =>
      `<div class="category-item">${category}</div>`
    ).join("");

  document.getElementById("orderList").textContent =
    "Пока заказов нет. Подключим их через Firebase.";
}

document.getElementById("searchProduct").addEventListener("input", event => {
  renderProducts(event.target.value);
});

renderAll();
