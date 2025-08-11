// Fetch products from dummyjson API and render
async function fetchProducts() {
  try {
    const res = await fetch('https://dummyjson.com/products?limit=100');
    const data = await res.json();
    const products = data.products;
    const productGrid = document.getElementById('productGrid');

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-blue-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col hover:cursor-pointer hover:scale-105 transition-transform duration-500 ease-in-out transform ';

      productCard.innerHTML = `
        <img class="w-full h-56 object-cover bg-orange-50" src="${product.thumbnail}" alt="${product.title}" />
        <div class="p-4 flex flex-col flex-grow">
          <h3 class="text-lg font-semibold mb-2">${product.title}</h3>
          <p class="text-pink-600 font-bold">$${product.price}</p>
          <button class="mt-4 bg-pink-400 text-white py-2 rounded-md hover:bg-pink-700 transition">Buy Now</button>
        </div>
      `;
      productGrid.appendChild(productCard);
    });
  } catch (e) {
    console.error('Failed to fetch products:', e);
  }
}

document.addEventListener('DOMContentLoaded', fetchProducts);
