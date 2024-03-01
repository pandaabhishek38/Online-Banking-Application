document.addEventListener("DOMContentLoaded", function () {

    const back = document.getElementById('Back');

    back.addEventListener('click', function () {
        window.location.href = "/debit_card.html"; 
    });

    // Function to fetch debit card details from the backend
    async function fetchDebitCardDetails() {
      try {
        const response = await fetch("/api/get_debit_card_details", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("auth_token")
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          //window.alert("Data retrieved");
          //window.alert(data[0].Card_Number); //accountResults[0].Account_Number

          displayCardDetails(data); // Function to display card details on the webpage
        } else {
          console.error("Failed to fetch debit card details");
          // Handle error or display a message for failed fetching
        }
      } catch (error) {
        console.error("Error fetching debit card details:", error);
        // Handle network errors or failed API calls
      }
    }
  /*
    // Function to display card details on the webpage
    function displayCardDetails(cardData) {
      const cardContainer = document.getElementById("card-details-container");
  
      // Clear previous content if any
      cardContainer.innerHTML = "";
  
      // Create elements to display card details
      const cardDetailsDiv = document.createElement("div");
      cardDetailsDiv.classList.add("card-details-container");
  
      const cardInfoDiv = document.createElement("div");
      cardInfoDiv.classList.add("card-details");
  
      // Display card details received from the backend
      cardInfoDiv.innerHTML = `
        <div class="card-info">
          <p><strong>Card Number:</strong> ${cardData[0].Card_Number}</p>
          <p><strong>Expiration Date:</strong> ${cardData[0].Expiration_Date}</p>
          <p><strong>CVV:</strong> ${cardData.cvv}</p>
          <!-- Add more card details as needed -->
        </div>
      `;
  
      cardDetailsDiv.appendChild(cardInfoDiv);
      cardContainer.appendChild(cardDetailsDiv);
    }*/


    function displayCardDetails(cardData) {
        const activeCardDetails = cardData.data[0];

        const cardNumberElement = document.getElementById("card-number");
        const expirationDateElement = document.getElementById("expiration-date");
        const cvvElement = document.getElementById("cvv");

        const cardNumber = activeCardDetails.Card_Number;
        const expirationDate = activeCardDetails.Expiration_Date;
        const cvv = activeCardDetails.CVV;

        const dateObject = new Date(expirationDate);

        // Get the date in YYYY-MM-DD format
        const formattedDate = dateObject.toISOString().split('T')[0];

        //console.log(activeCardDetails.CVV);

        const cleanedNumber = cardNumber.replace(/\D/g, '');
        const formattedNumber = cleanedNumber.replace(/\d{4}(?=.)/g, '$&-');

      
        if (activeCardDetails) {
         // const firstCard = activeCardDetails[0]; // Assuming the API returns an array of card details
      
          if (activeCardDetails.hasOwnProperty('Card_Number') && activeCardDetails.hasOwnProperty('Expiration_Date')) {
            cardNumberElement.textContent = formattedNumber; // Update card number
            expirationDateElement.textContent = formattedDate;
            cvvElement.textContent = activeCardDetails.CVV; // Update expiration date
          } else {
            console.error("Card details structure is incorrect");
            // Handle case where expected properties are missing
          }
        } else {
          console.error("No card data received or empty array");
          // Handle case where no card data is received or the array is empty
        }

       /* if (activeCardDetails) {
            if(activeCardDetails.length > 0){
                const firstCard = activeCardDetails[0];

                if (firstCard.hasOwnProperty('Card_Number') && firstCard.hasOwnProperty('Expiration_Date')) {
                    cardNumberElement.textContent = firstCard.Card_Number; // Update card number
                    expirationDateElement.textContent = firstCard.Expiration_Date; // Update expiration date
                  } else {
                    console.error("Card details structure is incorrect");
                    // Handle case where expected properties are missing
                  }
            } else{
                console.error("Card length is 0");
                console.log(activeCardDetails);
            }
        }else {
            console.error("No card data received or empty array");
            // Handle case where no card data is received or the array is empty
          }*/


      }
    
  
    // Call the function to fetch debit card details when the page loads
    fetchDebitCardDetails();
  });
  