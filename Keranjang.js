
// Cart Management
const cartKey = "cart";
let deliveryPrice = 5.99; // Default shipping cost

function Dollar(number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(number);
}

// Initialize the page
async function init() {
    try {
        renderCart();
    } catch (error) {
        console.error("Error initializing cart:", error);
    }
}

// Cart functions
function loadCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        const cart = loadCart();
        cartCountElement.innerText = `(${cart.reduce((sum, item) => sum + item.quantity, 0)})`;
    }
}

function addToCart(product) {
    const cart = loadCart();
    const exists = cart.find(p => p.id === product.id);
    
    if (!exists) {
        cart.push({ 
            ...product, 
            quantity: 1, 
            selected: true 
        });
    } else {
        exists.quantity += 1;
    }
    
    saveCart(cart);
    renderCart();
}

function removeFromCart(id) {
    let cart = loadCart();
    cart = cart.filter(p => p.id !== id);
    saveCart(cart);
    renderCart();
}

function changeQuantity(id, delta) {
    const cart = loadCart();
    const item = cart.find(p => p.id === id);
    
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        saveCart(cart);
        renderCart();
    }
}

function toggleProductSelection(id) {
    const cart = loadCart();
    const item = cart.find(p => p.id === id);
    
    if (item) {
        item.selected = !item.selected;
        saveCart(cart);
        renderCart();
    }
}

function hasSelectedProducts() {
    const cart = loadCart();
    return cart.some(item => item.selected);
}

