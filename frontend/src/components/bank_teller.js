document.addEventListener("DOMContentLoaded",function(){
    const handleLogin = async(event)=>{
    event.preventDefault();

    try{
      const formData = new FormData(event.target);
      const formDataObject = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
        const response = await fetch("/api/bankTeller", {
            method: "POST",
            headers: {
              "Content-Type":"application/json",
              "Authorization": "Bearer "+localStorage.getItem("auth_token")
            },
            body:JSON.stringify(formDataObject)
          })
          console.log(response);
          if (response.ok) {
            const data = await response.json();
            console.log("Login Successful");

            localStorage.setItem("auth_token", data.token);

            window.alert("Success");

            if(data.user === "Customer"){
              window.location.href = '/customer_dashboard.html';
            }
            else if(data.user === "Teller"){
              //Change it to teller dashboard once ready
              window.location.href = '/customer_dashboard.html';
            }
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