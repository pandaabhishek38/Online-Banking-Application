const https = require('https');
const Customer = require('../models/customer');
require('dotenv').config()

function initiateTransactionRevocationTo(account_to, transaction_amount,res){
  Customer.handleRevokedAmountTo(account_to,transaction_amount,(error, results) => {
    if (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    else if(results.length==0){
      console.error("Empty result");
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
    } else {
      console.log(`Result of get query: ${JSON.stringify(results)}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const responseData = {
        success: true,
        message: 'Data Revoked Successfully',
        data: results,
      };
      res.end(JSON.stringify(responseData));
    }
  });
}

function initiateTransactionRevocationFrom(account_from, account_to, transaction_amount,res) {
  Customer.handleRevokedAmountFrom(account_from,transaction_amount,(error, results) => {
      if (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } 
      else if(results.length==0){
        console.error("Empty result");
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
      }else {
        initiateTransactionRevocationTo(account_to, transaction_amount,res);
      }
  });
}

function initiateRevocation(customer_id,account_from,account_to,transaction_amount,transaction_id,res){
  Customer.revokeTransaction(customer_id,account_from,account_to,transaction_amount,transaction_id,(error,results)=>{
                              if(error){
                                  console.error(error);
                                  res.writeHead(500, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ error: 'Internal Server Error' }));
                              }
                              else if(results.length==0){
                                console.error("Empty result");
                                  res.writeHead(400, { 'Content-Type': 'application/json' });
                                  res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
                              }
                              else{
                                initiateTransactionRevocationFrom(account_from,account_to,transaction_amount,res);
                              }
                            })
}

function initiateInternational(account_from,Amount,desired_currency,res){
  const url=`https://v6.exchangerate-api.com/v6/${process.env.exchange_API}/latest/${desired_currency}`;
  console.log(url);
  fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    if (data.result='success') {
      const convertedAmount = data.conversion_rates['USD']*Amount;
      Customer.handleRevokedAmountTo(account_from,convertedAmount,(error,results)=>{
        if(error){
          console.error(error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
      else if(results.length==0){
        console.error("Empty result");
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
      }
      else{
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const responseData = {
          success: true,
          message: 'Payment made succesfully',
          data: results,
        };
        res.end(JSON.stringify(responseData));
      }
      })
    } else {
      console.error('Conversion failed:', data);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  }); 
}

const transactionController={
  revoke(req,res){
    let body='';

    req.on('data', chunk => {
        body += chunk;
      });
    req.on('end', async () => {
        const requestData = JSON.parse(body);
        let customer_id=parseInt(requestData['customerId']);
        let transaction_id=parseInt(requestData['transactionID']);
        let transaction_amount=parseInt(requestData['transactionAmount']);
        let account_from=parseInt(requestData['accountFrom']);
        let account_to=parseInt(requestData['accountTo']);
        if (!customer_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing customer id, username or password in headers' }));
          }else{
            Customer.findCustomerById(customer_id,(error,results)=>{             
                          if(error){
                              console.error(error);
                              res.writeHead(500, { 'Content-Type': 'application/json' });
                              res.end(JSON.stringify({ error: 'Internal Server Error' }));
                          }
                          else if(results.length==0){
                            console.error("Empty result");
                              res.writeHead(400, { 'Content-Type': 'application/json' });
                              res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
                          }
                          else{
                            initiateRevocation(customer_id,account_from,account_to,transaction_amount,transaction_id,res);
                          }
                        });
                }

          })
  },
  international_payment(req,res){
    let body='';

    req.on('data', chunk => {
        body += chunk;
      });
    req.on('end', async () => {
      const requestData = JSON.parse(body);
      
      let customer_id=parseInt(requestData['customerId']);
      let amount=parseInt(requestData['Amount']);
      let account_from=parseInt(requestData['accountFrom']);
      let desired_currency=requestData['desiredCurrency'];

      if (!customer_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing customer id, username or password in headers' }));
      }else{
        Customer.findCustomerById(customer_id,(error,results)=>{
          if(error){
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }else if(results.length==0){
          console.error("Empty result");
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User Error: Some fields are missing or incorrect' }));
        }else{
          console.log(amount,desired_currency);
          initiateInternational(account_from,amount,desired_currency,res);
        }
        })
      }
    })
  }
}

module.exports= transactionController

