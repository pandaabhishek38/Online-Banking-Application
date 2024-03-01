const bcrypt = require('bcrypt');
const url = require('url');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
const {send_map_request} = require('./locate_branch_controller');
const {oauth2client,SCOPES} = require('../config/oauth');
const { google } = require('googleapis');

const customerController = {
  login: function (req, res)  {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        // Parse the request data
        const requestData = JSON.parse(body);
        const username = requestData['u-name'];
        const password = requestData['user-password'];

        if (!username || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing username or password in request data' }));
        } else {
            Customer.validateLogin(username, password, (error,isValid, results) => {
                if (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    if (isValid) {
                      const {Customer_Id, User_Type,Username, Password}=results.user;
                        
                      const token = jwt.sign({Customer_Id}, "enc_key", {expiresIn:'1h'})

                      res.writeHead(200, {
                        'Content-Type': 'application/json'
                      });
                      res.end(JSON.stringify({ 
                        success:true,
                        message:'Login successful',
                        user: User_Type,
                        token: token
                      }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Unauthorized' }));
                    }
                }
            });
        }
    });
},

getActiveDebitCard: function (req, res) {
  const customerId = req.customerId; // Assuming customerId is passed in the request parameters

  Customer.getActiveDebitCard(customerId, (error, debitCardDetails) => {
    if (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error retrieving active debit card details' }));
      //console.error(error);
      //res.json({ error: 'Error retrieving active debit card details' });
    } else {
      if (debitCardDetails && debitCardDetails.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
            const responseData = {
              success: true,
              message: 'Active card details retrieved',
              data: debitCardDetails,
            };
            res.end(JSON.stringify(responseData));
        //res.json({ success: true, data: debitCardDetails });
      } else {
        //res.json({ message: 'No active debit cards found for the customer' });
        console.error(error);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No active debit cards found for the customer' }));
      }
    }
  });
},

  google_login: function(req,res){
    const authURL=oauth2client.generateAuthUrl({
      access_type:'offline',
      scope:SCOPES,
    });
    res.writeHead(302,{Location:authURL});
    res.end();
  },
  google_login_callback:function(req,res){
    const requestURL=url.parse(req.url,true);
    const code=requestURL.query.code;
    oauth2client.getToken(code,(err,tokens)=>{
      if(err){
        console.log('Error authenticating with google',err);
        res.end('Google OAuth failed.');
      }
      else{
        const credentials=tokens.credentials;
        const oauth2 = google.oauth2({
          auth: oauth2client,
          version: 'v2',
        });
        oauth2client.setCredentials(tokens);
        oauth2.userinfo.get((err,response)=>{
          if(err){
            console.error('Error getting user information from Google:', err);
          res.end('Google OAuth failed. Please try again.');
          }else{
            const email=response.data.email;
            Customer.validateGoogleLogin(email,(error,results)=>{
              if(error){
                console.error(error);
                res.end('Google OAuth failed. Please try again');
              }else{
                if(results.length===1){
                  const token=jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'1h'});
                  res.writeHead(302, {
                    'Location': '/customer_dashboard.html',
                    'Content-Type': 'application/json',
                  });
                  res.end(JSON.stringify({ token }));
                }else{
                  res.end('Google OAuth failed. Email not found in our records.');
                }
              }
            })
          }
        })
      }
    });

  },

  application: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        console.log(`Data received on backend: ${body}`)
        // Expected data from frontend
        // {
        //   'First_Name': 'Aperiam libero volup',
        //   'Last_Name': 'Kaitlin Mcintosh',
        //   'Address': 'Pa$$w0rd!',
        //   'Cell_Phone': 'Pa$$w0rd!',
        //   'Email': 'Pa$$w0rd!',
        //   'DOB': 'Pa$$w0rd!',
        // }
        const requestData = JSON.parse(body);
        const firstName =  requestData['First_Name'];
        const lastName = requestData['Last_Name'];
        const address =  requestData['Address'];
        const cellPhone = requestData['Cell_Phone'];
        const email =  requestData['Email'];
        const dateOfBirth =  requestData['DOB'];
        const accountType =  requestData['Account_Type'];

        console.log(`${firstName}, ${lastName}, ${address}, ${cellPhone}, ${email}, ${dateOfBirth}`)
    
        if (!firstName || !lastName || !address || !cellPhone || !email || !dateOfBirth) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing First Name, Last Name, Address, Cell Phone, Email, or Date of Birth in headers' }));
        }else{

          Customer.application(firstName, lastName, address, cellPhone, email, dateOfBirth, accountType, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              console.log("1 record inserted via Application");
              //const Customer = jwt.sign({Customer_Id}, "enc_key", {expiresIn:'1h'})
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
        
        
    });
    

   
  },
  changeCredentials: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        console.log(`Data received on backend: ${body}`)
        // Expected data from frontend
        // {
        //   'c-id': 'Aperiam libero volup',
        //   'Email': 'Kaitlin Mcintosh',
        //   'NewPassword': 'Pa$$w0rd!',
        //   'NewPasswordConfirm': 'Pa$$w0rd!'
        // }
        const requestData = JSON.parse(body);
        const email = requestData['Email'];
        //const newPassword = requestData['NewPassword'];
        const newPassword = await bcrypt.hash(requestData['NewPassword'], 10); // 10 is the number of salt rounds
        const newPasswordConfirm = await bcrypt.hash(requestData['NewPasswordConfirm'], 10); // 10 is the number of salt rounds

        console.log(`${email}, ${newPassword}, ${newPasswordConfirm}`)
    
        if (!email || !newPassword || !newPasswordConfirm) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing customer id, email or newPassword in headers' }));
        }else if (!(newPassword == newPasswordConfirm)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Passwords dont match' }));
        }else{

          Customer.changeCredentials(email, newPassword, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              console.log("1 record inserted via Sign-up");
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
        
        
    });
    

   
  },

  sign_up: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        console.log(`Data received on backend: ${body}`)
        // Expected data from frontend
        // {
        //   'c-id': 'Aperiam libero volup',
        //   'u-name': 'Kaitlin Mcintosh',
        //   'user-password': 'Pa$$w0rd!',
        //   'user-password-confirm': 'Pa$$w0rd!'
        // }
        const requestData = JSON.parse(body);
        // Obtain the reCAPTCHA response token from the request data
        const recaptchaResponse = requestData['recaptchaResponse'];

        // Verify reCAPTCHA response with Google's reCAPTCHA verification endpoint
        const recaptchaSecretKey = '6Lf-Su4oAAAAAKfgFAEh39SXBJFVzqs5Qrt3cVFe'; // Replace with your reCAPTCHA secret key
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaResponse}`;
        try {
          const recaptchaVerificationResponse = await fetch(verificationUrl, {
            method: 'POST'
          });
    
          const recaptchaVerificationData = await recaptchaVerificationResponse.json();
          console.log("Recaptcha Verification Response:  ",recaptchaVerificationData);
          if (recaptchaVerificationData.success && recaptchaVerificationData.score >= 0.5 && recaptchaVerificationData.action === "submit") {
            // reCAPTCHA verification successful, proceed with user signup
              const token = req.headers['authorization'].split(' ')[1];
              let cust_id;
              if (!token) {
                console.log("No Token"); // Redirect to error page if token is missing
              }

              jwt.verify(token, 'enc_key', (err, decoded) => {
                if (err) {
                  console.log("Token Invalid") // Redirect to error page if token is invalid
                }

                cust_id = decoded.Customer_Id;
              });
            // const cust_id = parseInt(requestData['c-id']);
            const username = requestData['u-name'];
            const password = await bcrypt.hash(requestData['user-password'], 10); // 10 is the number of salt rounds

            console.log(`${cust_id}, ${username}, ${password}`)
    
        if (!cust_id || !username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing customer id, username or password in headers' }));
        }else{

          Customer.signup(cust_id, username, password, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              console.log("1 record inserted via Sign-up");
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
          } else {
            // reCAPTCHA verification failed, handle the error
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'reCAPTCHA verification failed' }));
          }
        } catch (error) {
          // Handle fetch errors
          console.error(error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        
    });
    

   
  },
  accountActivity: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        const cust_id = req.customerId;

        //console.log(cust_id);

        // console.log(`${cust_id}`)
    
        if (!cust_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing customer id, username or password in headers' }));
        }else{

          Customer.accountActivity(cust_id, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              // console.log(`Result of get query: ${JSON.stringify(results)}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {results},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
        
        
    });
    

   
  },
  // A function to submit a payment for a credit card account
  credit_card_payment: function(req, res){

    let body = '';
    
    req.on('data', chunk => {
      body += chunk;
    });
    
    req.on('end', () => {
        console.log(`Data received on backend: ${body}`)

        // The following is expected in the request
        // 1 - Customer ID
        // 2 - Account Number From
        // 3 - Account Number To
        // 4 - Transaction Amount

        const request_data = JSON.parse(body);

        try{

          const customer_id = parseInt(req.customerId);
          const account_num_from = parseInt(request_data['account_num_from']);
          const account_num_to = parseInt(request_data['account_num_to']);
          const transaction_amount = parseFloat(request_data['transaction_amount']);

          Customer.credit_card_payment(customer_id, account_num_from, account_num_to, transaction_amount, (error, results) => {
            
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              console.log(`Result of credit card payment request: ${JSON.stringify(results)}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              
              const response_data = {
                success: true,
                message: 'Payment submitted Successfully'
              };

              res.end(JSON.stringify(response_data));
            }
          });
        }
        catch(error){
          console.log(error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing parameters needed to submit payment' }));
        }
        
        
        
    });
  },
  bank_teller:function (req, res)  {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        // Parse the request data
        const requestData = JSON.parse(body);
        const username = requestData['u-name'];

        if (!username) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing username or password in request data' }));
        } else {
            Customer.validateTeller(username, (error,isValid, results) => {
                if (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    if (isValid) {
                      const {Customer_Id, User_Type,Username, Password}=results.user;
                        
                      const token = jwt.sign({Customer_Id}, "enc_key", {expiresIn:'1h'})

                      res.writeHead(200, {
                        'Content-Type': 'application/json'
                      });
                      res.end(JSON.stringify({ 
                        success:true,
                        message:'Login successful',
                        user: User_Type,
                        token: token
                      }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Unauthorized' }));
                    }
                }
            });
        }
    });
},
  bankStatement: function(req, res){
    
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        const cust_id = req.customerId;

        if (!cust_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing customer id, username or password in headers' }));
        }else{

          Customer.bankStatement(cust_id, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
              // console.log(`Result of get query: ${JSON.stringify(results)}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {results},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
        
        
    });
    

   
  },
  //A function that uses nominatim geolocation API
  locate_branch: function(req, res){
    let request_body = '';

    req.on('data', (chunk) => {
      request_body += chunk;
    });

    req.on('end', () => {
      send_map_request(request_body, res);
    });
  },
  getAccountNumbers: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        const cust_id = req.customerId;
        console.log(`cust_id: ${cust_id}`);
        if (!cust_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          console.log('Unable to authenticate and identify the user');
          res.end(JSON.stringify({ error: 'Unable to authenticate and identify the user' }));
        }else{

          Customer.getAccountNumbers(cust_id, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else{
              console.log(`Result of get query: ${JSON.stringify(results)}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {results},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
    });
  },
  toggleOverdraft: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        const cust_id = req.customerId;
        console.log(`cust_id: ${cust_id}`);
        if (!cust_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          console.log('Unable to authenticate and identify the user');
          res.end(JSON.stringify({ error: 'Unable to authenticate and identify the user' }));
        } else{
          const parsedBody = JSON.parse(body);
          const accNumber = parsedBody.account_number;
          const overdraft = parsedBody.overdraft;

          Customer.updateOverdraftStat(overdraft, accNumber, (error, results) => {
            console.log('In toggleOverdraft: in addTellerRep');
            if (error) {
                console.error('Failed in updating overdraft Status:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({error: 'Failed in updating overdraft Status.', error}));
            }
            console.log('In toggleOverdraft: returning successfully');
            res.writeHead(200,{'Content-Type':'application/json'});
            return res.end(JSON.stringify({success: true, message: 'Overdraft Enrollment Status changed Successfully'}));
          });
        }
    });
  },
  getODAccDetails: function(req, res){
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
        const cust_id = req.customerId;
        console.log(`cust_id: ${cust_id}`);
        if (!cust_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          console.log('Unable to authenticate and identify the user');
          res.end(JSON.stringify({ error: 'Unable to authenticate and identify the user' }));
        }else{

          Customer.getODAccDetails(cust_id, (error, results) => {
            if(error){
              console.error(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            else{
               console.log(`Result of get query: ${JSON.stringify(results)}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              const responseData = {
                success: true,
                message: 'Data Received Successfully',
                data: {overdraftDetails: results},
              };
              res.end(JSON.stringify(responseData));
            }
          });
          
        }
    });
  }

};

module.exports = customerController