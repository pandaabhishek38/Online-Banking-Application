document.addEventListener("DOMContentLoaded", function () {
    const handleFormSubmission = async (event) => {
      event.preventDefault();

    const firstName = document.getElementById("first name").value;
    const lastName=document.getElementById("last name").value;
    const address = document.getElementById("address").value;
    const cellPhone=document.getElementById("cell phone").value;
    const email = document.getElementById("email").value;
    const dob=document.getElementById("dob").value;
    //const accountType=document.getElementById("account types").value;


    try{
        const formData = new FormData(event.target);
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
        const response = await fetch("/api/application", {
            method: "POST",
            headers: {
              "Content-Type":"application/json",
            },
            body:JSON.stringify(formDataObject)
          })
          console.log(response);
          if (response.ok) {
            const data = await response.json();
            console.log("Login Successful");
        } else {
            const errorData = await response.json();
            console.error("Login API request failed with status: " + response.status);
            if (errorData && errorData.message) {
              window.alert("Error: " + errorData.message);
            } else {
              window.alert("An error occurred during the API request.");
            }
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred during the API request.");
        }
    }

const formElement=document.getElementById("form");
formElement.addEventListener("submit",handleLogin);
      
});