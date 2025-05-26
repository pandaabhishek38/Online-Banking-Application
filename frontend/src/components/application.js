document.addEventListener("DOMContentLoaded", function () {
  const handleFormSubmission = async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const address = document.getElementById("address").value;
    const cellPhone = document.getElementById("cell_phone").value;
    const email = document.getElementById("email").value;
    const dob = document.getElementById("dob").value;
    const accountType = document.getElementById("account_type").value;

    try {
      const formDataObject = {
        First_Name: firstName,
        Last_Name: lastName,
        Address: address,
        Cell_Phone: cellPhone,
        Email: email,
        DOB: dob,
        Account_Type: accountType,
      };

      const response = await fetch("/api/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });

      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Application Successful:", data);
        alert("Application submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("❌ API request failed:", errorData);
        alert("Application failed: " + (errorData.message || errorData.error));
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
      alert("An unexpected error occurred.");
    }
  };

  const formElement = document.getElementById("form");
  formElement.addEventListener("submit", handleFormSubmission);
});
