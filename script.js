const menu = document.getElementById("menu"); // container menu
const cartBtn = document.getElementById("cart-btn"); // botao do carrinho
const cartModal = document.getElementById("cart-modal"); // modal carrinho
const cartItemsContainer = document.getElementById("cart-items"); // items dentro do carrinho
const cartTotal = document.getElementById("cart-total"); // texto do total
const checkoutBtn = document.getElementById("checkout-btn"); // button finalizar pedido
const closeModalBtn = document.getElementById("close-modal-btn"); // botão de encerrar o modal
const cartCounter = document.getElementById("cart-count"); // número de pedidos no carrinho
const addressInput = document.getElementById("address"); // caixa de e-mail
const addressWarn = document.getElementById("address-warn"); // aviso para por e-mail

// Modal de personalização
const customizeModal = document.getElementById("customize-modal");
const customizeModalContent = document.getElementById("customize-modal-content");
const closeCustomizeBtn = document.getElementById("close-customize-btn");
const confirmAddBtn = document.getElementById("confirm-add-btn");

let cart = [];
let currentProduct = null; // produto sendo personalizado

// Configuração de adicionais por categoria
const extrasConfig = {
  // Adicionais para Xis (pagos)
  xis: [
    { name: "Ovo", price: 1.50 },
    { name: "Cebola", price: 1.50 },
    { name: "Pimentão", price: 1.50 },
    { name: "Batata palha", price: 1.50 },
    { name: "Requeijão", price: 2.00 },
    { name: "Queijo cheddar", price: 2.50 },
    { name: "Queijo", price: 1.50 },
    { name: "Presunto", price: 2.00 },
    { name: "Salsicha", price: 2.00 },
    { name: "Filé", price: 19.90 },
    { name: "Bacon", price: 4.00 },
    { name: "Calabresa", price: 4.00 },
    { name: "Coração", price: 4.00 },
    { name: "Frango", price: 4.00 },
    { name: "Carne moída", price: 4.00 },
    { name: "Alcatra", price: 12.00 },
    { name: "Cordeiro", price: 13.50 }
  ],
  // Adicionais para Cachorro Quente (grátis)
  "cachorro-quente": [
    { name: "Milho", price: 0 },
    { name: "Ervilha", price: 0 },
    { name: "Tomate", price: 0 },
    { name: "Maionese", price: 0 },
    { name: "Catchup", price: 0 },
    { name: "Mostarda", price: 0 }
  ]
};

// Opções base para Mini Xis
const miniXisOptions = [
  { name: "Sem fritas", price: 17.90 },
  { name: "Com fritas", price: 22.90 }
];

// Função para identificar categoria do produto
function getProductCategory(productName) {
  if (productName.startsWith("mini-xis")) return "mini-xis";
  if (productName.startsWith("xis")) return "xis";
  if (productName.startsWith("cachorro") || productName.startsWith("hot-dog")) return "cachorro-quente";
  return null;
}

// abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.classList.add("show");
  document.body.style.overflow = "hidden";

  // Animar entrada do conteúdo
  const content = document.getElementById("cart-modal-content");
  setTimeout(() => {
    content.style.transform = "scale(1)";
    content.style.opacity = "1";
  }, 10);
});

// fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    closeCart();
  }
});

// fechar o modal quando clicar no botão
closeModalBtn.addEventListener("click", function () {
  closeCart();
});

// função para fechar o carrinho com animação
function closeCart() {
  const content = document.getElementById("cart-modal-content");
  content.style.transform = "scale(0.95)";
  content.style.opacity = "0";
  setTimeout(() => {
    cartModal.classList.remove("show");
    document.body.style.overflow = "";
  }, 200);
}

// põe os items no carrinho ao clicar no botão correspondente
menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    // Pegar a imagem do card pai (subir até o card principal com gap-3)
    const card = parentButton.closest(".gap-3");
    const img = card ? card.querySelector("img") : null;
    const imgSrc = img ? img.src : "";

    // Animação de feedback visual
    parentButton.classList.add("added");
    setTimeout(() => {
      parentButton.classList.remove("added");
    }, 400);

    // Verificar se produto tem adicionais
    const category = getProductCategory(name);
    if (category) {
      openCustomizeModal(name, price, imgSrc, category);
    } else {
      // Adicionar direto ao carrinho (bebidas, porções, etc.)
      addToCart(name, price, imgSrc, [], null);
    }
  }
});

