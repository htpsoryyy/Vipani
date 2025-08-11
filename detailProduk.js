
        // Main product functions
        async function fetchProducts() {
            const response = await fetch('https://dummyjson.com/products?limit=100');
            const product = await response.json();
            displayProducts(product.products);
            // Show categories and "All Product" when showing all products
            document.getElementById('productsContainer').classList.add('hidden');
            document.querySelector('.container.mx-auto.px-4.py-8').classList.remove('hidden');
            document.querySelector('h1.text-5xl.p-6').classList.remove('hidden');
        }

        function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Clear previous products
    
    if (products.length === 0) {
        productList.innerHTML = '<p class="text-center text-gray-500 text-xl col-span-full">No products found</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-blue-100 rounded-lg shadow-md p-4 flex flex-col hover:cursor-pointer hover:scale-105 transition-transform duration-500 ease-in-out transform';
        productCard.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}" class="w-full h-48 object-cover rounded-md mb-4 bg-amber-50">
            <h2 class="text-xl font-semibold">${product.title}</h2>
            <p class="text-lg font-bold text-red-600">$${product.price}</p>
            <p class="text-yellow-500">Rating: ${product.rating} ⭐</p>
            <button class="mt-2 bg-pink-300 text-white py-2 rounded flex items-center justify-center">
                <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
            </button>
        `;
        
        // Event listener for the "Add to Cart" button
        productCard.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the card click event
            addToCart(product);
            alert(`${product.title} has been added to your cart!`);
        });
        productCard.addEventListener('click', () => showProductDetails(product));
        productList.appendChild(productCard);
    });
}

        function showProductDetails(product) {
            document.getElementById('modal-images').src = product.images.length > 1 ? product.images[0] : product.images;
            document.getElementById('modal-title').innerText = product.title;
            document.getElementById('modal-description').innerText = product.description;
            document.getElementById('modal-price').innerText = `$${product.price}`;
            document.getElementById('modal-rating').innerText = `Rating: ${product.rating} ⭐`;
            document.getElementById('product-modal').classList.remove('hidden');
            
            // Add event listeners for buttons
            document.getElementById('add-to-cart').onclick = () => {
                addToCart(product);
                alert(`${product.title} has been added to your cart!`);
            };
            
            document.getElementById('btn-buy-now').onclick = () => {
                showDirectCheckout(product, 1);
                document.getElementById('checkoutModal').classList.remove('hidden');
            };
        }

        function addToCart(product) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            
            if (existingProductIndex === -1) {
                // If the product is not in the cart, add it with quantity 1
                cart.push({ ...product, quantity: 1 });
            } else {
                // If the product is already in the cart, increase the quantity
                cart[existingProductIndex].quantity += 1;
            }
            
            // Save the updated cart back to local storage
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 0) {
                // Hide categories and "All Product" when searching
                document.getElementById('productsContainer').classList.add('hidden');
                document.querySelector('.container.mx-auto.px-4.py-8').classList.add('hidden');
                document.querySelector('h1.text-5xl.p-6').classList.add('hidden');
                searchProducts(searchTerm);
            } else {
                // Show categories and "All Product" when search is empty
                document.getElementById('productsContainer').classList.add('hidden');
                document.querySelector('.container.mx-auto.px-4.py-8').classList.remove('hidden');
                document.querySelector('h1.text-5xl.p-6').classList.remove('hidden');
                fetchProducts();
            }
        });

        async function searchProducts(searchTerm) {
            try {
                const response = await fetch(`https://dummyjson.com/products/search?q=${searchTerm}`);
                const data = await response.json();
                displayProducts(data.products);
            } catch (error) {
                console.error('Error searching products:', error);
                document.getElementById('product-list').innerHTML = '<p class="text-red-500">Error loading search results</p>';
            }
        }

        // Category functionality
        document.addEventListener('DOMContentLoaded', function() {
            const loadingElement = document.getElementById('loading');
            const productsContainer = document.getElementById('productsContainer');
            const selectedCategoryName = document.getElementById('selectedCategoryName');
            const errorMessage = document.getElementById('errorMessage');
            
            // Map our categories to API subcategories
            const categoryMap = {
                'furniture': ['furniture', 'home-decoration'],
                'electronics': ['smartphones', 'laptops'],
                'clothing': ['womens-dresses', 'mens-shirts', 'tops'],
                'beauty': ['fragrances', 'skincare', 'beauty'],
                'groceries': ['groceries']
            };
            
            // Add click event to category cards
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', function() {
                    const category = this.dataset.category;
                    loadProducts(category);
                    
                    // Update active state
                    document.querySelectorAll('.category-card').forEach(c => {
                        c.classList.remove('active');
                    });
                    this.classList.add('active');
                });
            });
            
            // Load products for selected category
            async function loadProducts(category) {
                try {
                    loadingElement.classList.remove('hidden');
                    productsContainer.classList.add('hidden');
                    errorMessage.classList.add('hidden');
                    
                    // Set category title
                    selectedCategoryName.textContent = document.querySelector(`.category-card[data-category="${category}"] span`).textContent;
                    
                    // Fetch products from API
                    const response = await fetch('https://dummyjson.com/products?limit=100');
                    if (!response.ok) throw new Error('Network response was not ok');
                    
                    const data = await response.json();
                    const subCategories = categoryMap[category];
                    const filteredProducts = data.products.filter(product => 
                        subCategories.includes(product.category)
                    );
                    
                    displayCategoryProducts(filteredProducts);
                } catch (error) {
                    console.error('Error loading products:', error);
                    loadingElement.classList.add('hidden');
                    errorMessage.classList.remove('hidden');
                }
            }
            
            // Display category products
            function displayCategoryProducts(products) {
                loadingElement.classList.add('hidden');
                productsContainer.classList.remove('hidden');
                
                const productsGrid = productsContainer.querySelector('.grid');
                productsGrid.innerHTML = '';

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'bg-purple-200 rounded-lg shadow-md p-4 flex flex-col hover:cursor-pointer hover:scale-105 transition-transform duration-500 ease-in-out transform';
                    productCard.innerHTML = `
                        <img src="${product.images[0]}" alt="${product.title}" class="w-full h-48 object-cover rounded-md mb-4 bg-amber-50">
                        <h2 class="text-xl font-semibold">${product.title}</h2>
                        <p class="text-lg font-bold text-red-600">$${product.price}</p>
                        <p class="text-yellow-500">Rating: ${product.rating} ⭐</p>
                    `;
                    productCard.addEventListener('click', () => showProductDetails(product));
                    productsGrid.appendChild(productCard);
                });

                // Scroll to products section
                setTimeout(() => {
                    productsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });

        // Close modal functionality
        document.getElementById('close-modal').onclick = () => {
            document.getElementById('product-modal').classList.add('hidden');
        };

        // Direct checkout functions
        function showDirectCheckout(product, quantity) {
            const subtotal = product.price * quantity;
            const deliveryOptions = [
                { id: 'standard', name: 'Standard Delivery', price: 5.99, days: '3-5 business days' },
                { id: 'express', name: 'Express Delivery', price: 12.99, days: '1-2 business days' },
                { id: 'next-day', name: 'Next Day Delivery', price: 19.99, days: 'Next business day' }
            ];
            
            const content = `
                <div class="space-y-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Order Summary (Direct Purchase):</h3>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <img src="${product.images[0]}" alt="${product.title}" class="w-12 h-12 object-contain">
                                <div class="flex-1">
                                    <p class="font-medium text-sm">${product.title}</p>
                                    <p class="text-gray-600 text-sm">${quantity}x $${product.price.toFixed(2)}</p>
                                </div>
                                <p class="font-semibold">$${(product.price * quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Subtotal:</span>
                                <span class="text-red-600">$${subtotal.toFixed(2)}</span>
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
                                            onchange="updateDirectCheckoutTotal(${subtotal}, ${option.price})" 
                                            class="text-blue-600 focus:ring-blue-500" ${option.id === 'standard' ? 'checked' : ''}>
                                        <div class="flex-1">
                                            <p class="font-medium">${option.name}</p>
                                            <p class="text-sm text-gray-600">${option.days}</p>
                                        </div>
                                        <p class="font-semibold">$${option.price.toFixed(2)}</p>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="flex justify-between">
                            <span>Shipping:</span>
                            <span class="text-red-600" id="deliveryPrice">$${deliveryOptions[0].price.toFixed(2)}</span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Payment Method:</label>
                            <select id="paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="transfer">Bank Transfer</option>
                                <option value="ewallet">E-Wallet</option>
                                <option value="cod">Cash on Delivery</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Shipping Address:</label>
                            <textarea id="shippingAddress" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Enter your full address..."></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Notes (Optional):</label>
                            <textarea id="orderNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Any notes for your order..."></textarea>
                        </div>
                        
                        <div class="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span id="checkoutTotal" class="text-blue-600">$${(subtotal + deliveryOptions[0].price).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="processDirectCheckout(${product.id}, ${quantity})" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            Confirm Order
                        </button>
                        <button onclick="closeModal('checkoutModal')" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('checkoutContent').innerHTML = content;
        }


        function updateDirectCheckoutTotal(subtotal, shippingPrice) {
            const total = subtotal + shippingPrice;
            document.getElementById('deliveryPrice').textContent = `$${shippingPrice.toFixed(2)}`;
            document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
        }

        function processDirectCheckout(productId, quantity) {
            // Implementasi proses checkout langsung
            alert(`Order for product ${productId} (${quantity} items) has been placed!`);
            closeModal('checkoutModal');
            closeModal('product-modal');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }

        // Fetch products on page load
        fetchProducts();
