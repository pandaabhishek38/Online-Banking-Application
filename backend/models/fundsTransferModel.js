const db=require('../config/database');

const fundsTransferModel={

    fetch_sender_receiver_info: function(sender_account, receiver_account, callback){
        const sql= 'SELECT a.customer_id, a.account_number, a.account_balance, a.overdraft, b.email FROM accounts a, customer b WHERE a.customer_id = b.customer_id AND a.account_number IN (?,?);';
        db.query(sql,[sender_account, receiver_account],callback);
    },

    fetch_sender_info: function(sender_account, callback){
        const sql= 'SELECT a.customer_id, a.account_balance, a.overdraft, b.email FROM accounts a, customer b WHERE a.customer_id = b.customer_id AND a.account_number = ?;';
        db.query(sql,[sender_account],callback);
    },

    insert_txn: function(txn_type, amount, customer_id, sender_account, receiver_account, callback){
        const sql= 'INSERT INTO transactions (transaction_type, transaction_amount, customer_id, account_num_from, account_num_to, timestamp_start, timestamp_end) VALUES (?, ?, ?, ?, ?, NOW(), NOW());';
        db.query(sql,[txn_type, amount, customer_id, sender_account, receiver_account],callback);
    },

    update_balance: function(new_acc_bal, account_no, customer_id, callback){
        const sql= 'UPDATE accounts SET account_balance = ? WHERE account_number = ? AND customer_id = ?';
        db.query(sql,[new_acc_bal, account_no, customer_id],callback);
    }
};

module.exports=fundsTransferModel;