// Abrir modal de personalização
function openCustomizeModal(name, price, imgSrc, category) {
  currentProduct = { name, price, imgSrc, category };

  // Preencher informações do produto
  document.getElementById("customize-img").src = imgSrc;
  document.getElementById("customize-name").textContent = formatName(name);
  document.getElementById("customize-base-price").textContent = `R$ ${price.toFixed(2)}`;

  // Limpar containers
  const baseOptionsContainer = document.getElementById("base-options-container");
  const baseOptions = document.getElementById("base-options");
  const extrasContainer = document.getElementById("extras-container");
  const extrasList = document.getElementById("extras-list");
  const extrasTitle = document.getElementById("extras-title");

  baseOptionsContainer.classList.add("hidden");
  baseOptions.innerHTML = "";
  extrasList.innerHTML = "";

  // Mini Xis: mostrar opções base
  if (category === "mini-xis") {
    baseOptionsContainer.classList.remove("hidden");
    miniXisOptions.forEach((option, index) => {
      baseOptions.innerHTML += `
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
          <input type="radio" name="base-option" value="${option.price}" data-name="${option.name}"
            class="w-5 h-5 accent-red-500" ${index === 0 ? 'checked' : ''} />
          <span class="flex-1 font-medium">${option.name}</span>
          <span class="text-red-500 font-semibold">R$ ${option.price.toFixed(2)}</span>
        </label>
      `;
    });
    // Atualizar preço base
    currentProduct.price = miniXisOptions[0].price;
    currentProduct.baseOption = miniXisOptions[0].name;
  }

  // Carregar adicionais
  let extras = [];
  if (category === "mini-xis" || category === "xis") {
    extras = extrasConfig.xis;
    extrasTitle.textContent = "Adicionais:";
  } else if (category === "cachorro-quente") {
    extras = extrasConfig["cachorro-quente"];
    extrasTitle.textContent = "Adicionais (grátis):";
  }

  if (extras.length > 0) {
    extrasContainer.classList.remove("hidden");
    extras.forEach((extra) => {
      const priceText = extra.price > 0 ? `+R$ ${extra.price.toFixed(2)}` : "Grátis";
      const priceClass = extra.price > 0 ? "text-red-500" : "text-green-500";
      extrasList.innerHTML += `
        <label class="flex items-center gap-3 p-2 md:p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
          <input type="checkbox" class="extra-checkbox w-5 h-5 accent-red-500"
            data-name="${extra.name}" data-price="${extra.price}" />
          <span class="flex-1 text-sm md:text-base">${extra.name}</span>
          <span class="${priceClass} font-semibold text-sm">${priceText}</span>
        </label>
      `;
    });
  } else {
    extrasContainer.classList.add("hidden");
  }

  // Atualizar total
  updateCustomizeTotal();

  // Mostrar modal
  customizeModal.classList.add("show");
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    customizeModalContent.style.transform = "scale(1)";
    customizeModalContent.style.opacity = "1";
  }, 10);
}

// Fechar modal de personalização
function closeCustomizeModal() {
  customizeModalContent.style.transform = "scale(0.95)";
  customizeModalContent.style.opacity = "0";
  setTimeout(() => {
    customizeModal.classList.remove("show");
    document.body.style.overflow = "";
    currentProduct = null;
  }, 200);
}

closeCustomizeBtn.addEventListener("click", closeCustomizeModal);
customizeModal.addEventListener("click", function (event) {
  if (event.target === customizeModal) {
    closeCustomizeModal();
  }
});

// Atualizar total no modal de personalização
function updateCustomizeTotal() {
  if (!currentProduct) return;

  let total = currentProduct.price;

  // Somar adicionais selecionados
  document.querySelectorAll(".extra-checkbox:checked").forEach((checkbox) => {
    total += parseFloat(checkbox.dataset.price);
  });

  document.getElementById("customize-total").textContent = `R$ ${total.toFixed(2)}`;
}

// Listeners para atualizar total
document.addEventListener("change", function (event) {
  if (event.target.classList.contains("extra-checkbox")) {
    updateCustomizeTotal();
  }
  if (event.target.name === "base-option") {
    currentProduct.price = parseFloat(event.target.value);
    currentProduct.baseOption = event.target.dataset.name;
    document.getElementById("customize-base-price").textContent = `R$ ${currentProduct.price.toFixed(2)}`;
    updateCustomizeTotal();
  }
});

// Confirmar e adicionar ao carrinho
confirmAddBtn.addEventListener("click", function () {
  if (!currentProduct) return;

  const selectedExtras = [];
  document.querySelectorAll(".extra-checkbox:checked").forEach((checkbox) => {
    selectedExtras.push({
      name: checkbox.dataset.name,
      price: parseFloat(checkbox.dataset.price)
    });
  });

  addToCart(
    currentProduct.name,
    currentProduct.price,
    currentProduct.imgSrc,
    selectedExtras,
    currentProduct.baseOption || null
  );

  closeCustomizeModal();

  // Feedback visual
  Toastify({
    text: "Adicionado ao carrinho!",
    duration: 2000,
    gravity: "top",
    position: "right",
    style: {
      background: "#22c55e",
    },
  }).showToast();
});

