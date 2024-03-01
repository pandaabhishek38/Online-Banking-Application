document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    document.getElementById('addProduct').addEventListener('click', addProduct);
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
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.id = `product-${product.Product_Id}`; // Assigning a unique ID

        const title = document.createElement('h2');
        title.innerText = product.Product_Name;

        const shortDesc = document.createElement('p');
        shortDesc.innerText = product.Product_short_desc;

        const editBtn = document.createElement('button');
        editBtn.innerText = 'Edit';
        editBtn.className = 'button';
        editBtn.onclick = () => editProduct(product);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.className = 'button';
        deleteBtn.onclick = () => deleteProduct(product.Product_Id);

        productDiv.appendChild(title);
        productDiv.appendChild(shortDesc);
        productDiv.appendChild(editBtn);
        productDiv.appendChild(deleteBtn);

        container.appendChild(productDiv);
    });
}

function deleteProduct(productId) {
    const confirmation = confirm('Are you sure you want to delete this product?');
    if (confirmation) {
        // Call API to delete product
        fetch(`http://localhost:8080/api/deleteProduct?productId=${productId}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Product deleted successfully');
                    fetchProducts(); // Refresh the list
                } else {
                    alert('Failed to delete product');
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function editProduct(product) {
    const productDiv = document.querySelector(`#product-${product.Product_Id}`);
    productDiv.innerHTML = `
        <input type="text" id="editName-${product.Product_Id}" value="${product.Product_Name}">
        <textarea id="editShortDesc-${product.Product_Id}">${product.Product_short_desc}</textarea>
        <textarea id="editDesc-${product.Product_Id}">${product.Product_desc || ''}</textarea>
        <button class="button" onclick="saveEdit(${product.Product_Id})">Save</button>
    `;
}

function saveEdit(productId) {
    const updatedName = document.getElementById(`editName-${productId}`).value;
    const updatedShortDesc = document.getElementById(`editShortDesc-${productId}`).value;
    const updatedDesc = document.getElementById(`editDesc-${productId}`).value;

    const productData = {
        Product_Id: productId,
        Product_Name: updatedName,
        Product_short_desc: updatedShortDesc,
        Product_desc: updatedDesc
    };

    fetch('http://localhost:8080/api/updateProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product updated successfully');
            fetchProducts(); // Refresh the list
        } else {
            alert('Failed to update product');
        }
    })
    .catch(error => console.error('Error:', error));
}

function addProduct() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <input type="text" id="addName" placeholder="Product Name">
        <textarea id="addShortDesc" placeholder="Product Short Description"></textarea>
        <textarea id="addDesc" placeholder="Product Description"></textarea>
        <button class="button" onclick="saveNewProduct()">Add</button>
    ` + container.innerHTML;
}

function saveNewProduct() {
    const newName = document.getElementById('addName').value;
    const newShortDesc = document.getElementById('addShortDesc').value;
    const newDesc = document.getElementById('addDesc').value;

    const productData = {
        Product_Name: newName,
        Product_short_desc: newShortDesc,
        Product_desc: newDesc
    };

    fetch('http://localhost:8080/api/addProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product added successfully');
            fetchProducts(); // Refresh the list
        } else {
            alert('Failed to add product');
        }
    })
    .catch(error => console.error('Error:', error));
}