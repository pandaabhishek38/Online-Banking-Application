document.addEventListener("DOMContentLoaded", function () {
  const handleFormSubmission = async (event) => {
    event.preventDefault();

    const recaptchaResponse = await grecaptcha.execute('6Lf-Su4oAAAAAL_SrlFA1cihwExxhosUveLAfIuZ', { action: 'submit' });
    // Get the password and confirm password input values
    const password = document.getElementById("user-password").value;
    const confirmPassword = document.getElementById("user-password-confirm").value;
    const errorDivConfirm = document.getElementById("confirmError");
    errorDivConfirm.innerHTML = "";
    // Compare the password and confirm password values
    if (password !== confirmPassword) {
      // Passwords do not match, prevent form submission and show error message
      const errorDivConfirm = document.getElementById("confirmError");
      errorDivConfirm.innerHTML = "Password and Confirm Password must be the same.";
    } else {
      try {
        // If passwords match, the form will be submitted as usual
        // Send Request to the server to create a new account
        const formData = new FormData(event.target);
        // Convert FormData object to a plain JavaScript object
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
        formDataObject.recaptchaResponse = recaptchaResponse; 
        console.log(`Data SENT to backend: ${JSON.stringify(formDataObject)}`)
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+localStorage.getItem("auth_token")
          },
          body: JSON.stringify(formDataObject),
        });
        if (!response.ok) {
          // Handle non-successful responses (e.g., 404 Not Found, 500 Internal Server Error)
          window.alert(`HTTP error! Status: ${response.status}`)
        }else{
          // console.log(response)
          const result = await response.json();
          console.log(`Result of post: ${JSON.stringify(result, null, 2)}`);
          const errorDivConfirm = document.getElementById("confirmError");
          errorDivConfirm.textContent = "";
          window.alert(`User created successfully!`);
          // // Successful response, navigate to a different link
          // window.location.href = "/success-page.html";

        }

        
        // Handle the response data as needed
      } catch (error) {
        // Handle fetch errors
        console.error("Fetch error:", error);
      }
    }

  }
  // Create form element
  const formElement = document.getElementById("form");
  console.log(formElement)
  // Add event listener for form submission
  formElement.addEventListener("submit", handleFormSubmission);

});
