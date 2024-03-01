document.addEventListener('DOMContentLoaded', () => {
    const customerTable = document.getElementById('customerTable');

    // Fetch customer data from the server with headers
    fetch('/api/getAllCustomers', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("auth_token")
        }
    })
        .then(response => response.json())
        .then(responseData => {
            const customerData = responseData.data; // Extract the customer data array

            if (customerData && customerData.length > 0) {
                // Iterate through the fetched data and create table rows
                customerData.forEach(customer => {
                    const row = document.createElement('tr');

                    const customerIdCell = document.createElement('td');
                    customerIdCell.textContent = customer.Customer_Id;
                    row.appendChild(customerIdCell);

                    const firstNameCell = document.createElement('td');
                    firstNameCell.textContent = customer.First_Name;
                    row.appendChild(firstNameCell);

                    const lastNameCell = document.createElement('td');
                    lastNameCell.textContent = customer.Last_Name;
                    row.appendChild(lastNameCell);

                    const addressCell = document.createElement('td');
                    addressCell.textContent = customer.Address || '';
                    row.appendChild(addressCell);

                    const cellPhoneCell = document.createElement('td');
                    cellPhoneCell.textContent = customer.Cell_Phone || '';
                    row.appendChild(cellPhoneCell);

                    const emailCell = document.createElement('td');
                    emailCell.textContent = customer.Email || '';
                    row.appendChild(emailCell);

                    const dobCell = document.createElement('td');
                    dobCell.textContent = customer.DOB || '';
                    row.appendChild(dobCell);

                    customerTable.querySelector('tbody').appendChild(row);
                });
            } else {
                // Handle case when no customer data is retrieved or the request fails
                const noDataMessage = document.createElement('tr');
                const noDataCell = document.createElement('td');
                noDataCell.setAttribute('colspan', '7');
                noDataCell.textContent = responseData.message || 'No customer data found.';
                noDataMessage.appendChild(noDataCell);
                customerTable.querySelector('tbody').appendChild(noDataMessage);
            }
        })
        .catch(error => {
            console.error('Error fetching customer data:', error);
            // Handle error scenario
        });



        const submitBtn = document.getElementById('submit-btn');
        const customerIdInput = document.getElementById('customer-id');
    
        submitBtn.addEventListener('click', async () => {
            const customerId = customerIdInput.value;
            console.log(customerId);
    
            try {
                const requestBody = {
                    "adminCustomerId": customerId // Assuming adminCustomerId is what the backend expects
                    // Add any other fields to the request body if needed
                };
                const response = await fetch('/api/admin_process_debit_card_request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem("auth_token")
                    },
                    body: JSON.stringify(requestBody)
                });
    
                const responseData = await response.json();
                // Process the response data as needed
                console.log(responseData);
                if (response.ok) {
                    // Handle successful response
                    window.alert("Customer's debit card request has been approved");
                } else {
                    // Handle other responses or errors
                    window.alert("Customer's debit card request has been denied");
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle errors
            }
        });
});
