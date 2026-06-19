const phoneNumber = "5521985793674";

const pizzas = [
  { name: "Mussarela", grande: 59.9, broto: 49.9 },
  { name: "Marguerita", grande: 59.9, broto: 49.9 },
  { name: "Pizza de Alho", grande: 59.9, broto: 49.9 },
  { name: "Calabresa Acebolada", grande: 59.9, broto: 49.9 },
  { name: "4 Queijos", grande: 89.9, broto: 79.9 },
  { name: "Doce de Leite com Amendoim", grande: 39.9, broto: 29.9 },
];

const cart = [];

const sizeSelect = document.querySelector("#pizza-size");
const flavorOneSelect = document.querySelector("#flavor-one");
const flavorTwoSelect = document.querySelector("#flavor-two");
const halfHalfInput = document.querySelector("#half-half");
const secondFlavorRow = document.querySelector("#second-flavor-row");
const addPizzaButton = document.querySelector("#add-pizza");
const cartList = document.querySelector("#cart-list");
const cartTotal = document.querySelector("#cart-total");
const sendOrder = document.querySelector("#send-order");
const pixKey = "64832883/0001-89";
const copyPixButton = document.querySelector("#copy-pix");
const copyPixStatus = document.querySelector("#copy-pix-status");

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fillFlavorSelects() {
  const options = pizzas
    .map((pizza, index) => `<option value="${index}">${pizza.name}</option>`)
    .join("");

  flavorOneSelect.innerHTML = options;
  flavorTwoSelect.innerHTML = options;
}

function updateHalfHalfState() {
  const isGrande = sizeSelect.value === "grande";

  halfHalfInput.disabled = !isGrande;
  if (!isGrande) {
    halfHalfInput.checked = false;
  }

  secondFlavorRow.classList.toggle("is-visible", halfHalfInput.checked && isGrande);
}

function addCartItem(item) {
  cart.push(item);
  renderCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Nenhum item adicionado.</p>';
  } else {
    cartList.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <span>${formatCurrency(item.price)}</span>
            </div>
            <button type="button" aria-label="Remover ${item.name}" data-remove="${index}">Remover</button>
          </div>
        `,
      )
      .join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatCurrency(total);
  updateWhatsAppLink();
}

function updateWhatsAppLink() {
  const name = document.querySelector("#customer-name").value.trim();
  const apartment = document.querySelector("#customer-address").value.trim();
  const payment = document.querySelector("#payment").value;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const orderLines = cart.length
    ? cart.map((item, index) => `${index + 1}. ${item.name} - ${formatCurrency(item.price)}`).join("\n")
    : "Ainda vou escolher os itens.";

  const message = [
    "Ola, quero fazer um pedido:",
    "",
    orderLines,
    "",
    `Total: ${formatCurrency(total)}`,
    "",
    `Nome: ${name || ""}`,
    `Apartamento: ${apartment || ""}`,
    `Pagamento: ${payment}`,
    payment === "Pix" ? `Chave Pix: ${pixKey}` : "",
  ].join("\n");

  sendOrder.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

async function copyPixKey() {
  try {
    await navigator.clipboard.writeText(pixKey);
    copyPixStatus.textContent = "Chave Pix copiada.";
  } catch (error) {
    copyPixStatus.textContent = "Copie manualmente: " + pixKey;
  }
}

addPizzaButton.addEventListener("click", () => {
  const size = sizeSelect.value;
  const firstPizza = pizzas[Number(flavorOneSelect.value)];
  const secondPizza = pizzas[Number(flavorTwoSelect.value)];
  const isHalfHalf = halfHalfInput.checked && size === "grande";

  if (isHalfHalf) {
    const price = Math.max(firstPizza.grande, secondPizza.grande);
    addCartItem({
      name: `Pizza Grande meio a meio: ${firstPizza.name} / ${secondPizza.name}`,
      price,
    });
    return;
  }

  addCartItem({
    name: `Pizza ${size === "grande" ? "Grande" : "Broto"}: ${firstPizza.name}`,
    price: firstPizza[size],
  });
});

document.querySelectorAll("[data-drink]").forEach((button) => {
  button.addEventListener("click", () => {
    addCartItem({
      name: button.dataset.drink,
      price: Number(button.dataset.price),
    });
  });
});

cartList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    removeCartItem(Number(removeButton.dataset.remove));
  }
});

sizeSelect.addEventListener("change", updateHalfHalfState);
halfHalfInput.addEventListener("change", updateHalfHalfState);
document.querySelector("#customer-name").addEventListener("input", updateWhatsAppLink);
document.querySelector("#customer-address").addEventListener("input", updateWhatsAppLink);
document.querySelector("#payment").addEventListener("change", updateWhatsAppLink);
copyPixButton.addEventListener("click", copyPixKey);

fillFlavorSelects();
updateHalfHalfState();
renderCart();
