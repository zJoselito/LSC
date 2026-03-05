// Base de datos de productos de acuerdo a las especificaciones
const itemsDB = [
    // === Mantenimiento ===
    { id: 'm_aceite', name: 'Aceite de Motor', price: 90, type: 'mantenimiento', category: 'Mantenimiento' },
    { id: 'm_caja', name: 'Aceite Caja de Cambios', price: 80, type: 'mantenimiento', category: 'Mantenimiento' },
    { id: 'm_frenos', name: 'Sistema de Frenos', price: 150, type: 'mantenimiento', category: 'Mantenimiento' },

    // === Piezas al coste ===
    { id: 'p_azul', name: 'Pieza estandar (Azul)', price: 50, type: 'pieza', category: 'Reparacion Motor/Carroceria' },
    { id: 'p_verde', name: 'Pieza avanzada (Verde)', price: 100, type: 'pieza', category: 'Reparacion Motor/Carroceria' },
    { id: 'p_morada', name: 'Pieza premium (Morada)', price: 150, type: 'pieza', category: 'Reparacion Motor/Carroceria' },
    { id: 'p_amarilla', name: 'Pieza VIP (Amarilla)', price: 200, type: 'pieza', category: 'Reparacion Motor/Carroceria' },

    // === Servicios ===
    { id: 's_asistencia', name: 'Asistencia en Carretera (Base 300)', price: 300, type: 'servicio', category: 'Servicios de Asistencia' },

    // === Tuneos ===
    { id: 't_mo_azul', name: 'Mano Obra (Coche Azul)', price: 150, type: 'tuneo', category: 'Tuneos (Mano Obra por Pieza)' },
    { id: 't_mo_verde', name: 'Mano Obra (Coche Verde)', price: 175, type: 'tuneo', category: 'Tuneos (Mano Obra por Pieza)' },
    { id: 't_mo_morado', name: 'Mano Obra (Coche Morado)', price: 200, type: 'tuneo', category: 'Tuneos (Mano Obra por Pieza)' },
    { id: 't_mo_amarillo', name: 'Mano Obra (Coche Amarillo)', price: 225, type: 'tuneo', category: 'Tuneos (Mano Obra por Pieza)' }
];

let cart = [];

// Inicializa el catálogo agrupando por categoría
function renderCatalog() {
    const catalogDiv = document.getElementById('catalog');
    catalogDiv.innerHTML = '';

    const categories = [...new Set(itemsDB.map(item => item.category))];

    categories.forEach(category => {
        const catItems = itemsDB.filter(i => i.category === category);

        const catDiv = document.createElement('div');
        catDiv.className = 'card';

        const buttonsHTML = catItems.map(item => `
            <button class="btn btn-custom-action mb-1 me-1" onclick="addToCart('${item.id}')">
                <i class="fas fa-plus me-1 text-muted"></i>${item.name}
                <span class="fw-bold text-dark ms-1">+$${item.price}</span>
            </button>
        `).join('');

        catDiv.innerHTML = `
            <div class="card-header">${category}</div>
            <div class="card-body">
                <div class="d-flex flex-wrap">
                    ${buttonsHTML}
                </div>
            </div>
        `;

        catalogDiv.appendChild(catDiv);
    });
}

// Añadir elemento al carrito
function addToCart(id) {
    const itemInfo = itemsDB.find(i => i.id === id);
    if (!itemInfo) return;

    const existingIndex = cart.findIndex(i => i.id === id);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({ ...itemInfo, quantity: 1 });
    }

    updateCartUI();
}

// Añadir pieza custom
function addCustomItem() {

    let name = document.getElementById('customName').value.trim();
    const priceStr = document.getElementById('customPrice').value;
    const price = parseFloat(priceStr);

    if (isNaN(price) || price < 0 || priceStr === '') {
        alert('Por favor, introduce un precio válido mayor o igual a 0.');
        return;
    }

    if (name === '') {
        name = 'Pieza Custom (Tablet)';
    }

    const id = 'custom_' + Date.now();

    cart.push({
        id: id,
        name: name,
        price: price,
        type: 'pieza',
        quantity: 1,
        isCustom: true
    });

    document.getElementById('customName').value = '';
    document.getElementById('customPrice').value = '';

    updateCartUI();
}

// Cambiar cantidad
function changeQuantity(index, delta) {

    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartUI();
}

// Vaciar carrito
function clearCart() {

    if (confirm('¿Vaciar la factura?')) {
        cart = [];
        updateCartUI();
    }
}