// Formatar nome do produto
function formatName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// função para adicionar no carrinho
function addToCart(name, basePrice, imgSrc, extras = [], baseOption = null) {
  // Criar ID único baseado no produto + adicionais
  const extrasIds = extras.map(e => e.name).sort().join("_");
  const uniqueId = `${name}_${baseOption || ""}_${extrasIds}`;

  // Calcular preço total
  const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = basePrice + extrasTotal;

  const existingItem = cart.find((item) => item.id === uniqueId);

  if (existingItem) {
    // se o item já existe aumenta a quantidade
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: uniqueId,
      name,
      basePrice,
      extras,
      baseOption,
      totalPrice,
      quantity: 1,
      img: imgSrc,
    });
  }
  updateCartModal();
}

// atualiza carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  const emptyMsg = document.getElementById("empty-cart-msg");

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    cartItemsContainer.style.display = "none";
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
    cartItemsContainer.style.display = "flex";
  }

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("cart-item");

    const itemTotal = (item.totalPrice * item.quantity).toFixed(2);
    const formattedName = formatName(item.name);

    // Montar texto dos adicionais
    let extrasText = "";
    if (item.baseOption) {
      extrasText += `<span class="text-blue-500">${item.baseOption}</span>`;
    }
    if (item.extras && item.extras.length > 0) {
      const extrasNames = item.extras.map(e => `+${e.name}`).join(", ");
      if (extrasText) extrasText += " • ";
      extrasText += `<span class="text-green-600">${extrasNames}</span>`;
    }
    if (!extrasText) {
      extrasText = '<span class="text-gray-400">sem adicionais</span>';
    }

    cartItemElement.innerHTML = `
        <div class="flex items-center gap-2 md:gap-4 bg-gray-50 p-2 md:p-4 rounded-xl border border-gray-100">
            <img src="${item.img}" alt="${formattedName}" class="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0" />
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate text-sm md:text-base">${formattedName}</p>
                <p class="text-[10px] md:text-xs truncate">${extrasText}</p>
                <p class="font-bold text-gray-800 text-sm md:text-base">R$ ${itemTotal}</p>
            </div>
            <div class="flex items-center gap-1 md:gap-2">
                <button class="quantity-btn minus-btn w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600 flex items-center justify-center transition-all duration-200" data-id="${item.id}">
                    <span class="text-lg font-bold leading-none">−</span>
                </button>
                <span class="w-6 text-center font-semibold text-sm md:text-base">${item.quantity}</span>
                <button class="quantity-btn plus-btn w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200" data-id="${item.id}">
                    <span class="text-lg font-bold leading-none">+</span>
                </button>
            </div>
        </div>
        `;

    total += item.totalPrice * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.textContent = cart.length;
}

// controle de quantidade no carrinho
cartItemsContainer.addEventListener("click", function (event) {
  const button = event.target.closest(".quantity-btn");
  if (!button) return;

  const id = button.getAttribute("data-id");

  if (button.classList.contains("plus-btn")) {
    addQuantity(id);
  } else if (button.classList.contains("minus-btn")) {
    removeItemCart(id);
  }
});

// adicionar quantidade
function addQuantity(id) {
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity += 1;
    updateCartModal();
  }
}

function removeItemCart(id) {
  const index = cart.findIndex((item) => item.id === id);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

// Elementos do formulário de endereço
const cepInput = document.getElementById("cep");
const searchCepBtn = document.getElementById("search-cep-btn");
const cepLoading = document.getElementById("cep-loading");
const streetInput = document.getElementById("street");
const numberInput = document.getElementById("number");
const complementInput = document.getElementById("complement");
const neighborhoodInput = document.getElementById("neighborhood");
const cityInput = document.getElementById("city");
const cepError = document.getElementById("cep-error");

// Formatar CEP enquanto digita (00000-000)
cepInput.addEventListener("input", function (event) {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length > 5) {
    value = value.slice(0, 5) + "-" + value.slice(5, 8);
  }
  event.target.value = value;

  // Esconder erros ao digitar
  cepError.classList.add("hidden");
  addressWarn.classList.add("hidden");
});

// Buscar CEP ao clicar no botão
searchCepBtn.addEventListener("click", searchCep);

// Buscar CEP ao pressionar Enter
cepInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchCep();
  }
});

