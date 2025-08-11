$.get('https://dummyjson.com/products?limit=100', function(data) {
    let history = '';
    data.products.forEach(product => { // Accessing the products array
        history += `
            <div class="bg-blue-100 shadow-md rounded-xl p-6 flex items-center justify-between">
                <div class="flex items-center">
                    <img src="${product.images[0]}" alt="${product.title}" class="w-24 h-24 object-cover rounded-md mr-4">
                    <div class="flex-1">
                        <h2 class="text-lg font-semibold">${product.title}</h2>
                        <p class="text-xl text-red-400 font-bold mt-2">$ ${product.price}</p>
                    </div>
                </div>
                <div class="text-right ml-4">
                    <p class="text-green-500 font-bold">Pesanan Selesai</p>
                </div>
            </div>
        `;
    });
    $('#history').html(history);
}).fail(function() {
    $('#history').html('<p class="text-red-500">Gagal memuat data produk.</p>');
});
