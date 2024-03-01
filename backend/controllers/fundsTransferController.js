const { Console } = require('console');
const http=require('https')
const sendEmail=require('../config/email')
//const db=require('../config/database');
const transferModel = require('../models/fundsTransferModel');

const fundsTransferController = {
  //transfer: function (req, res) {
  transfer: function (req, res) {
    let body = '';
    req.on('data', (parts) => {
      body += parts;
    });
  
    req.on('end', () => {
      const parsedBody = JSON.parse(body);
      //const customer_id = parsedBody.customer_id;
      const customer_id = parseInt(req.customerId);
      const sender_account = parsedBody.sender_account;
      const sender_routing_no = parsedBody.sender_routing_no;
      const receiver_account = parsedBody.receiver_account;
      const receiver_routing_no = parsedBody.receiver_routing_no;
      const amount = parsedBody.amount;
      let receiver_cust_id = 0;
      let receiver_balance = 0;
      let sender_balance = 0;
      let sender_overdraft = false;
      let overdraft_fees = 0;
      let sender_email = '';
      let receiver_email = '';

      if (!customer_id) {
        res.statusCode = 401;
        return res.end(JSON.stringify({error: 'User unauthorized and cannot be identified for transaction processing.'}));
      }

      if (!sender_account || !sender_routing_no || !receiver_account || !receiver_routing_no || !amount) {
        res.statusCode = 500;
        return res.end(JSON.stringify({error: 'Missing sender account, sender routing number, receiver account, receiver routing number, or transaction amount'}));
      }
  
      if (sender_routing_no === receiver_routing_no) {
        transferModel.fetch_sender_receiver_info(sender_account, receiver_account, (err, result) => {
          if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({error: err.sqlMessage}));
          }

          const fetch_bal_result = JSON.parse(JSON.stringify(result));

          if (fetch_bal_result.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({error: 'Both sender and receiver accounts not found for user'}));
          } else if (fetch_bal_result.length < 2) {
            res.statusCode = 404;

            if (fetch_bal_result[0].account_number == receiver_account) {
              return res.end(JSON.stringify({error: 'Sender account not found for user'}));
            } else {
              return res.end(JSON.stringify({error: 'Receiver account not found'}));
            }
          }

          fetch_bal_result.forEach((record) => {
            if (record.customer_id === customer_id) {
            //if (record.account_number === sender_account) {
              sender_balance = record.account_balance;
              sender_email = record.email;
              sender_overdraft = record.overdraft;
            } else {
              receiver_cust_id = record.customer_id;
              receiver_balance = record.account_balance;
              receiver_email = record.email;
            }
          });

          if (sender_balance < amount) {
            console.log('in this 1');
            if (sender_overdraft === 0) {
                console.log('in this 2');
              const reason = 'Insufficient balance in account';
              this.sendEmailNotif(sender_email, sender_account, amount, 0, 1, reason);
              console.log('generated email');
              res.statusCode = 422;
              return res.end(JSON.stringify({error: 'Insufficient balance in sender account'}));
            } else {
              if ((amount - sender_balance) <= (sender_balance/10)) {
                overdraft_fees += 3;
              } else {
                const reason = 'Insufficient balance in account. Overdraft limit exceeded for transaction and cannot be applied.';
                this.sendEmailNotif(sender_email, sender_account, amount, 0, 1, reason);
                console.log('generated email');
                res.statusCode = 422;
                return res.end(JSON.stringify({error: 'Insufficient balance in account. Overdraft limit exceeded for transaction and cannot be applied.'}));
              }              
            }
          }
    
          transferModel.insert_txn('INTERNAL_XFER', amount, customer_id, sender_account, receiver_account, (err, result) => {
            if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({error: err.sqlMessage}));
            }
                
            const newSenderBalance = parseFloat(sender_balance) - parseFloat(amount) - parseFloat(overdraft_fees);
            const newReceiverBalance = parseFloat(receiver_balance) + parseFloat(amount);
              
            transferModel.update_balance(newSenderBalance, sender_account, customer_id, (err, result) => {
              if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({error: err.sqlMessage}));
              }

                transferModel.update_balance(newReceiverBalance, receiver_account, receiver_cust_id, (err, result) => {
                if (err) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({error: err.sqlMessage}));
                }
                
                let msg = 'Transaction completed successfully';
                if (overdraft_fees > 0) {
                  transferModel.insert_txn('INTERNAL_OD', overdraft_fees, customer_id, sender_account, null, (err, result) => {
                    if (err) {
                      res.statusCode = 500;
                      return res.end(JSON.stringify({error: err.sqlMessage}));
                    }
                  });
                  msg = 'Transaction completed successfully. Overdraft utilized.';
                }
                this.sendEmailNotif(sender_email, sender_account, amount, 1, 1, '');
                this.sendEmailNotif(receiver_email, receiver_account, amount, 1, 0, '');
                res.writeHead(200,{'Content-Type':'application/json'});
                return res.end(JSON.stringify({message: msg}));
              });        
            })
          });
        });
      } else {
        transferModel.fetch_sender_info(sender_account, (err, result) => {
          if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({error: err.sqlMessage}));
          }

          const fetch_bal_result = JSON.parse(JSON.stringify(result));

          if (fetch_bal_result.length !== 1) {
            res.statusCode = 404;
            return res.end(JSON.stringify({error: 'Sender account not found for user'}));
          }
              
          fetch_bal_result.forEach((record) => {
            if (record.customer_id === customer_id) {
            //if (record.account_number === sender_account) {
              sender_balance = record.account_balance;
              sender_overdraft = record.overdraft;
            }
          });
    
          if (sender_balance < amount) {
            if (sender_overdraft === 0) {
              this.sendEmailNotif(sender_email, sender_account, amount, 0, 1, 'Insufficient balance in account');
              res.statusCode = 422;
              return res.end(JSON.stringify({error: 'Insufficient balance'}));
            } else {
              if ((amount - sender_balance) <= (sender_balance/10)) {
                overdraft_fees += 3;
              } else {
                const reason = 'Insufficient balance in account. Overdraft limit exceeded for transaction and cannot be applied.';
                this.sendEmailNotif(sender_email, sender_account, amount, 0, 1, reason);
                console.log('generated email');
                res.statusCode = 422;
                return res.end(JSON.stringify({error: 'Insufficient balance in account. Overdraft limit exceeded for transaction and cannot be applied.'}));
              }
            }
          }
    
          transferModel.insert_txn('EXTERNAL_XFER', amount, customer_id, sender_account, receiver_account, (err, result) => {
            if (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({error: err.sqlMessage}));
            }

            const newSenderBalance = parseFloat(sender_balance) - parseFloat(amount) - parseFloat(overdraft_fees);

            transferModel.update_balance(newSenderBalance, sender_account, customer_id, (err, result) => {
              if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({error: err.sqlMessage}));
              }
              let msg = 'Transaction completed successfully';
              if (overdraft_fees > 0) {
                transferModel.insert_txn('EXTERNAL_OD', overdraft_fees, customer_id, sender_account, null, (err, result) => {
                  if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({error: err.sqlMessage}));
                  }
                });
                msg = 'Transaction completed successfully. Overdraft utilized.';
              }
              
              this.sendEmailNotif(sender_email, sender_account, amount, 1, 1, '');
              this.sendEmailNotif(receiver_email, receiver_account, amount, 1, 0, '');
              res.writeHead(200,{'Content-Type':'application/json'});
              return res.end(JSON.stringify({message: msg}));
            });
          });
        });
      }
    });
  },
  sendEmailNotif: function(emailAddress, accountNo, amount, success_flag, sender_flag, reason) {
    const accountNoStr = String(accountNo);
    let paddedAccountNoStr = accountNoStr.padStart(4, 'X');
    const lastFourAccountNo = paddedAccountNoStr.slice(-4);
    if (success_flag === 1) {
        if (sender_flag === 1){
            sendEmail(
                emailAddress,
                'Your recent transaction is completed successfully',
                '',
                `<p>You recent transaction of $<var>${String(amount)}</var> from account <var>${String(lastFourAccountNo)}</var> is successfully completed.</p>`
            );
        } else{
            sendEmail(
                emailAddress,
                'Your recent transaction is completed successfully',
                '',
                `<p>You have successfully received $<var>${String(amount)}</var> in account <var>${String(lastFourAccountNo)}</var>.</p>`
            )
        }
    } else {
        console.log('in email failure case');
        if (sender_flag === 1){
            sendEmail(
                emailAddress,
                'Your recent transaction could not be completed',
                '',
                `<p>You recent transaction of $${String(amount)} from account ${lastFourAccountNo} could not be completed due to ${reason}.</p>`
            );
        }
    }
  }
};

module.exports = fundsTransferController;