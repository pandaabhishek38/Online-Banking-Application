const Customer = require('../models/customer');
const Admin = require('../models/admin');
const url = require('url');

const productController = {

    fetchProductDetails: function(req, res) {
        try {
            Customer.getAllProducts((error, products) => {
                if (error) {
                    console.error('Fetching products failed:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Fetching products failed', error }));
                } else {
                    if (!products || products.length === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'No products found' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, data: products }));
                    }
                }
            });
        } catch (error) {
            console.error('Fetching products failed:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Fetching products failed', error }));
        }
    },

    addProduct: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Product_Name = requestData['Product_Name'];
                const Product_short_desc = requestData['Product_short_desc'];
                const Product_desc = requestData['Product_desc'];

                if (!Product_Name || !Product_short_desc) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing Product_Name or Product_short_desc in the request body' }));
                } else {
                    Admin.insertProduct(Product_Name, Product_short_desc, Product_desc, (error, results) => {
                        if (error) {
                            console.error('Product insertion failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Product insertion failed', error }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Product added successfully',
                                data: { Product_Name, Product_short_desc, Product_desc },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Product insertion failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Product insertion failed', error }));
            }
        });
    },

    updateProduct: function (req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const Product_Id = requestData['Product_Id'];
                const Product_Name = requestData['Product_Name'];
                const Product_short_desc = requestData['Product_short_desc'];
                const Product_desc = requestData['Product_desc'];

                if (!Product_Id || !Product_Name || !Product_short_desc) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing Product_Id, Product_Name, or Product_short_desc in the request body' }));
                } else {
                    Admin.updateProductDetails(Product_Id, Product_Name, Product_short_desc, Product_desc, (error, results) => {
                        if (error) {
                            console.error('Product update failed:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Product update failed', error }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const responseData = {
                                success: true,
                                message: 'Product updated successfully',
                                data: { Product_Id, Product_Name, Product_short_desc, Product_desc },
                            };
                            res.end(JSON.stringify(responseData));
                        }
                    });
                }
            } catch (error) {
                console.error('Product update failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Product update failed', error }));
            }
        });
    },

    deleteProduct: function (req, res) {
        try {
            // const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            // const productId = parsedUrl.searchParams.get('productId');

            const parsedUrl = url.parse(req.url, true);
            const productId = parsedUrl.query.productId;

            if (!productId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing productId in the request' }));
            } else {
                Admin.deleteProduct(productId, (error, results) => {
                    if (error) {
                        console.error('Product deletion failed:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Product deletion failed', error }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Product deleted successfully' }));
                    }
                });
            }
        } catch (error) {
            console.error('Product deletion failed:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product deletion failed', error }));
        }
    }
};



module.exports = productController;