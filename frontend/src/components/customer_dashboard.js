let list_of_account_numbers = []
let map_of_balances = {};
let map_of_transactions = {};
document.addEventListener("DOMContentLoaded", function () {
            //Event Listeners
            document.getElementById('accountDropdown').addEventListener('change', account_drop_down_closed);
            const credit_card_payment = document.getElementById('credit_card_payment');
            const bank_statement = document.getElementById('bank_statement');
            const debitCardButton = document.getElementById('debit_card');

            
            
            // As soon as it loads we need to display the account activity
            fetch("/api/accountActivity", {
              method: "GET",
              headers: {
                  "Content-Type":"application/json",
                  "Authorization": "Bearer "+localStorage.getItem("auth_token")
              }
            })
            .then((response) => response.json())
            .then((data) => {
                var transactionDetails = data.data.results[0];
                // addRowsToTable(transactionDetails)

                var accountDetails = data.data.results[1];
                
                // Iterate over the array and access each element
                for (var i = 0; i < accountDetails.length; i++) {

                    var account_info = accountDetails[i];
                    list_of_account_numbers.push(account_info.Account_Number);
                    map_of_balances[account_info.Account_Number] = account_info.Account_Balance
                    // map_of_transactions[account_info.Account_Number] = map_of_transactions.get(account_info.Account_Number, [])
                    // list_of_account_balances.push(account_info.Account_Balance);
                    // list_of_account_types.push(account_info.Account_Type);
                }
                const accountNumber = document.getElementById('accountDropdown');
                // Clear existing options
                accountNumber.innerHTML = '';

                // Add options to the dropdown
                list_of_account_numbers.forEach(function (account) {
                    const option = document.createElement('option');
                    option.value = account;
                    option.textContent = account;
                    accountNumber.appendChild(option);
                });

                for (var i = 0; i < transactionDetails.length; i++) {

                  var transaction_info = transactionDetails[i];
                  // Check if the account number is already in the map
                  const accountNumFrom = transaction_info.Account_Num_From;
                  const accountNumTo = transaction_info.Account_Num_To;

                  if (!map_of_transactions[accountNumFrom]) {
                    map_of_transactions[accountNumFrom] = [];
                  }

                  if (!map_of_transactions[accountNumTo]) {
                    map_of_transactions[accountNumTo] = [];
                  }

                  // In either case, push the transaction_info to the array
                  map_of_transactions[accountNumFrom].push(transaction_info);
                  map_of_transactions[accountNumTo].push(transaction_info);
              }
              const current_act = document.getElementById('accountDropdown').value
              if (current_act){
                document.getElementById('account_balance').textContent = map_of_balances[current_act].toFixed(2);
                addRowsToTable(map_of_transactions[current_act].slice(0,10))
              }

            })
            .catch((err) => {
                console.log(err);
                window.alert("An error occurred during the API request.");
            })

          credit_card_payment.addEventListener('click', function () {
              window.location.href = "/card_payment.html";
          });
    
        bank_statement.addEventListener('click', function () {
          window.location.href = "/bank_statement.html";
      });

        debitCardButton.addEventListener('click', function () {
          window.location.href = "/debit_card.html"; 
      });
        
        // Function to add rows to the activity table
        function addRowsToTable(data) {
          const tableBody = document.getElementById('tableBody');
          tableBody.innerHTML = '';
          data.forEach(transaction => {
            const row = tableBody.insertRow();
            const cell0 = row.insertCell(0);
            const cell1 = row.insertCell(1);
            const cell2 = row.insertCell(2);
            const cell3 = row.insertCell(3);
            const cell4 = row.insertCell(4);
            const cell5 = row.insertCell(5);
            
            cell0.textContent = formatDateFromTimestamp(transaction.Timestamp_Start);
            cell1.textContent = transaction.Transaction_Type;
            cell2.textContent = transaction.Transaction_Amount.toFixed(2);
            cell3.textContent = transaction.Account_Num_From;
            cell4.textContent = transaction.Account_Num_To;
            
            var button = document.createElement("button");
            button.textContent = "Click here to revoke"; 
            button.classList.add("revokeText")

            button.onclick = function() {
                // Add your action here
                revokeCurrentTransaction(transaction);
            };

            // Append the button to the cell
            cell5.appendChild(button);

          });
        }

        function formatDateFromTimestamp(timestamp) {
          const dateObject = new Date(timestamp);
          
          // Extracting individual components of the date
          const year = dateObject.getFullYear();
          const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
          const day = dateObject.getDate().toString().padStart(2, '0');
          // Constructing the formatted date string
          const formattedDate = `${month}-${day}-${year}`;
        
          return formattedDate;
        }
    
  
    function account_drop_down_closed(){
      document.getElementById('account_balance').textContent = map_of_balances[document.getElementById('accountDropdown').value].toFixed(2);
      const current_act = document.getElementById('accountDropdown').value
      if (current_act){
        console.log(map_of_transactions[current_act].length)
        addRowsToTable(map_of_transactions[current_act].slice(0,10))
      }
    }

  });

    function revokeCurrentTransaction(transaction){

      const payload = {
        "customerId" : transaction.Customer_Id,
        "accountFrom" : transaction.Account_Num_From,
        "accountTo" : transaction.Account_Num_To,
        "transactionAmount" : transaction.Transaction_Amount,
        "transactionID":transaction.Transaction_Id
    }

      fetch("/api/trans-rev", {
        method: "DELETE",
        headers: {
            "Content-Type":"application/json",
        },
        body:JSON.stringify(payload)
      })
      .then((response) => {
        if(!response.ok){
          document.getElementsByClassName("error")[0].style.display="block";
          document.getElementsByClassName("error")[0].textContent=`${response.statusText}, please contact admin`;
        }
        else{
          alert("Transaction revoked successfully")
          window.location.reload();
        }
      }).catch((error)=>{
        alert(error);
      }

      )
  }
  
