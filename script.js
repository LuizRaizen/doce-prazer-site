/* ============================================
   DOCE PRAZER - Cardápio Interativo
   JavaScript - Lógica do Carrinho e Pedidos
   ============================================ */

// ============================================
// CONFIGURAÇÕES
// ============================================
const CONFIG = {
    whatsappNumber: '5511913404082',
    pixKey: '+5511913404082',
    pixName: 'VITORIA ALVES SANTOS',
};

let currentPixPayload = "";
let currentOrderId = "";

// ============================================
// ESTADO DO CARRINHO
// ============================================
const cart = {};

// Dados dos produtos com imagens
const products = {
    'casca-150': { name: 'Ovo Casca 150g', price: 15.00, hasFlavor: false, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/ccf01859-6493-4584-bb44-56804d8114e8.png' },
    'casca-250': { name: 'Ovo Casca 250g', price: 35.00, hasFlavor: false, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/ccf01859-6493-4584-bb44-56804d8114e8.png' },
    'casca-250-crianca': { name: 'Ovo Criança 250g c/ Brinquedo', price: 40.00, hasFlavor: false, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/e35d2137-2b25-4bb8-b6f2-93f04ea237b8.png' },
    'recheado-150': { name: 'Ovo Recheado 150g', price: 40.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/da386c07-8333-4f5a-b25b-bc9424644802.png' },
    'recheado-250': { name: 'Ovo Recheado 250g', price: 65.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/da386c07-8333-4f5a-b25b-bc9424644802.png' },
    'recheado-500': { name: 'Ovo Recheado 500g', price: 90.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/da386c07-8333-4f5a-b25b-bc9424644802.png' },
    'mini-ovos-6': { name: 'Caixa c/ 6 Mini Ovos', price: 45.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/98338a24-56e4-4b76-8bfb-76dd5517a213.png' },
    'colher-150': { name: 'Ovo de Colher 150g', price: 35.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/b298d531-51f1-424a-8584-d2b5bc66e270.png' },
    'colher-250': { name: 'Ovo de Colher 250g', price: 65.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/b298d531-51f1-424a-8584-d2b5bc66e270.png' },
    'colher-500': { name: 'Ovo de Colher 500g', price: 80.00, hasFlavor: true, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/b298d531-51f1-424a-8584-d2b5bc66e270.png' },
    'quatro-250': { name: 'Ovo 4 Sabores 250g', price: 120.00, hasFlavor: false, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/2208c13c-9b81-4588-8b42-481cde8adf68.png' },
    'quatro-500': { name: 'Ovo 4 Sabores 500g', price: 150.00, hasFlavor: false, img: 'https://mgx-backend-cdn.metadl.com/generate/images/1014269/2026-03-09/2208c13c-9b81-4588-8b42-481cde8adf68.png' },
};

// ============================================
// FUNÇÕES DO CARRINHO
// ============================================

function changeQty(productId, delta) {

    const product = products[productId];
    if (!product) return;

    let flavor = "";

    if (product.hasFlavor) {

        const flavorSelect = document.getElementById(`flavor-${productId}`);

        if (!flavorSelect) return;

        if (delta > 0 && !flavorSelect.value) {
            showToast('Por favor, selecione um sabor primeiro! 🍫', 'info');
            flavorSelect.focus();
            return;
        }

        flavor = flavorSelect.value;
    }

    // chave única do item (produto + sabor)
    const cartKey = flavor ? `${productId}|${flavor}` : productId;

    if (!cart[cartKey]) {
        cart[cartKey] = {
            productId: productId,
            flavor: flavor,
            qty: 0
        };
    }

    cart[cartKey].qty += delta;

    if (cart[cartKey].qty <= 0) {
        delete cart[cartKey];
    }

    // atualizar interface
    updateQtyDisplay(productId);
    updateFlavorList(productId);
    updateCartUI();
}

function updateQtyDisplay(productId) {

    const qtyEl = document.getElementById(`qty-${productId}`);
    if (!qtyEl) return;

    const product = products[productId];

    let flavor = "";

    if (product.hasFlavor) {
        const flavorSelect = document.getElementById(`flavor-${productId}`);
        if (flavorSelect) {
            flavor = flavorSelect.value;
        }
    }

    const cartKey = flavor ? `${productId}|${flavor}` : productId;

    let qty = 0;

    if (cart[cartKey]) {
        qty = cart[cartKey].qty;
    }

    qtyEl.textContent = qty;
}

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    Object.keys(cart).forEach(key => {
        const item = cart[key];
        const product = products[item.productId];
        if (product && item.qty > 0) {
            totalItems += item.qty;
            totalPrice += item.qty * product.price;
        }
    });

    // Atualizar contadores
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsCountEl = document.getElementById('cartItemsCount');
    const cartTotalEl = document.getElementById('cartTotal');
    const floatingCart = document.getElementById('floatingCart');

    if (cartCountEl) cartCountEl.textContent = totalItems;

    if (cartItemsCountEl) {
        const label = totalItems === 1 ? "item" : "itens";
        cartItemsCountEl.textContent = `${totalItems} ${label}`;
    }
    
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(totalPrice);

    // Mostrar/esconder carrinho flutuante
    if (floatingCart) {
        if (totalItems > 0) {
            floatingCart.style.display = 'flex';
        } else {
            floatingCart.style.display = 'none';
        }
    }
}

function formatPrice(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ============================================
// MODAL DE PEDIDO
// ============================================

function openOrderModal() {
    const orderList = document.getElementById('orderSummaryList');
    const orderTotal = document.getElementById('orderTotalValue');
    const modal = document.getElementById('orderModal');

    if (!orderList || !modal) return;

    // Limpar lista
    orderList.innerHTML = '';

    let total = 0;
    let hasItems = false;

    Object.keys(cart).forEach(id => {
        const item = cart[id];
        const product = products[item.productId];
        if (product && item.qty > 0) {
            hasItems = true;
            const itemTotal = item.qty * product.price;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            itemEl.innerHTML = `
                <div class="order-item-info">
                    <div class="order-item-name">${product.name}</div>
                    ${item.flavor ? `<div class="order-item-flavor">Sabor: ${item.flavor}</div>` : ''}
                    <div class="order-item-qty">${item.qty}x R$ ${formatPrice(product.price)}</div>
                </div>
                <div class="order-item-price">R$ ${formatPrice(itemTotal)}</div>
            `;
            orderList.appendChild(itemEl);
        }
    });

    if (!hasItems) {
        showToast('Seu carrinho está vazio! Adicione itens primeiro. 🛒', 'info');
        return;
    }

    if (orderTotal) {
        orderTotal.textContent = `R$ ${formatPrice(total)}`;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateFlavorList(productId){

    const container = document.getElementById(`flavor-list-${productId}`);
    if(!container) return;

    container.innerHTML = '';

    const flavors = {};

    Object.keys(cart).forEach(key => {

        const item = cart[key];

        if(item.productId === productId){

            const flavor = item.flavor || "Tradicional";

            if(!flavors[flavor]){
                flavors[flavor] = 0;
            }

            flavors[flavor] += item.qty;
        }
    });

    Object.keys(flavors).forEach(flavor => {

        const row = document.createElement("div");
        row.className = "flavor-qty-item";

        row.innerHTML = `
            <span>${flavor}</span>
            <span>${flavors[flavor]}</span>
        `;

        container.appendChild(row);

    });

}

// ============================================
// MODAL PIX
// ============================================

function openPixModal() {
    closeOrderModal();

    const pixModal = document.getElementById('pixModal');
    const pixTotalEl = document.getElementById('pixTotalValue');
    const pixKeyDisplay = document.getElementById('pixKeyDisplay');

    if (!pixModal) return;

    // Calcular total
    let total = 0;
    Object.keys(cart).forEach(id => {
        const item = cart[id];
        const product = products[item.productId];
        if (product && item.qty > 0) {
            total += item.qty * product.price;
        }
    });

    if (pixTotalEl) {
        pixTotalEl.textContent = `R$ ${formatPrice(total)}`;
    }

    if (pixKeyDisplay) {
        const payload = generatePixPayload(total);
        currentPixPayload = payload;
        document.getElementById("pixKeyDisplay").textContent = payload;
    }

    console.log("TOTAL DO PEDIDO:", total);

    // Gerar QR Code
    if (total <= 0) {
        showToast("Carrinho vazio 🛒");
        return;
    }
    
    else {
        const payload = generatePixPayload(total);
        console.log("PIX Copia e Cola:", payload);

        generatePixQRCode(total);
    }

    pixModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePixModal() {
    const modal = document.getElementById('pixModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function generatePixQRCode(amount) {
    const canvas = document.getElementById('pixQrCode');
    if (!canvas) return;

    // Gerar payload PIX simplificado
    const pixPayload = generatePixPayload(amount);

    // Usar QRCode library
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(canvas, pixPayload, {
            width: 200,
            margin: 2,
            color: {
                dark: '#3D2B1F',
                light: '#FFFFFF'
            }
        }, function(error) {
            if (error) {
                console.error('Erro ao gerar QR Code:', error);
                // Fallback: mostrar chave PIX
                const container = document.getElementById('pixQrContainer');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <p style="font-size: 0.9rem; color: #5C4033;">
                                Use a chave PIX abaixo para realizar o pagamento:
                            </p>
                            <p style="font-weight: 700; font-size: 1.1rem; margin-top: 8px; color: #3D2B1F;">
                                ${CONFIG.pixKey}
                            </p>
                        </div>
                    `;
                }
            }
        });
    }
}

function generatePixPayload(amount) {

    const pixKey = CONFIG.pixKey;
    const merchantName = CONFIG.pixName;
    const merchantCity = "SAO PAULO";
    const txId = "DP" + Date.now().toString().slice(-8);
    currentOrderId = txId;

    function format(id, value) {
        const size = value.length.toString().padStart(2, '0');
        return id + size + value;
    }

    const payloadFormat = format("00", "01");
    const initiationMethod = format("01", "12");

    const gui = format("00", "BR.GOV.BCB.PIX");
    const key = format("01", pixKey);

    const merchantAccountInfo = format("26", gui + key);

    const mcc = format("52", "0000");
    const currency = format("53", "986");
    const amountField = format("54", amount.toFixed(2));

    const country = format("58", "BR");
    const name = format("59", merchantName.substring(0, 25));
    const city = format("60", merchantCity.substring(0, 15));

    const txid = format("05", txId);
    const additionalData = format("62", txid);

    let payload =
        payloadFormat +
        initiationMethod +
        merchantAccountInfo +
        mcc +
        currency +
        amountField +
        country +
        name +
        city +
        additionalData +
        "6304";

    payload += crc16(payload);

    return payload;
}

function crc16(payload) {
    let crc = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;

        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF;
        }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ============================================
// COPIAR CHAVE PIX
// ============================================

function copyPixKey() {

    if (!currentPixPayload) {
        showToast("Erro ao copiar PIX");
        return;
    }

    navigator.clipboard.writeText(currentPixPayload)
        .then(() => {
            showToast("PIX Copia e Cola copiado! ✅");
        })
        .catch(() => {
            console.error("Erro ao copiar");
        });
}

// ============================================
// ENVIAR WHATSAPP
// ============================================

function getDeviceInfo() {

    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) return "Android 📱";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iPhone 🍎";
    if (/Windows/i.test(userAgent)) return "Windows 💻";
    if (/Mac/i.test(userAgent)) return "Mac 💻";

    return "Dispositivo desconhecido";
}

function sendWhatsApp() {

    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'});
    const device = getDeviceInfo();

    let message = `🍫 *DOCE PRAZER*
━━━━━━━━━━━━━━

🧾 Pedido: ${currentOrderId}
📅 Data: ${date}
🕒 Hora: ${time}
📱 Dispositivo: ${device}

━━━━━━━━━━━━━━
`;

    let total = 0;

    Object.keys(cart).forEach(key => {
        const item = cart[key];
        const product = products[item.productId];

        if (product && item.qty > 0) {

            const itemTotal = item.qty * product.price;
            total += itemTotal;

            message += `• ${item.qty}x ${product.name}`;

            if (item.flavor) {
                message += ` (${item.flavor})`;
            }

            message += ` - R$ ${formatPrice(itemTotal)}\n`;
        }

    });

    message += `
━━━━━━━━━━━━━━
💰 *TOTAL: R$ ${formatPrice(total)}*

Pagamento: PIX

📸 Envie o comprovante nesta conversa para confirmar o pedido.
`;

    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl =
        "https://api.whatsapp.com/send?phone=" +
        CONFIG.whatsappNumber +
        "&text=" +
        encodedMessage;

    window.open(whatsappUrl, "_blank");

    closePixModal();
    clearCart();
    showToast("Pedido enviado com sucesso! 🎉", "success");
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// ============================================
// MODAL CARRINHO
// ============================================

function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    renderCartItems();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderCartItems() {
    const cartList = document.getElementById('cartItemsList');
    const emptyMsg = document.getElementById('cartEmptyMsg');
    const totalBar = document.getElementById('cartModalTotal');
    const totalValue = document.getElementById('cartModalTotalValue');
    const footer = document.getElementById('cartModalFooter');

    if (!cartList) return;

    cartList.innerHTML = '';
    let total = 0;
    let hasItems = false;

    Object.keys(cart).forEach(key => {
        const item = cart[key];
        const product = products[item.productId];
        if (product && item.qty > 0) {
            hasItems = true;
            const itemTotal = item.qty * product.price;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-modal-item';
            itemEl.innerHTML = `
                <div class="cart-modal-item-img">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <div class="cart-modal-item-details">
                    <div class="cart-modal-item-name">${product.name}</div>
                    ${item.flavor ? `<div class="cart-modal-item-flavor">Sabor: ${item.flavor}</div>` : ''}
                    <div class="cart-modal-item-price">R$ ${formatPrice(itemTotal)}</div>
                    <div class="cart-modal-item-controls">
                        <button class="cart-qty-btn" onclick="cartChangeQty('${key}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-qty-value">${item.qty}</span>
                        <button class="cart-qty-btn cart-qty-plus" onclick="cartChangeQty('${key}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="cart-modal-item-delete" onclick="removeFromCart('${key}')" title="Remover item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartList.appendChild(itemEl);
        }
    });

    if (hasItems) {
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (totalBar) totalBar.style.display = 'flex';
        if (totalValue) totalValue.textContent = `R$ ${formatPrice(total)}`;
        if (footer) footer.style.display = 'block';
    } else {
        if (emptyMsg) emptyMsg.style.display = 'flex';
        if (totalBar) totalBar.style.display = 'none';
        if (footer) footer.style.display = 'none';
    }
}

function cartChangeQty(cartKey, delta) {

    const item = cart[cartKey];
    if (!item) return;

    const product = products[item.productId];
    if (!product) return;

    item.qty += delta;

    if (item.qty <= 0) {
        delete cart[cartKey];
    }

    // atualizar UI do card do produto
    updateQtyDisplay(item.productId);
    updateFlavorList(item.productId);

    // atualizar carrinho
    updateCartUI();
    renderCartItems();
}

function removeFromCart(productId) {
    if (cart[productId]) {
        delete cart[productId];
        updateQtyDisplay(productId);
        updateCartUI();
        renderCartItems();
        showToast('Item removido do carrinho 🗑️', 'info');
    }
}

// ============================================
// MODAL AJUDA
// ============================================

function openHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// MOBILE MENU
// ============================================

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
    }

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Fechar modais com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.12)';
        } else {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Atualizar quantidade de unidades no carrinho para cada sabor no card do produto
    document.querySelectorAll("select[id^='flavor-']").forEach(select => {

        select.addEventListener("change", function() {

            const productId = this.id.replace("flavor-", "");

            updateQtyDisplay(productId);

        });

    });

    // Inicializar carrinho
    updateCartUI();

    console.log('🍫 Doce Prazer - Cardápio Interativo carregado!');
});