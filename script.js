const phoneNumber = "5521985793674";

const pizzas = [
  { name: "Mussarela", grande: 59.9, broto: 49.9 },
  { name: "Marguerita", grande: 59.9, broto: 49.9 },
  { name: "Pizza de Alho", grande: 59.9, broto: 49.9 },
  { name: "Calabresa Acebolada", grande: 59.9, broto: 49.9 },
  { name: "4 Queijos", grande: 89.9, broto: 79.9 },
  { name: "Doce de Leite com Amendoim", grande: 39.9, broto: 29.9 },
];

const pixKey = "64832883/0001-89";

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

const customerName = document.querySelector("#customer-name");
const customerAddress = document.querySelector("#customer-address");
const paymentSelect = document.querySelector("#payment");

const copyPixButton = document.querySelector("#copy-pix");
const copyPixStatus = document.querySelector("#copy-pix-status");


/* =========================
   FORMATAÇÃO DE VALORES
========================= */

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


/* =========================
   PREENCHER SABORES
========================= */

function fillFlavorSelects() {
  const options = pizzas
    .map(
      (pizza, index) =>
        `<option value="${index}">${pizza.name}</option>`
    )
    .join("");

  flavorOneSelect.innerHTML = options;
  flavorTwoSelect.innerHTML = options;
}


/* =========================
   MEIO A MEIO
========================= */

function updateHalfHalfState() {
  const isGrande = sizeSelect.value === "grande";

  halfHalfInput.disabled = !isGrande;

  if (!isGrande) {
    halfHalfInput.checked = false;
  }

  secondFlavorRow.classList.toggle(
    "is-visible",
    halfHalfInput.checked && isGrande
  );
}


/* =========================
   CARRINHO
========================= */

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
    cartList.innerHTML =
      '<p class="empty-cart">Nenhum item adicionado.</p>';
  } else {
    cartList.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <span>${formatCurrency(item.price)}</span>
            </div>

            <button
              type="button"
              aria-label="Remover ${item.name}"
              data-remove="${index}"
            >
              Remover
            </button>
          </div>
        `
      )
      .join("");
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  cartTotal.textContent = formatCurrency(total);

  updateWhatsAppLink();
}


/* =========================
   LINK DO WHATSAPP
========================= */

function updateWhatsAppLink() {
  const name = customerName.value.trim();
  const apartment = customerAddress.value.trim();
  const payment = paymentSelect.value;

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  const orderLines = cart.length
    ? cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - ${formatCurrency(item.price)}`
        )
        .join("\n")
    : "Ainda vou escolher os itens.";

  const message = [
    "🍕 Olá, quero fazer um pedido:",
    "",
    orderLines,
    "",
    `💰 Total: ${formatCurrency(total)}`,
    "",
    `👤 Nome: ${name || "Não informado"}`,
    `🏠 Apartamento: ${apartment || "Não informado"}`,
    `💳 Pagamento: ${payment}`,
    payment === "Pix"
      ? `🔑 Chave Pix: ${pixKey}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  sendOrder.href =
    `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}


/* =========================
   COPIAR PIX
========================= */

async function copyPixKey() {
  try {
    await navigator.clipboard.writeText(pixKey);

    copyPixStatus.textContent =
      "Chave Pix copiada.";

  } catch (error) {

    copyPixStatus.textContent =
      "Copie manualmente: " + pixKey;
  }
}


/* =========================
   ADICIONAR PIZZA
========================= */

addPizzaButton.addEventListener("click", () => {

  const size = sizeSelect.value;

  const firstPizza =
    pizzas[Number(flavorOneSelect.value)];

  const secondPizza =
    pizzas[Number(flavorTwoSelect.value)];

  const isHalfHalf =
    halfHalfInput.checked &&
    size === "grande";


  /* MEIO A MEIO */

  if (isHalfHalf) {

    const price = Math.max(
      firstPizza.grande,
      secondPizza.grande
    );

    addCartItem({
      name:
        `Pizza Grande meio a meio: ${firstPizza.name} / ${secondPizza.name}`,
      price: price,
    });

    return;
  }


  /* PIZZA NORMAL */

  addCartItem({
    name:
      `Pizza ${size === "grande" ? "Grande" : "Broto"}: ${firstPizza.name}`,

    price:
      firstPizza[size],
  });

});


/* =========================
   REMOVER ITEM DO CARRINHO
========================= */

cartList.addEventListener("click", (event) => {

  const removeButton =
    event.target.closest("[data-remove]");

  if (removeButton) {

    const index =
      Number(removeButton.dataset.remove);

    removeCartItem(index);
  }

});


/* =========================
   EVENTOS
========================= */

sizeSelect.addEventListener(
  "change",
  updateHalfHalfState
);

halfHalfInput.addEventListener(
  "change",
  updateHalfHalfState
);

customerName.addEventListener(
  "input",
  updateWhatsAppLink
);

customerAddress.addEventListener(
  "input",
  updateWhatsAppLink
);

paymentSelect.addEventListener(
  "change",
  updateWhatsAppLink
);

copyPixButton.addEventListener(
  "click",
  copyPixKey
);


/* =========================
   INICIALIZAÇÃO
========================= */

fillFlavorSelects();

updateHalfHalfState();

renderCart();
