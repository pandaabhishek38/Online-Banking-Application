document.addEventListener('DOMContentLoaded', function () {
    fetchDebitCardDetails();
});

function fetchDebitCardDetails() {
    // Make an API call to your backend
    
    fetch('http://localhost:8080/api/fetch-debit-card-details', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer "+localStorage.getItem("auth_token")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.length > 0) {
            const cardDetails = data.data[0]; // Access the first element of the data array

            if (cardDetails.Card_Status == 0) {
                string_status = 'Inactive'
            } else if (cardDetails.Card_Status == 1) {
                string_status = 'Active'
            } else {
                string_status = 'Permanently Inactive'
            }

            const detailsContainer = document.getElementById('card-details');
            detailsContainer.innerHTML = `
                <p>Card Number: ${cardDetails.Card_Number}</p>
                <p>Card Status: ${string_status}</p>
            `;

            if (cardDetails.Card_Status === 1) {
                document.getElementById('report-card-btn').style.display = 'block';
                document.getElementById('report-card-btn').onclick = () => reportCard(cardDetails.Card_id);
            } else if (cardDetails.Card_Status === 0) {
                document.getElementById('reactivate-card-btn').style.display = 'block';
                document.getElementById('reactivate-card-btn').onclick = () => reactivateCard(cardDetails.Card_id);

                document.getElementById('permanent-deactivation-btn').style.display = 'block';
                document.getElementById('permanent-deactivation-btn').onclick = () => deleteCard(cardDetails.Card_id);
            }

        } else {
            console.error('Error fetching card details:', data.error || 'No card details found');
        }
    })
    .catch(error => console.error('Error:', error));
}

function reportCard(cardId) {
    fetch(`http://localhost:8080/api/report-card?cardId=${cardId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // "Authorization": "Bearer " + localStorage.getItem("auth_token")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showReportCardPopup(data.message, cardId);
        }
        
    });
}

function showReportCardPopup(message, cardId) {
    let userConfirmation = window.confirm(message + "\n\nDo you want to confirm reporting this card?");
    if (userConfirmation) {
        confirmReportCard(cardId);
    }
}

function confirmReportCard(cardId) {
    fetch('http://localhost:8080/api/confirmReportCard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // "Authorization": "Bearer " + localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ cardId: cardId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            
            alert('Card reported successfully.');
            fetchDebitCardDetails(); // Refresh the card details
        } else {
            // Handle failure
            alert('Failed to report the card: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error reporting the card.');
    });
}

function reactivateCard(cardId) {
    let userConfirmation = window.confirm("Are you sure you want to reactivate this card?");
    if (!userConfirmation) {
        return;
    }
    console.log("Reactivate Card ID:", cardId);
    fetch('http://localhost:8080/api/reactivateCard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // "Authorization": "Bearer " + localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ cardId: cardId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Card reactivated successfully.');
            fetchDebitCardDetails(); // Refresh the card details
        } else {
            alert('Failed to reactivate the card: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error reactivating the card.');
    });
}

function deleteCard(cardId) {
    let userConfirmation = window.confirm("Are you sure you want to permanently deactivate this card?");
    if (!userConfirmation) {
        return;
    }

    fetch('http://localhost:8080/api/deleteCard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // "Authorization": "Bearer " + localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ cardId: cardId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Card permanently deactivated.');
            fetchDebitCardDetails(); // Refresh the card details
        } else {
            alert('Failed to permanently deactivate the card: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deactivating the card.');
    });
}