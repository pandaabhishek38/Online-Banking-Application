document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
});

function fetchProducts() {
    fetch('http://localhost:8080/api/fetch-product-details')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.data);
            } else {
                console.error('Failed to fetch products');
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        const title = document.createElement('h2');
        title.innerText = product.Product_Name;

        const shortDesc = document.createElement('p');
        shortDesc.innerText = product.Product_short_desc;

        const viewMoreBtn = document.createElement('button');
        viewMoreBtn.innerText = 'View More';
        viewMoreBtn.className = 'view-more';
        viewMoreBtn.onclick = () => {
            alert(product.Product_desc); // Replace this with a modal or expandable section
        };

        productDiv.appendChild(title);
        productDiv.appendChild(shortDesc);
        productDiv.appendChild(viewMoreBtn);

        container.appendChild(productDiv);
    });
}