const bcrypt = require('bcrypt');
const Cards = require('../models/customer'); 
const cardController = {
  processDebitCardRequest: function (req, res) {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        //const requestData = JSON.parse(body);
        //const customer_id = parseInt(requestData['c-id']);
        const customer_id = req.customerId;

        if (!customer_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing customer id in the request' }));
          return;
        }

        // Call the function in the Cards module to process the debit card request
        Cards.processDebitCardRequest(customer_id, (error, result) => {
          if (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Debit Card Request Denied' }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            const responseData = {
              success: true,
              message: 'New Debit card details created',
              data: result,
            };
            res.end(JSON.stringify(responseData));
          }
        });
      } catch (error) {
        console.error(error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON data in the request body' }));
      }
    });
  },
};

module.exports = cardController;
