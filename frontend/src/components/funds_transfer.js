document.addEventListener('DOMContentLoaded', async function () {

    // Event Listeners
    document.getElementById('senderAccountNo').addEventListener('change', accountFromDropDownClosed);

    var list_of_account_numbers = [];

    try {
        // Fetch account numbers based on the current customer_id
        const response = await fetch('/api/getAccountNumbers', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth_token")
            }
        });
        console.log(`response: ${response}`);
        console.log(`response.ok: ${response.ok}`);
        console.log(`response.status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`data: ${data}`);
            list_of_account_numbers = data.data.results.map(item => item.account_number);
            console.log(`Data Fetched: ${data.data}`);
            console.log(`list_of_account_numbers: ${list_of_account_numbers}`);
            // Populate the dropdown with the fetched account numbers
            populateAccountNumbersDropdown();
        } else {
            console.log("Failed to fetch account numbers");
            window.alert("An error occurred during the API request.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during the API request.");
    }

    function populateAccountNumbersDropdown() {
        const dropdown = document.getElementById('senderAccountNo');
        // Clear existing options
        dropdown.innerHTML = "";

        // Populate options with fetched account numbers
        list_of_account_numbers.forEach(accountNumber => {
            const option = document.createElement("option");
            option.value = accountNumber;
            option.text = accountNumber;
            dropdown.appendChild(option);
        });
    }

    function accountFromDropDownClosed() {
        // Handle dropdown closed event if needed
    }
});

async function submit_payment() {
    const customer_id = await localStorage.getItem('auth_token');
    const fromAccount = document.getElementById('senderAccountNo').value;
    const fromRoutingNo = document.getElementById('senderRoutingNo').value;
    const toAccount = document.getElementById('receiverAccountNo').value;
    const toRoutingNo = document.getElementById('receiverRoutingNo').value;
    const txnAmount = document.getElementById('transferAmount').value;

    console.log(`Customer ID: ${customer_id}`);
    console.log(`Sender Account Number: ${fromAccount}`);
    console.log(`Sender Routing Number: ${fromRoutingNo}`);
    console.log(`Receiver Account Number: ${toAccount}`);
    console.log(`Receiver Routing Number: ${toRoutingNo}`);
    console.log(`Txn Amount: ${txnAmount}`);

    //Checking for invalid payment amounts
    var amount = 0;

    try {
        amount = parseFloat(txnAmount)
    }
    catch (err){
        window.alert("The transaction amount is invalid.");
        return;
    }
    console.log(`Txn Amount in float: ${amount}`);
    if(amount <= 0){
        window.alert("The transaction amount cannot be negative or zero.");
        return;
    }

    const payload = {
        "customer_id": customer_id,
        "sender_account": fromAccount,
        "sender_routing_no": fromRoutingNo,
        "receiver_account": toAccount,
        "receiver_routing_no": toRoutingNo,
        "amount": amount
    }

    fetch("/api/transfer-funds", {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "Authorization": "Bearer "+localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('--------------------------------------------------');
        console.log(data);
        console.log('--------------------------------------------------');
        if (data.error) {
            window.alert(`Error: ${data.error}`);
            window.location.href = "/funds_transfer.html";
        } else {
            //window.alert('Transaction completed successfully!!!');
            window.alert(data.message);
            window.location.href = "/funds_transfer.html";
        }
    })
    .catch((err) => {
        console.log(err);
        window.alert('Error in processing the transaction.');
        window.location.href = "/funds_transfer.html";
    })
}