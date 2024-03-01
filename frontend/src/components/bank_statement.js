let list_of_account_numbers = []
let map_of_balances = {};
let map_of_transactions = {};
document.addEventListener("DOMContentLoaded", function () {
    //Event Listeners
    document.getElementById('accountDropdown').addEventListener('change', account_drop_down_closed);
    document.getElementById('monthSelect').addEventListener('change', account_drop_down_closed);

    // As soon as it loads we need to display the account activity
    fetch("/api/bankStatement", {
      method: "GET",
      headers: {
          "Content-Type":"application/json",
          "Authorization": "Bearer "+localStorage.getItem("auth_token")
      }
    })
    .then((response) => response.json())
    .then((data) => {
        var transactionDetails = data.data.results[0];
        
        var accountDetails = data.data.results[1];
        
        // Iterate over the array and access each element
        for (var i = 0; i < accountDetails.length; i++) {

            var account_info = accountDetails[i];
            list_of_account_numbers.push(account_info.Account_Number);
            map_of_balances[account_info.Account_Number] = account_info.Account_Balance
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
      console.log(map_of_transactions)
      const current_act = document.getElementById('accountDropdown').value
      const monthSelected = document.getElementById('monthSelect').value
      if (current_act){
        document.getElementById('account_balance').textContent = map_of_balances[current_act].toFixed(2);
        const data = map_of_transactions[current_act].filter((transaction) => {
          console.log(`${formatMonthFromTimestamp(transaction.Timestamp_Start)} ${monthSelected}`)
          return formatMonthFromTimestamp(transaction.Timestamp_Start) === monthSelected
        })
        console.log(data)
        addRowsToTable(data)
      }

    })
    .catch((err) => {
        console.log(err);
        window.alert("An error occurred during the API request.");
    })

  });



// Function to add rows to the activity table
function addRowsToTable(data) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = ''
  data.forEach(transaction => {
    const row = tableBody.insertRow();
    const cell0 = row.insertCell(0);
    const cell1 = row.insertCell(1);
    const cell2 = row.insertCell(2);
    const cell3 = row.insertCell(3);
    const cell4 = row.insertCell(4);
    
    cell0.textContent = formatDateFromTimestamp(transaction.Timestamp_Start);
    cell1.textContent = transaction.Transaction_Type;
    cell2.textContent = transaction.Transaction_Amount.toFixed(2);
    cell3.textContent = transaction.Account_Num_From;
    cell4.textContent = transaction.Account_Num_To;

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
function formatMonthFromTimestamp(timestamp) {
  const dateObject = new Date(timestamp);

  // Extracting individual components of the date
  const month = (dateObject.getMonth() + 1).toString(); // Month is zero-indexed
  return month;
}


function account_drop_down_closed(){
  document.getElementById('account_balance').textContent = map_of_balances[document.getElementById('accountDropdown').value].toFixed(2);
  const current_act = document.getElementById('accountDropdown').value
  const monthSelected = document.getElementById('monthSelect').value
  if (current_act){
    document.getElementById('account_balance').textContent = map_of_balances[current_act].toFixed(2);
        console.log(map_of_transactions[current_act])
        const data = map_of_transactions[current_act].filter((transaction) => {
          console.log(`${formatMonthFromTimestamp(transaction.Timestamp_Start)} ${monthSelected}`)
          return formatMonthFromTimestamp(transaction.Timestamp_Start) === monthSelected
        })
    console.log(data)
    addRowsToTable(data)
}

}