// Actualizar UI
function updateCartUI() {

    const cartTbody = document.getElementById('cartBody');
    cartTbody.innerHTML = '';

    if (cart.length === 0) {
        cartTbody.innerHTML =
            '<tr><td colspan="4" class="text-center text-muted p-4">Agrega productos del catálogo.</td></tr>';
        calculateTotals();
        return;
    }

    cart.forEach((item, index) => {

        const tr = document.createElement('tr');

        let badge = '';

        if (item.type === 'mantenimiento')
            badge = '<span class="badge badge-type badge-mantenimiento">Mant.</span>';

        else if (item.type === 'pieza')
            badge = '<span class="badge badge-type badge-pieza">Pieza</span>';

        else if (item.type === 'servicio')
            badge = '<span class="badge badge-type badge-servicio">Servicio</span>';

        else if (item.type === 'tuneo')
            badge = '<span class="badge badge-type badge-tuneo">Tuneo</span>';

        let subtotalParts = item.price * item.quantity;

        let subtotalText =
            `<span style="font-size: 0.75rem;">$${item.price}x${item.quantity}</span><br><strong>$${subtotalParts}</strong>`;

        // Mostrar MO para mantenimiento y piezas
        if (item.type === 'mantenimiento' || item.type === 'pieza') {
            subtotalText += `<br><small class="text-muted" style="font-size: 0.65rem;">(+ $150x${item.quantity} MO)</small>`;
        }

        tr.innerHTML = `
            <td>
                <div class="fw-bold" style="font-size: 0.8rem;">${item.name}</div>
                <div class="mt-1">${badge}</div>
            </td>

            <td>
                <div class="item-quantity mx-auto">
                    <button class="btn text-secondary" onclick="changeQuantity(${index}, -1)">
                        <i class="fas fa-minus" style="font-size: 0.6rem;"></i>
                    </button>

                    <input type="number" value="${item.quantity}" readonly>

                    <button class="btn text-secondary" onclick="changeQuantity(${index}, 1)">
                        <i class="fas fa-plus" style="font-size: 0.6rem;"></i>
                    </button>
                </div>
            </td>

            <td>${subtotalText}</td>

            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger py-0 px-1"
                        onclick="changeQuantity(${index}, -${item.quantity})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;

        cartTbody.appendChild(tr);

    });

    calculateTotals();
}

// Calcular totales
function calculateTotals() {

    let subtotalPiezasOtros = 0;
    let laborMantenimiento = 0;

    let qtyElementosMantenimiento = 0;
    let qtyElementosPieza = 0;

    cart.forEach(item => {

        const itemTotal = item.price * item.quantity;

        if (item.type === 'mantenimiento' || item.type === 'pieza') {

            subtotalPiezasOtros += itemTotal;

            // Mano de obra
            laborMantenimiento += 150 * item.quantity;

            if (item.type === 'mantenimiento') {
                qtyElementosMantenimiento += item.quantity;
            }

            if (item.type === 'pieza') {
                qtyElementosPieza += item.quantity;
            }

        } else {

            subtotalPiezasOtros += itemTotal;

        }

    });

    // Base solo una vez si hay mantenimiento o piezas
    const baseMantenimiento =
        (qtyElementosMantenimiento > 0 || qtyElementosPieza > 0) ? 100 : 0;

    let subtotalBeforeDiscount =
        subtotalPiezasOtros +
        laborMantenimiento +
        baseMantenimiento;

    // Aplicar descuento (Convenio)
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    document.getElementById('printDiscountPercent').textContent = `${discountPercent}%`;
    const discountAmount = Math.round(subtotalBeforeDiscount * (discountPercent / 100));
    const grandTotal = subtotalBeforeDiscount - discountAmount;

    // Mostrar/Ocultar fila de descuento
    const rowDiscount = document.getElementById('rowDiscountAmount');
    if (discountAmount > 0) {
        rowDiscount.classList.remove('d-none');
        document.getElementById('sumDiscount').textContent = `-$${discountAmount}`;
    } else {
        rowDiscount.classList.add('d-none');
    }

    document.getElementById('sumPartsOther').textContent = `$${subtotalPiezasOtros}`;
    document.getElementById('sumBaseMant').textContent = `$${baseMantenimiento}`;
    document.getElementById('sumLaborMant').textContent = `$${laborMantenimiento}`;
    document.getElementById('sumTotal').textContent = `$${grandTotal}`;
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
});