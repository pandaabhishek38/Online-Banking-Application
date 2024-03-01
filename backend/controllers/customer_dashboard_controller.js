const Customer = require('../models/customer');
const fs = require('fs');

// A function to open the dashboard for the customer
function get_customer_accounts(id, res){
    
    Customer.accountsDashboard(id, (error, results) => {
      if(error){
        console.error(error);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Failed to find the open accounts.');
      }
      else{
        console.log(`Result of get query: ${JSON.stringify(results)}`);
  
        send_file('../../frontend/public/customer_dashboard.html', res, { customer_id : id, accounts : results });
      }
    });
  
  }

function send_file(file_path, res, variables) {
    fs.readFile(file_path, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } 
      else {
        if (variables) {

          for (const key in variables) {

            if (variables.hasOwnProperty(key)) {
              data = data.replace(`{{${key}}}`, variables[key]);
            }

          }
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
  
  module.exports = {
    get_customer_accounts,
    send_file
  }