const db=require('../config/database');

const admin={

    //# region Use-Case 8: Business Policies

    /**
     * POST: Inserts a new policy into the database.
     *
     * @param {string} policy_name - The HTTP request object.
     * @param {string} policy_desc - The HTTP request object.
     * @param {function} callback - A callback function to handle the results.
     */
    insertpolicy: function (policy_name, policy_desc, callback) {
        const sql = "INSERT INTO Business_Policies (Policy_Name, Policy_Desc) VALUES (?, ?)";
        db.query(sql, [policy_name, policy_desc], callback);
    },

    /**
     * GET: Retrieves all policy names.
     * @param {function} callback - A callback function to handle the results.
     */
    getpoliciesname: function(callback)
    {
        const sql = "SELECT Policy_Name FROM Business_Policies";
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error getting policy names:', error);
                callback(error, null);
            } else {
                callback(null, results);
            }
        });

    },

    /**
     * GET: Gets the policy description.
     *
     * @param {string} policy_name - The HTTP request object.
     * @param {function} callback - A callback function to handle the results.
     */
    //get the policy description for the selected policy_name
    getpolicydesc: function (policy_name, callback) {
        const sql = "SELECT Policy_Desc FROM Business_Policies WHERE Policy_Name = ?";
        db.query(sql, [policy_name], callback);
    },

    /**
     * PUT: Updates the description for a specific policy in the database.
     *
     * @param {string} policy_name - The HTTP request object.
     * @param {string} policy_desc - The HTTP request object.
     * @param {function} callback - A callback function to handle the results.
     */
    updatepolicy: function (policy_name, policy_desc, callback) {
        const sql = "UPDATE Business_Policies SET Policy_Desc = ? WHERE Policy_Name = ?";
        db.query(sql, [policy_desc, policy_name], callback);
    },

    /**
     * DELETE: Deletes the policy with selected name.
     *
     * @param {string} policy_name - The HTTP request object.
     * @param {function} callback - A callback function to handle the results.
     */
    //get the policy description for the selected policy_name
    deletepolicy: function (policy_name, callback) {
        const sql = "DELETE FROM Business_Policies WHERE Policy_Name = ?";
        db.query(sql, [policy_name], callback);
    },


    //# endregion

    //# region Use-Case 11: Admin .
    /**
     * Inserts a new policy rate into the database.
     *
     * @param {string} Policy_Name - The name of the policy for which to insert the rate.
     * @param {number} rate - The rate value to be inserted.
     * @param {function} callback - A callback function to handle the operation's result.
     */
    insertpolicyrate: function(Policy_Name,rate,callback)
    {
        const sql = "INSERT INTO Policy_Rates (Policy_Name, rate) VALUES (?, ?)";
        db.query(sql, [Policy_Name, rate], callback);
    },

    /**
     * Updates the rate for a specific policy in the database.
     *
     * @param {string} Policy_Name - The name of the policy for which to update the rate.
     * @param {number} rate - The new rate value.
     * @param {function} callback - A callback function to handle the operation's result.
     */
    updatepolicyrate: function (Policy_Name,rate, callback) {
        const sql = "UPDATE Policy_Rates SET rate = ? WHERE Policy_Name = ?";
        db.query(sql, [rate, Policy_Name], callback);
    },

    /**
     * Retrieves all policy names and their associated rates from the database.
     *
     * @param {function} callback - A callback function to handle the query results.
     */
    getpoliciesrates: function(callback)
    {
        const sql = "SELECT Policy_Name, rate FROM Policy_Rates";
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error getting policy names:', error);
                callback(error, null);
            } else {
                callback(null, results);
            }
        });

    },

    getAllCustomers: function (callback) {
        const sql = "SELECT * FROM Customer";
        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error retrieving customers:', error);
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    },

    processAdminDebitCardRequest: function (customer_id, callback) {
        const checkAccountQuery = 'SELECT * FROM Accounts WHERE Customer_Id = ?';
    
        db.query(checkAccountQuery, [customer_id], (accountError, accountResults) => {
          if (accountError) {
            return callback({ message: 'Error checking customer account' });
          }
    
          if (accountResults.length === 0) {
            return callback({ message: 'Customer does not have an account' });
          }
    
          const accountNumber = accountResults[0].Account_Number;
    
          // Check if there are any cards linked to the customer's account
          const checkCardsQuery = 'SELECT * FROM Cards WHERE Account_Number = ?';
    
          db.query(checkCardsQuery, [accountNumber], (cardsError, cardsResults) => {
            if (cardsError) {
              return callback({ message: 'Error checking customer cards' });
            }
    
            const existingDebitCards = cardsResults.filter((card) => card.Card_Type === 'Debit' && card.Card_Status === 0);
    
            if (existingDebitCards.length > 0) {
              // Logic to determine if the debit card request can be approved
              const today = new Date();
              const expiryThreshold = new Date(today);
              expiryThreshold.setMonth(expiryThreshold.getMonth() + 6);
    
              if (existingDebitCards.some((card) => new Date(card.Expiration_Date) > expiryThreshold)) {
                return callback({ message: 'Debit card request denied. Expiry date is not within 6 months' });
              }
            }
    
            // Generate card details
            const cardDetails = generateCardDetails();
    
            // Save the new card to the database
            const insertCardQuery = 'INSERT INTO Cards (Card_Type, Account_Number, Card_Number, Pin, Cvv, Expiration_Date, Issue_Date, Card_Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = ['Debit', accountNumber, cardDetails.cardNumber, cardDetails.pin, cardDetails.cvv, cardDetails.expiryDate, new Date(), 0];
    
            db.query(insertCardQuery, values, (insertError, insertResult) => {
              if (insertError) {
                return callback({ message: 'Failed to insert card into the database' });
              }
    
              return callback(null, { message: 'Debit card request approved' });
            });
          });
        });
      },

    /**
     * DELETE: Deletes the policy rate with selected name.
     *
     * @param {string} policy_name - The HTTP request object.
     * @param {function} callback - A callback function to handle the results.
     */
    //get the policy description for the selected policy_name
    deletepolicyrate: function (policy_name, callback) {
        const sql = "DELETE FROM Policy_Rates WHERE Policy_Name = ?";
        db.query(sql, [policy_name], callback);
    },
    //# endregion

    getTellers: function (callback) {
      const sql = "SELECT employee_id, first_name, last_name FROM bank_representative WHERE employee_type = 'Teller'";
      db.query(sql, callback);
  },
  getCustID: function (emp_id, callback) {
      const sql = "SELECT customer_id FROM bank_representative WHERE employee_id = ?";
      db.query(sql, [emp_id], callback);
  },
  deleteTellerCred: function (cust_id, callback) {
      const sql = "DELETE FROM credentials WHERE customer_id = ?";
      db.query(sql, [cust_id], callback);
  },
  deleteTellerRep: function (emp_id, callback) {
      const sql = "DELETE FROM bank_representative WHERE employee_id = ?";
      db.query(sql, [emp_id], callback);
  },
  checkUsernames: function (username, callback) {
      const sql = "SELECT COUNT(1) as cnt FROM credentials WHERE username = ?";
      db.query(sql, [username], callback);
  },
  // getMaxCustId: function (callback) {
  //     const sql = "SELECT MAX(customer_id) as max_cust FROM credentials";
  //     db.query(sql, callback);
  // },
  getMaxCustId: function(callback)
  {
      const sql = "SELECT MAX(customer_id) as max_cust FROM credentials";
      db.query(sql, (error, results) => {
          if (error) {
              console.error('Error getting max cust ID:', error);
              callback(error, null);
          } else {
              callback(null, results);
          }
      });
  },

  updateProductDetails: function (Product_Id, Product_Name, Product_short_desc, Product_desc, callback) {
      const sql = `UPDATE Products SET Product_Name = ?, Product_short_desc = ?, Product_desc = ? WHERE Product_Id = ?;`;
      db.query(sql, [Product_Name, Product_short_desc, Product_desc, Product_Id], callback);
  },

  deleteProduct: function (productId, callback) {
      const sql = `DELETE FROM Products WHERE Product_Id = ?;`;
      db.query(sql, [productId], callback);
  },

  insertProduct: function (Product_Name, Product_short_desc, Product_desc, callback) {
      const sql = `INSERT INTO Products (Product_Name, Product_short_desc, Product_desc) VALUES (?, ?, ?);`;
      db.query(sql, [Product_Name, Product_short_desc, Product_desc], callback);
  },

  addTellerCred: function (customer_id, user_type, username, password, callback) {
      const sql = "INSERT INTO credentials(customer_id, user_type, username, password) VALUES (?,?,?,?)";
      db.query(sql, [customer_id, user_type, username, password], callback);
  },
  getTellerCustId: function (username, callback) {
      const sql = "SELECT customer_id FROM credentials WHERE username = ?";
      db.query(sql, [username], callback);
  },
  addTellerRep: function (cust_id, first_name, last_name, emp_type, callback) {
      const sql = "INSERT INTO bank_representative(customer_id, first_name, last_name, employee_type) VALUES (?,?,?,?)";
      db.query(sql, [cust_id, first_name, last_name, emp_type], callback);
  },
  checkAdmin: function (cust_id, callback) {
      const sql = `SELECT user_type FROM credentials WHERE customer_id = ${cust_id}`;
      db.query(sql, callback);
  }



}

// Helper functions for generating random values
function generateRandomCardNumber() {
    const cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    return cardNumber;
  }
  
  function generateRandomPin() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
  }
  
  function generateRandomCvv() {
    return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  }
  
  function generateExpiryDate() {
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    return expiryDate;
  }
  
  // Function to generate card details
  function generateCardDetails() {
    const cardNumber = generateRandomCardNumber();
    const pin = generateRandomPin();
    const cvv = generateRandomCvv();
    const expiryDate = generateExpiryDate();
  
    return { cardNumber, pin, cvv, expiryDate };
  }

module.exports=admin;
