document.addEventListener('DOMContentLoaded', async function () {

    // Event Listeners
    const overdraftTableBody = document.getElementById('overdraftTableBody');

    try {
        const response = await fetch('/api/getODAccDetails', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth_token")
            }
        });

        if (response.ok) {
            const data = await response.json();
            //const listOfTellers = data.data.results.map(item => ({
            const listOfTellers = data.data.overdraftDetails.map(item => ({
                accNumber: item.account_number,
                curBalance: item.account_balance,
                overdraftEnabled: item.overdraft
            }));
            listOfTellers.forEach(account => {
            //data.tellers.forEach(teller => {
                const row = overdraftTableBody.insertRow();
                row.insertCell().textContent = account.accNumber;
                row.insertCell().textContent = account.curBalance;
                row.insertCell().textContent = account.overdraftEnabled ? 'Yes' : 'No';

                //const actionCell = row.insertCell();
                const toggleButton = document.createElement('button');
                toggleButton.textContent = account.overdraftEnabled ? 'Disable' : 'Enable';
                toggleButton.onclick = function() {
                    toggleOverdraft(row, account.accNumber, account.overdraftEnabled);
                }
                //actionCell.appendChild(toggleButton);
                row.insertCell().appendChild(toggleButton);
            });
        } else {
            console.log("Failed to fetch Account Overdraft Details");
            //console.error('Error fetching tellers:', error);
            window.alert("An error occurred during fetching Account Overdraft Details.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during fetching Account Overdraft Details.");
    }

});

async function toggleOverdraft(row, accountNumber, currentStatus) {
    const customer_id = await localStorage.getItem('auth_token');
    const newStatus = !currentStatus;
    const overdraftTable = document.getElementById('overdraftTable');

    try {
        const payload = {
            "account_number": accountNumber,
            "overdraft": newStatus
        }

        const response = await fetch("/api/toggleOverdraft", {
            method: "PUT",
            headers: {
                "Content-Type":"application/json",
                "Authorization": "Bearer "+localStorage.getItem("auth_token")
            },
            body: JSON.stringify(payload)
        });
        console.log(`response.ok: ${response.ok}`);
        console.log(`response.status: ${response.status}`);
        console.log(`response: ${response}`);
        if (response.ok) {
            const data = await response.json();
            window.alert(`Updated Overdraft Status successfully!`);
            console.log(`bleh`);
            window.location.href = "/overdraft.html";
        } else {
            console.log("Failed to update Overdraft Status");
            console.error('Failed to update Overdraft Status:', error);
            window.alert(`An error occurred during updating Overdraft Status. Status: ${response.status}`);
            window.location.href = "/overdraft.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert(`An error occurred while updating Overdraft Status. ${error}`);
    }
}