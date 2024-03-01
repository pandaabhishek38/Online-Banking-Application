var map_of_from_balances = {};
var map_of_to_balances = {};

document.addEventListener('DOMContentLoaded', async function () {

    //Event Listeners
    document.getElementById('account_from').addEventListener('change', account_from_drop_down_closed);
    document.getElementById('account_to').addEventListener('change', account_to_drop_down_closed);

    var list_of_account_numbers = [];
    var list_of_account_balances = [];
    var list_of_account_types = [];

    // const auth_token = await localStorage.getItem('auth_token');

    try{

        fetch("/api/accountActivity", {
            method: "GET",
            headers: {
                "Content-Type":"application/json",
                "Authorization": "Bearer "+localStorage.getItem("auth_token")
            }
        })
        .then((response) => response.json())
        .then((data) => {

            var results_lists = data.data.results[1];

            // Iterate over the array and access each element
            for (var i = 0; i < results_lists.length; i++) {

                var account_info = results_lists[i];
                list_of_account_numbers.push(account_info.Account_Number);
                list_of_account_balances.push(account_info.Account_Balance);
                list_of_account_types.push(account_info.Account_Type);
            }

            var list_of_from_account_numbers = [];
            var list_of_to_account_numbers = [];
            
            for (var i = 0; i < list_of_account_types.length; i++){

                if(list_of_account_types[i] === 0){
                    list_of_from_account_numbers.push(list_of_account_numbers[i]);
                    map_of_from_balances[list_of_account_numbers[i]] = list_of_account_balances[i];
                }
                else if(list_of_account_types[i] === 1){
                    list_of_to_account_numbers.push(list_of_account_numbers[i]);
                    map_of_to_balances[list_of_account_numbers[i]] = list_of_account_balances[i];
                }
            }

            const accountFromDropdown = document.getElementById('account_from');

            // Clear existing options
            accountFromDropdown.innerHTML = '';

            // Add options to the dropdown
            list_of_from_account_numbers.forEach(function (account) {
                const option = document.createElement('option');
                option.value = account;
                option.textContent = account;
                accountFromDropdown.appendChild(option);
            });

            const accountToDropdown = document.getElementById('account_to');

            // Clear existing options
            accountToDropdown.innerHTML = '';

            // Add options to the dropdown
            list_of_to_account_numbers.forEach(function (account) {
                const option = document.createElement('option');
                option.value = account;
                option.textContent = account;
                accountToDropdown.appendChild(option);
            });

            document.getElementById('account_balance_from').textContent = map_of_from_balances[document.getElementById('account_from').value].toFixed(2);
            document.getElementById('account_balance_to').textContent = map_of_to_balances[document.getElementById('account_to').value].toFixed(2);
            
        })
        .catch((err) => {
            console.log(err);
            window.alert("An error occurred during the API request.");
        })
    } 
    catch (error) {
        console.error("Error:", error);
        alert("An error occurred during the API request.");
    }

});

function account_from_drop_down_closed(){
    document.getElementById('account_balance_from').textContent = map_of_from_balances[document.getElementById('account_from').value].toFixed(2);
}

function account_to_drop_down_closed(){
    document.getElementById('account_balance_to').textContent = map_of_to_balances[document.getElementById('account_to').value].toFixed(2);
}

async function submit_payment() {

    // Get selected values from dropdowns
    var customer_id;
    var account_from;
    var account_to;
    var transaction_amount;
    
    try{
        account_from = document.getElementById('account_from').value;
        account_to = document.getElementById('account_to').value;
        transaction_amount = document.getElementById('payment_amount').value;
    }
    catch(err){
        window.alert("The account selection is invalid for a transfer to be processed.");
        return;
    }

    console.log(account_from);
    console.log(account_to);
    console.log(transaction_amount);

    //Checking for invalid payment amounts
    var amount = 0;

    try {
        amount = parseFloat(transaction_amount)
    }
    catch (err){
        window.alert("The transaction amount is invalid.");
        return;
    }

    if(amount > parseFloat(document.getElementById('account_balance_from').textContent)){
        window.alert("The sending account doesn't have sufficient funds.");
        return;
    }

    if(amount <= 0){
        window.alert("The transaction can't be negative or zero.");
        return;
    }

    const payload = {
        "account_num_from" : account_from,
        "account_num_to" : account_to,
        "transaction_amount" : transaction_amount
    }

    fetch("/api/card_payment", {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "Authorization": "Bearer "+localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        window.alert('Money transferred successfully!');
        window.location.href = "/card_payment.html";
    })
    .catch((err) => {
        console.log(err);
        window.alert('Error in processing the transaction.');
    })
}
