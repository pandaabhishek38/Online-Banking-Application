document.addEventListener("DOMContentLoaded", function () {

    const myDebitCardButton = document.getElementById('my_debit_card');
    

    myDebitCardButton.addEventListener('click', function () {
        window.location.href = "/my_debit_card.html"; 
    });

    // Function to handle the request for a new debit card
    async function requestNewDebitCard() {
        try {
            // Make an API call to request a new debit card
            const response = await fetch("/api/process_debit_card_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("auth_token")
                }
            });

            console.log("Response Status Code:", response.status);

            // Get the response body as JSON
            const responseBody = await response.json();
    
            // Log the parsed response body
            console.log("Response Body:", responseBody);

            // Check if the request was successful (status code 200)
            if (response.ok) {
                console.log("Your debit card request has been approved");
                // Display the success message in the console
                window.alert("Your debit card has been approved");
            } else {
                console.log("Your request has been denied");
                // Display an alert indicating denial of the request
                window.alert("Your request has been denied");
            }
        } catch (error) {
            console.error("Error requesting a new debit card:", error);
            // Handle errors, such as network issues or failed API calls
            window.alert("An error occurred while processing your request");
        }
    }

    // Event listener for the "Request New Debit Card" button click
    const requestButton = document.getElementById("request_new_debit_card");
    if (requestButton) {
        requestButton.addEventListener("click", async function (event) {
            event.preventDefault(); // Prevent the default form submission if any
            await requestNewDebitCard(); // Call the function to request a new debit card
        });
    }
});
