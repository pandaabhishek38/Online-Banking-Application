document.addEventListener('DOMContentLoaded', async function () {

    // Event Listeners
    const tellerTableBody = document.getElementById('tellerTableBody');

    try {
        // Fetch account numbers based on the current customer_id
        const response = await fetch('/api/getTellers', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth_token")
            }
        });

        if (response.ok) {
            const data = await response.json();
            //const listOfTellers = data.data.results.map(item => ({
            const listOfTellers = data.data.teller.map(item => ({
                employeeId: item.employee_id,
                firstName: item.first_name,
                lastName: item.last_name
            }));
            listOfTellers.forEach(teller => {
            //data.tellers.forEach(teller => {
                const row = tellerTableBody.insertRow();
                row.insertCell().textContent = teller.employeeId;
                row.insertCell().textContent = teller.firstName;
                row.insertCell().textContent = teller.lastName;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = function() {
                    const shouldDelete = window.confirm('Are you sure you want to delete this teller?');
                    if (shouldDelete) {
                        deleteTeller(row, teller.employeeId);
                    }
                };
                row.insertCell().appendChild(deleteButton);
            });
        } else {
            const errorData = await response.json();
            if (errorData.statusCode === 403) {
                console.log("Current user does not have admin privileges to view list of tellers.")
                console.error('Cannot display Tellers:', errorData.error);
                window.alert(`An error occurred during fetching tellers. ${errorData.error}`);
            } else {
                console.log("Failed to fetch Tellers");
                window.alert(`An error occurred during fetching Tellers. ${errorData.error}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during fetching Tellers.");
    }

});

async function deleteTeller(row, employeeID) {
    const customer_id = await localStorage.getItem('auth_token');
    const table = document.getElementById('tellerTable');

    const payload = {
        "employee_id": employeeID
    }

    fetch("/api/delete-teller", {
        method: "DELETE",
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
            window.location.href = "/create_teller.html";
        } else {
            window.alert('Teller Deleted successfully!!!');
            window.location.href = "/create_teller.html";
        }
    })
    .catch((err) => {
        console.log(err);
        window.alert('Error in deleting the Teller.');
        window.location.href = "/create_teller.html";
    })
}

async function addTeller() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confPassword").value;
    const userName = document.getElementById("userName").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    
    if(password!==confirmPassword){
        let errorContainer = document.getElementById("formSubmitError");
        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.id = "formSubmitError";
            errorContainer.style.color = "red";
            const formElement = document.getElementById("createTellerForm");
            formElement.parentNode.insertBefore(errorContainer, formElement);
        }
        errorContainer.textContent = "Passwords do not match";
        return;
    }

    try {
        const payload = {
            "username": userName,
            "password": password,
            "first_name": firstName,
            "last_name": lastName

        }
        // Fetch account numbers based on the current customer_id
        const response = await fetch('/api/addTeller', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth_token")
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            window.alert(`Teller created successfully!`);
            console.log(`bleh`);
            window.location.href = "/create_teller.html";
            //console.log(`Result of post: ${JSON.stringify(result, null, 2)}`);
        } else {
            const errorData = await response.json();
            console.log("Failed to create Teller");
            console.error('Failed to create Teller:', errorData.error);
            window.alert(`An error occurred during creating teller. ${errorData.error}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert(`An error occurred during creating Teller. ${error}`);
    }
}