// Função para buscar CEP na API ViaCEP
async function searchCep() {
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    cepError.textContent = "CEP deve ter 8 dígitos!";
    cepError.classList.remove("hidden");
    return;
  }

  // Mostrar loading
  cepLoading.classList.remove("hidden");
  cepLoading.classList.add("flex");
  searchCepBtn.disabled = true;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      cepError.textContent = "CEP não encontrado!";
      cepError.classList.remove("hidden");
      clearAddressFields();
    } else {
      // Preencher campos
      streetInput.value = data.logradouro || "";
      neighborhoodInput.value = data.bairro || "";
      cityInput.value = data.localidade ? `${data.localidade} - ${data.uf}` : "";
      cepError.classList.add("hidden");

      // Focar no campo número
      numberInput.focus();
    }
  } catch (error) {
    cepError.textContent = "Erro ao buscar CEP. Tente novamente.";
    cepError.classList.remove("hidden");
  } finally {
    // Esconder loading
    cepLoading.classList.add("hidden");
    cepLoading.classList.remove("flex");
    searchCepBtn.disabled = false;
  }
}

// Limpar campos de endereço
function clearAddressFields() {
  streetInput.value = "";
  neighborhoodInput.value = "";
  cityInput.value = "";
}

// Atualizar campo de endereço completo
function updateFullAddress() {
  const parts = [];
  if (streetInput.value) parts.push(streetInput.value);
  if (numberInput.value) parts.push(numberInput.value);
  if (complementInput.value) parts.push(complementInput.value);
  if (neighborhoodInput.value) parts.push(neighborhoodInput.value);
  if (cityInput.value) parts.push(cityInput.value);
  if (cepInput.value) parts.push(`CEP: ${cepInput.value}`);

  addressInput.value = parts.join(", ");
}

// Monitorar campos para atualizar endereço completo
numberInput.addEventListener("input", function () {
  updateFullAddress();
  addressWarn.classList.add("hidden");
});

complementInput.addEventListener("input", updateFullAddress);

// finalizar pedido
checkoutBtn.addEventListener("click", function () {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Ops, o restaurante está fechado!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) return;

  // Validar endereço
  updateFullAddress();
  if (!streetInput.value || !numberInput.value) {
    addressWarn.classList.remove("hidden");
    if (!streetInput.value) {
      cepInput.classList.add("border-red-500");
    }
    if (!numberInput.value) {
      numberInput.classList.add("border-red-500");
    }
    return;
  }

  // Limpar erros visuais
  cepInput.classList.remove("border-red-500");
  numberInput.classList.remove("border-red-500");

  //Enviar pedido para api do whatss
  const cartItems = cart
    .map((item) => {
      let itemText = `${formatName(item.name)}`;
      if (item.baseOption) {
        itemText += ` (${item.baseOption})`;
      }
      if (item.extras && item.extras.length > 0) {
        const extrasNames = item.extras.map(e => e.name).join(", ");
        itemText += ` + ${extrasNames}`;
      }
      itemText += ` - Qtd: ${item.quantity} - R$ ${(item.totalPrice * item.quantity).toFixed(2)}`;
      return itemText;
    })
    .join("\n");

  const message = encodeURIComponent(
    `${cartItems}\nEndereço: ${addressInput.value}`,
  );

  const phone = "53991085333";

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

  cart = [];
  updateCartModal();
});

//Verificar a hora e manipular o card horário
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  // Aberto das 19h até 23h59
  return hora >= 19 && hora <= 23;
  // true = restaurante está aberto
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}

// Filtros de categorias
const categoryButtons = document.querySelectorAll(".category-btn");

categoryButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // Remover classe active de todos
    categoryButtons.forEach((btn) => {
      btn.classList.remove("active", "bg-red-500", "text-white");
      btn.classList.add("bg-gray-100", "text-gray-700");
    });

    // Adicionar classe active ao clicado
    this.classList.add("active");
    this.classList.remove("bg-gray-100", "text-gray-700");

    // Scroll suave até a seção
    const category = this.getAttribute("data-category");
    const section = document.getElementById(category);

    if (section) {
      const headerOffset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

// Atualizar filtro ativo ao rolar a página
window.addEventListener("scroll", function () {
  const sections = ["xis", "mini-xis", "pastel", "cachorro-quente", "fritas", "porcoes", "bebidas"];
  let currentSection = "xis";

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) {
        currentSection = sectionId;
      }
    }
  });

  // Atualizar botão ativo
  categoryButtons.forEach((btn) => {
    const category = btn.getAttribute("data-category");
    if (category === currentSection) {
      btn.classList.add("active");
      btn.classList.remove("bg-gray-100", "text-gray-700");
    } else {
      btn.classList.remove("active");
      btn.classList.add("bg-gray-100", "text-gray-700");
    }
  });
});