function getSelectedTotal() {
    const cart = loadCart();
    return cart
        .filter(item => item.selected)
        .reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render the cart
function renderCart() {
    const container = document.getElementById("product-container");
    if (!container) return;

    container.innerHTML = "";
    const cart = loadCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center p-6 col-span-full">
                <p class="text-xl text-gray-500">Your cart is empty</p>
                <a href="indexhome.html" class="text-blue-500 hover:underline mt-2 inline-block">Continue Shopping</a>
            </div>
        `;
        return;
    }

    cart.forEach(product => {
        const productElement = document.createElement("div");
        productElement.className = "bg-white rounded-lg shadow-md p-4 mb-4";

        const imageUrl = product.images && product.images.length > 0 ?
            (typeof product.images === 'string' ? product.images : product.images[0]) :
            'https://via.placeholder.com/150';

        productElement.innerHTML = `
            <div class="flex items-start">
                <div class="flex items-center mr-3">
                    <input type="checkbox" id="select-${product.id}" 
                        class="w-5 h-5 cursor-pointer" ${product.selected ? 'checked' : ''}>
                </div>
                <img src="${imageUrl}" alt="${product.title}" 
                    class="w-20 h-20 object-cover rounded-md mr-4">
                <div class="flex-grow">
                    <h2 class="text-lg font-semibold">${product.title}</h2>
                    <p class="text-gray-600 text-sm mb-2">
                        ${product.description ? product.description.substring(0, 60) + '...' : ''}
                    </p>
                    <div class="flex justify-between items-center">
                        <p class="font-bold text-red-600">${Dollar(product.price)}</p>
                        <div class="flex items-center">
                            <button onclick="changeQuantity(${product.id}, -1)" 
                                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center">-</button>
                            <span class="mx-2 w-8 text-center">${product.quantity}</span>
                            <button onclick="changeQuantity(${product.id}, 1)" 
                                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="removeFromCart(${product.id})" 
                    class="ml-4 text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listener to checkbox
        productElement.querySelector(`#select-${product.id}`).addEventListener('change', () => {
            toggleProductSelection(product.id);
        });

        container.appendChild(productElement);
    });

    // Add total and checkout button
    const totalElement = document.createElement("div");
    totalElement.className = "bg-white rounded-lg shadow-md p-4 sticky bottom-4";
    
    const selectedTotal = getSelectedTotal();
    const hasSelected = hasSelectedProducts();

    totalElement.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">Total (Selected):</h2>
            <p class="text-lg font-bold text-red-600">${Dollar(selectedTotal)}</p>
        </div>
        <button id="checkout-button" 
            class="w-full py-3 rounded-lg text-white font-semibold ${hasSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}">
            Proceed to Checkout
        </button>
    `;

    container.appendChild(totalElement);

    // Add checkout event listener
    const checkoutButton = document.getElementById("checkout-button");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function() {
            if (hasSelected) {
                showCheckout();
            } else {
                alert("Please select at least one product to checkout");
            }
        });
    }
}

// Checkout functions
function showCheckout() {
    const cart = loadCart();
    const selectedProducts = cart.filter(item => item.selected);
    const subtotal = getSelectedTotal();
    
    const deliveryOptions = [
        { id: 'standard', name: 'Standard Delivery', price: 5.99, days: '3-5 business days' },
        { id: 'express', name: 'Express Delivery', price: 12.99, days: '1-2 business days' },
        { id: 'next-day', name: 'Next Day Delivery', price: 19.99, days: 'Next business day' }
    ];

    let content = `
        <h2 class="text-xl font-bold mb-4">Order Summary</h2>
        <div class="space-y-4 mb-6 max-h-60 overflow-y-auto">
    `;

    selectedProducts.forEach(product => {
        content += `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg checkout-item">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/150'}" 
                    alt="${product.title}" class="w-12 h-12 object-cover rounded-md mr-3">
                <div class="flex-grow">
                    <p class="font-medium">${product.title}</p>
                    <p class="text-sm text-gray-600">${product.quantity} × ${Dollar(product.price)}</p>
                </div>
                <p class="font-semibold">${Dollar(product.price * product.quantity)}</p>
            </div>
        `;
    });

    content += `
        </div>
        <div class="border-t pt-4">
            <div class="space-y-2 mb-4">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span class="font-medium" id="checkoutSubtotal">${Dollar(subtotal)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Shipping:</span>
                    <span class="font-medium" id="checkoutShipping">${Dollar(deliveryOptions[0].price)}</span>
                </div>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Delivery Method:</label>
                <div class="space-y-2">
                    ${deliveryOptions.map(option => `
                        <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="delivery" value="${option.id}" 
                                onchange="updateCheckoutDelivery('${option.id}', ${option.price})" 
                                class="text-blue-600 focus:ring-blue-500" ${option.id === 'standard' ? 'checked' : ''}>
                            <div class="flex-1">
                                <p class="font-medium">${option.name}</p>
                                <p class="text-sm text-gray-600">${option.days}</p>
                            </div>
                            <p class="font-semibold">${Dollar(option.price)}</p>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Payment Method:</label>
                <div class="grid grid-cols-2 gap-3">
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="transfer" checked class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-university text-xl text-blue-600 mr-3"></i>
                            <span>Bank Transfer</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="ewallet" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-wallet text-xl text-green-600 mr-3"></i>
                            <span>E-Wallet</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="credit" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="far fa-credit-card text-xl text-purple-600 mr-3"></i>
                            <span>Credit Card</span>
                        </div>
                    </label>
                    <label class="payment-method-option">
                        <input type="radio" name="payment" value="cod" class="hidden">
                        <div class="p-3 border rounded-lg flex items-center hover:border-blue-500 transition-colors">
                            <i class="fas fa-money-bill-wave text-xl text-yellow-600 mr-3"></i>
                            <span>Cash on Delivery</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Shipping Address:</label>
                <textarea id="shippingAddress" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Enter your full address..."></textarea>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Notes (Optional):</label>
                <textarea id="orderNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Any notes for your order..."></textarea>
            </div>
            
            <div class="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <span>Total:</span>
                <span id="checkoutTotal" class="text-blue-600">${Dollar(subtotal + deliveryOptions[0].price)}</span>
            </div>
        </div>
    `;

    document.getElementById('checkoutContent').innerHTML = content;
    document.getElementById('modalTotal').textContent = Dollar(subtotal + deliveryOptions[0].price);
    document.getElementById('checkoutModal').classList.remove('hidden');
}

function updateCheckoutDelivery(method, price) {
    deliveryPrice = price;
    const subtotal = getSelectedTotal();
    const total = subtotal + price;
    
    document.getElementById('checkoutShipping').textContent = Dollar(price);
    document.getElementById('checkoutTotal').textContent = Dollar(total);
    document.getElementById('modalTotal').textContent = Dollar(total);
}

function processCheckout() {
    const shippingAddress = document.getElementById('shippingAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const deliveryMethod = selectedDelivery ? selectedDelivery.value : 'standard';
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!shippingAddress.trim()) {
        alert('Shipping address is required!');
        return;
    }

    const cart = loadCart();
    const selectedProducts = cart.filter(item => item.selected);
    const subtotal = getSelectedTotal();
    const total = subtotal + deliveryPrice;
    
    // Create order
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    orders.push({
        id: orderId,
        items: selectedProducts,
        subtotal: subtotal,
        deliveryMethod: deliveryMethod,
        deliveryPrice: deliveryPrice,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        notes: orderNotes,
        date: new Date().toISOString(),
        total: total,
        status: 'pending'
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Remove selected items from cart
    const updatedCart = cart.filter(item => !item.selected);
    saveCart(updatedCart);
    
    // Close modal and show success
    closeModal('checkoutModal');
    showOrderSuccess(orderId, total, selectedProducts.length);
}

function showOrderSuccess(orderId, total, itemCount) {
    const content = `
        <div class="text-center p-6">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-4xl text-green-600"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h3>
            <p class="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Order ID:</span>
                    <span class="font-medium">${orderId}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-gray-600">Items:</span>
                    <span class="font-medium">${itemCount} ${itemCount > 1 ? 'items' : 'item'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-medium">${Dollar(total)}</span>
                </div>
            </div>
            
            <p class="text-sm text-gray-500 mb-6">We've sent the order confirmation to your email. You can track your order in your account.</p>
            
            <div class="flex space-x-3">
                <button onclick="closeModal('successModal')" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('successModal').querySelector('.rounded-xl').innerHTML = content;
    document.getElementById('successModal').classList.remove('hidden');
    renderCart();
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', init);
