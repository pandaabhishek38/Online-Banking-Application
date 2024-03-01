async function getInterestRate() {
    function replaceWithInterest() {
        // Get the button element
        const button = document.getElementById('interestButton');
    
        // Calculate interest rate (you can replace this with your own logic)
        const interestRate = calculateInterestRate();
    
        // Create a new span element
        const span = document.createElement('span');
    
        // Set the text content of the span to the interest rate
        span.textContent = "10";
    
        // Replace the button with the new span
        button.parentNode.replaceChild(span, button);
    }
  }