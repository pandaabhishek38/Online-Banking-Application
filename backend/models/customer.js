const db = require("../config/database");
const bcrypt = require("bcrypt");

const Customer = {
  validateLogin: function (username, password, callback) {
    const sql = "SELECT * FROM Credentials WHERE username=?";
    db.query(sql, [username], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, false, { message: "Username not found" });
      }
      const storedHashedPassword = results[0].Password;
      bcrypt.compare(password, storedHashedPassword, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          return callback(bcryptErr, null);
        }
        if (isMatch) {
          return callback(null, true, {
            message: "Login successful",
            user: results[0],
          });
        } else {
          return callback(null, false, { message: "Incorrect password" });
        }
      });
    });
  },

  forgotCredentials: function (email, callback) {
    const sql =
      "SELECT Username FROM Credentials WHERE Customer_Id IN (SELECT Customer_Id FROM Customer WHERE Email = ?)";
    db.query(sql, [email], (err, results) => {
      if (err) {
        return callback(err);
      }
      if (results.length === 0) {
        return callback(null, null); // No match
      }
      return callback(null, results[0].Username);
    });
  },

  signupByEmail: function (email, username, password, callback) {
    const query = "SELECT Customer_Id FROM Customer WHERE Email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return callback(err);

      if (results.length === 0) {
        return callback(new Error("Customer with this email not found"));
      }

      const customerId = results[0].Customer_Id;
      const insert =
        "INSERT INTO Credentials (Customer_Id, User_Type, Username, Password) VALUES (?, 'Customer', ?, ?)";
      db.query(insert, [customerId, username, password], callback);
    });
  },

  processDebitCardRequest: function (customer_id, callback) {
    const checkAccountQuery = "SELECT * FROM Accounts WHERE Customer_Id = ?";

    db.query(
      checkAccountQuery,
      [customer_id],
      (accountError, accountResults) => {
        if (accountError) {
          return callback({ message: "Error checking customer account" });
        }

        if (accountResults.length === 0) {
          return callback({ message: "Customer does not have an account" });
        }

        const accountNumber = accountResults[0].Account_Number;

        // Check if there are any cards linked to the customer's account
        const checkCardsQuery = "SELECT * FROM Cards WHERE Account_Number = ?";

        db.query(
          checkCardsQuery,
          [accountNumber],
          (cardsError, cardsResults) => {
            if (cardsError) {
              return callback({ message: "Error checking customer cards" });
            }

            const existingDebitCards = cardsResults.filter(
              (card) => card.Card_Type === "Debit" && card.Card_Status === 0
            );

            if (existingDebitCards.length > 0) {
              // Logic to determine if the debit card request can be approved
              const today = new Date();
              const expiryThreshold = new Date(today);
              expiryThreshold.setMonth(expiryThreshold.getMonth() + 6);

              if (
                existingDebitCards.some(
                  (card) => new Date(card.Expiration_Date) > expiryThreshold
                )
              ) {
                return callback({
                  message:
                    "Debit card request denied. Expiry date is not within 6 months",
                });
              }
            }

            // Generate card details
            const cardDetails = generateCardDetails();

            // Save the new card to the database
            const insertCardQuery =
              "INSERT INTO Cards (Card_Type, Account_Number, Card_Number, Pin, Cvv, Expiration_Date, Issue_Date, Card_Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            const values = [
              "Debit",
              accountNumber,
              cardDetails.cardNumber,
              cardDetails.pin,
              cardDetails.cvv,
              cardDetails.expiryDate,
              new Date(),
              0,
            ];

            db.query(insertCardQuery, values, (insertError, insertResult) => {
              if (insertError) {
                return callback({
                  message: "Failed to insert card into the database",
                });
              }

              return callback(null, { message: "Debit card request approved" });
            });
          }
        );
      }
    );
  },

  getActiveDebitCard: function (customer_id, callback) {
    const checkAccountQuery = "SELECT * FROM Accounts WHERE Customer_Id = ?";

    db.query(
      checkAccountQuery,
      [customer_id],
      (accountError, accountResults) => {
        if (accountError) {
          return callback({ message: "Error checking customer account" });
        }

        if (accountResults.length === 0) {
          return callback({ message: "Customer does not have an account" });
        }

        const accountNumber = accountResults[0].Account_Number;
        //const cardtype = 'debit';
        //const cardStatus = 0;

        // Retrieve active debit card details for the customer's account
        /*const getDebitCardQuery = `
                SELECT * FROM Cards
                WHERE Account_Number = ?
                AND Card_Type = 'Debit'
                AND Card_Status = 0
            `;*/
        const getDebitCardQuery =
          "SELECT * FROM Cards WHERE Account_Number = ? AND Card_Type = ? AND Card_Status = ?";
        const values = [accountNumber, "debit", 0];

        db.query(getDebitCardQuery, values, (cardsError, cardsResults) => {
          if (cardsError) {
            return callback({
              message: "Error retrieving active debit card details",
            });
          }

          callback(null, cardsResults);
        });
      }
    );
  },

  validateGoogleLogin: function (email, callback) {
    const sql = "SELECT * FROM Customer WHERE email=?";
    db.query(sql, [email], callback);
  },

  application: function (
    firstName,
    lastName,
    address,
    cellPhone,
    email,
    dateOfBirth,
    accountType,
    callback
  ) {
    const sql1 = `INSERT INTO Customer (First_Name, Last_Name, Address, Cell_Phone, Email, DOB)
                      VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
      sql1,
      [firstName, lastName, address, cellPhone, email, dateOfBirth],
      (err, result) => {
        if (err) {
          return callback(err);
        }

        const Customer_Id = result.insertId;
        const currDate = new Date().toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'

        const sql2 = `INSERT INTO Accounts (Date_Of_Creation, Customer_Id, Account_Balance, Account_Type)
                        VALUES (?, ?, ?, ?)`;

        db.query(
          sql2,
          [currDate, Customer_Id, 0.0, accountType],
          (err2, result2) => {
            if (err2) {
              return callback(err2);
            }

            callback(null, result2); // ✅ All good
          }
        );
      }
    );
  },
  changeCredentials: function (email, newPassword, callback) {
    // First, check if the email exists in the Customer table
    const checkEmailQuery = "SELECT Customer_Id FROM Customer WHERE email = ?";
    db.query(checkEmailQuery, [email], (error, results) => {
      if (error) {
        // Handle the error
        callback(error);
      } else {
        if (results.length > 0) {
          // The email exists in the Customer table, so you can proceed with the update
          const Customer_Id = results[0].Customer_Id;
          const updatePasswordQuery =
            "UPDATE Credentials SET password = ? WHERE Customer_Id = ?";
          db.query(
            updatePasswordQuery,
            [newPassword, Customer_Id],
            (updateError) => {
              if (updateError) {
                // Handle the update error
                callback(updateError);
              } else {
                // Password updated successfully
                callback(null, "Password updated");
              }
            }
          );
        } else {
          // The email does not exist in the Customer table
          callback(null, "Email not found");
        }
      }
    });
  },

  signup: function (customer_id, username, password, callback) {
    //Note: Need to have the Customer with the current customer_id in the Customer table before this
    const sql =
      "INSERT INTO Credentials (Customer_Id, User_Type, Username, Password) VALUES (" +
      customer_id +
      ", 'Customer', '" +
      username +
      "', '" +
      password +
      "')";
    db.query(sql, callback);
  },
  validateTeller: function (username, callback) {
    const sql = "SELECT * FROM Credentials WHERE username=?";
    db.query(sql, [username], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, false, { message: "Username not found" });
      }
      return callback(null, true, {
        message: "Login successful",
        user: results[0],
      });
    });
  },
  accountActivity: function (customer_id, callback) {
    //Note: Need to have the Customer with the current customer_id in the Customer table before this
    const sql = ` SELECT * FROM Transactions
                    WHERE Customer_Id = ${customer_id}
                    ORDER BY Timestamp_Start DESC;`;

    db.query(sql, (error, results) => {
      if (error) {
        callback(error, results);
      }

      const results_list = [];
      // console.log(results.length)

      results_list.push(results);

      // Getting the accounts information
      const get_accounts = `SELECT * FROM Accounts WHERE Customer_Id =  ${customer_id};`;

      db.query(get_accounts, (error_new, results_new) => {
        results_list.push(results_new);
        callback(error_new, results_list);
      });
    });
  },
  bankStatement: function (customer_id, callback) {
    //Note: Need to have the Customer with the current customer_id in the Customer table before this
    const sql = ` SELECT * FROM Transactions
                    WHERE Customer_Id = ${customer_id}
                    AND Timestamp_Start >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
                    ORDER BY Timestamp_Start DESC;`;

    db.query(sql, (error, results) => {
      if (error) {
        callback(error, results);
      }
      // console.log(results.length)

      const results_list = [];

      results_list.push(results);

      // Getting the accounts information
      const get_accounts = `SELECT * FROM Accounts WHERE Customer_Id =  ${customer_id};`;

      db.query(get_accounts, (error_new, results_new) => {
        results_list.push(results_new);
        callback(error_new, results_list);
      });
    });
  },
  credit_card_payment: function (
    customer_id,
    account_num_from,
    account_num_to,
    transaction_amount,
    callback
  ) {
    //Note: Need to have the follwing before executing this:
    // 1 - Customer with the current customer_id in the Customer table
    // 2 - Account with account_number_to in the Accounts table

    const create_transaction = `INSERT INTO Transactions (Transaction_Type, Transaction_Amount, Customer_Id, Account_Num_From, Account_Num_To, Timestamp_Start, Timestamp_End) VALUES ("Credit", ${transaction_amount}, ${customer_id}, ${account_num_from}, ${account_num_to}, CURRENT_TIMESTAMP(), DATE_SUB(CURRENT_TIMESTAMP, INTERVAL -2 DAY));`;

    db.query(create_transaction, (error, results) => {
      if (error) {
        callback(error, results);
      }

      //Reducing the payment amount from the from account
      const update_balance = `UPDATE Accounts SET Account_Balance = Account_Balance - ${transaction_amount} WHERE Account_Number=${account_num_from};`;

      db.query(update_balance, (error, results) => {
        if (error) {
          callback(error, results);
        }

        //Reducing the payment amount from the to account
        const make_payment = `UPDATE Accounts SET Account_Balance = Account_Balance - ${transaction_amount} WHERE Account_Number=${account_num_to};`;

        db.query(make_payment, callback);
      });
    });
  },
  handleRevokedAmountTo: function (account_num_to, amount, callback) {
    const sql2 = `UPDATE Accounts
                            SET Account_Balance = Account_Balance - ${amount}
                            WHERE Account_Number=${account_num_to}`;
    db.query(sql2, callback);
  },

  handleRevokedAmountFrom: function (account_num_from, amount, callback) {
    const sql1 = `UPDATE Accounts
                    SET Account_Balance = Account_Balance + ${amount}
                     WHERE Account_Number=${account_num_from}`;
    db.query(sql1, callback);
  },

  revokeTransaction: function (
    customer_id,
    account_num_from,
    account_num_to,
    transaction_amount,
    transaction_id,
    callback
  ) {
    const sql = `DELETE FROM Transactions
                     WHERE Customer_Id=${customer_id}
                     AND Account_Num_From=${account_num_from}
                     AND Account_Num_To=${account_num_to}
                     AND Transaction_Amount=${transaction_amount}
                     AND Transaction_Id=${transaction_id}`;
    db.query(sql, callback);
  },

  findCustomerById: function (customer_id, callback) {
    const sql = `SELECT * FROM transactions
                     WHERE Customer_Id = ${customer_id}`;
    db.query(sql, callback);
  },

  fetchDebitCardDetails: function (customerId, callback) {
    const sql = `
            SELECT c.Card_id, c.Card_Number, c.Card_Status
            FROM accounts a
            JOIN cards c ON a.Account_Number = c.Account_Number
            WHERE a.Customer_Id = ?;
        `;

    // Execute the SQL query using your database connection, and call the callback with the results.
    db.query(sql, [customerId], callback);
  },

  getCardNumberByCardId: function (cardId, callback) {
    // Note: Need to have the Card with the current cardId in the Cards table before this
    const sql = `SELECT Card_Number FROM Cards
                     WHERE Card_Id = ${cardId};`;
    db.query(sql, callback);
  },

  getCardStatus: function (cardId, callback) {
    const sql = `SELECT Card_status FROM Cards WHERE Card_Id = ${cardId};`;
    db.query(sql, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.length) {
        return callback(null, result[0].Card_status);
      } else {
        return callback(new Error("Card not found"), null);
      }
    });
  },

  updateCardStatus: function (cardId, newStatus, callback) {
    // Note: Need to have the Card with the current cardId in the Cards table before this
    const sql = `UPDATE Cards
                     SET Card_status = ${newStatus}
                     WHERE Card_Id = ${cardId};`;
    db.query(sql, callback);
  },

  getEmailByCardId: function (cardId, callback) {
    const sql = `
            SELECT Customer.email
            FROM Cards
            JOIN Accounts ON Cards.account_number = Accounts.account_number
            JOIN Customer ON Accounts.customer_id = Customer.customer_id
            WHERE Cards.card_id = ${cardId};
        `;
    db.query(sql, callback);
  },

  getAllProducts: function (callback) {
    const sql = "SELECT * FROM Products;";
    db.query(sql, callback);
  },
  getAccountNumbers: function (customer_id, callback) {
    const sql = `SELECT account_number FROM accounts WHERE Customer_Id = ${customer_id}`;
    db.query(sql, callback);
  },
  getODAccDetails: function (customer_id, callback) {
    const sql = `SELECT account_number, account_balance, overdraft FROM accounts WHERE Customer_Id = ${customer_id}`;
    db.query(sql, callback);
  },
  updateOverdraftStat: function (overdraft, accNumber, callback) {
    const sql = `UPDATE accounts SET overdraft = ? WHERE account_number = ?`;
    db.query(sql, [overdraft, accNumber], callback);
  },
};

// Helper functions for generating random values
function generateRandomCardNumber() {
  const cardNumber = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return cardNumber;
}

function generateRandomPin() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

function generateRandomCvv() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
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

module.exports = Customer;
