const customerController = require('../controllers/customerController');
const alertController=require('../controllers/alertController');
const adminController=require('../controllers/adminController');
const reportCardController=require('../controllers/reportCardController');
const productController=require('../controllers/productController');
const transactionController=require('../controllers/transaction_controller');
const cardController=require('../controllers/cardController');
const fundsTransferController=require('../controllers/fundsTransferController')
const { parse } = require('querystring');
const authenticateToken = require('../controllers/middleware.js');


function handleAPIRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const endpoint = pathname.split('/').pop();
  if (req.method === 'POST') {
    switch (endpoint) {
      case 'login':
        customerController.login(req, res);
        break;
      case 'bankTeller':
        authenticateToken(req, res, () => customerController.bank_teller(req, res))
        break;
      case 'signup':
        customerController.sign_up(req, res);
        break;
      case 'application':
        alertController.alert(req,res);
        break;
      case 'email-alert':
        alertController.alert(req,res);
        break;
      case 'discord-alert':
        alertController.discordtext(req,res);
        break;
      case 'insertPolicy':
        adminController.insertPolicy(req,res);
        break;
      case 'insertPolicyRates':
        adminController.insertPolicyRates(req,res);
        break;
      case 'locate_branch':
        customerController.locate_branch(req, res);
        break;
      case 'confirmReportCard':
        reportCardController.confirmReportCard(req,res)
        break;
      case 'deleteCard':
        reportCardController.deleteCard(req,res)
        break;
      case 'reactivateCard':
        reportCardController.reactivateCard(req,res)
        break;
      case 'addProduct':
        productController.addProduct(req,res);
        break;
      case 'updateProduct':
        productController.updateProduct(req,res);
        break;
      case 'deleteProduct':
        productController.deleteProduct(req,res);
        break;
      case 'card_payment':
        authenticateToken(req, res, () =>  customerController.credit_card_payment(req, res));
        break;
      case 'process_debit_card_request':
        authenticateToken(req, res, () =>  cardController.processDebitCardRequest(req, res));
        break;
      case 'admin_process_debit_card_request':
        authenticateToken(req, res, () =>  adminController.processAdminDebitCardRequest(req, res));
        //adminController.processAdminDebitCardRequest(req, res);
        break;
      case 'transfer-funds':
        authenticateToken(req, res, () =>  fundsTransferController.transfer(req, res));
        break;
      case 'int-payment':
        transactionController.international_payment(req,res);
        break;
      case 'addTeller':
        authenticateToken(req, res, () =>  adminController.addTeller(req,res));
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        break;
    }
  } else if (req.method === 'GET'){
    switch (endpoint) {
      case 'accountActivity':
        authenticateToken(req, res, () => customerController.accountActivity(req, res));
      break;
      case 'getAllCustomers':
        authenticateToken(req, res, () => adminController.getAllCustomers(req, res));
      break;
      case 'get_debit_card_details':
        authenticateToken(req, res, () => customerController.getActiveDebitCard(req, res));
      break;
        case 'bankStatement':
        authenticateToken(req, res, () => customerController.bankStatement(req, res));
        break;
      case 'getAllPolicyNames':
        adminController.getAllPolicyNames(req,res);
        break;
      case 'getPolicyDesc':
        adminController.getPolicyDesc(req,res);
        break;
      case 'getAllPolicyRates':
        adminController.getAllPolicyRates(req,res);
        break;
      case 'google-login':
        customerController.google_login(req,res);
        break;
      case 'google-login-callback':
        customerController.google_login_callback(req,res);
        break;
      case 'fetch-debit-card-details':
        authenticateToken(req, res, () => reportCardController.fetchDebitCardDetails(req, res));
        break;
      case 'report-card':
        reportCardController.reportCard(req,res);
        break;
      case 'fetch-product-details':
        productController.fetchProductDetails(req,res);
        break;    
      case 'getAccountNumbers':
        authenticateToken(req, res, () => customerController.getAccountNumbers(req, res));
        break;
      case 'getTellers':
        authenticateToken(req, res, () => adminController.getTellers(req,res));
        break;
      case 'getODAccDetails':
        authenticateToken(req, res, () => customerController.getODAccDetails(req, res));
        break; 
      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        break;
    }
  }
  else if(req.method==='DELETE'){
    switch(endpoint){
      case 'trans-rev':
        transactionController.revoke(req,res);
        break;
      case 'deletePolicy':
        adminController.deletePolicy(req,res);
        break;
      case 'deletePolicyRate':
        adminController.deletePolicyRate(req,res);
        break;
      case 'delete-teller':
        adminController.deleteTeller(req,res);
        break;
      default:
        console.log('in delete')
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        break;
    }
  } else if (req.method==='PUT') {

    switch (endpoint) {
      case 'updatePolicy':
        adminController.updatePolicy(req, res);
        break;
      case 'updatePolicyRate':
        adminController.updatePolicyRate(req, res);
        break;
      case 'toggleOverdraft':
        authenticateToken(req, res, () => customerController.toggleOverdraft(req,res));
        break
      case 'changeCredentials':
        alertController.alert(req,res);
        break;
      default:
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Not Found'}));
        break;
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}

module.exports = handleAPIRequest;