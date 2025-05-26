document.addEventListener("DOMContentLoaded", function () {
  const handleLogin = async (event) => {
    event.preventDefault();

    const password = document.getElementById("user-password").value;
    const confirmPassword = document.getElementById(
      "user-password-confirm"
    ).value;

    if (password !== confirmPassword) {
      const error = document.getElementById("confirmError");
      error.textContent = "Passwords do not match";
    } else {
      try {
        const formData = new FormData(event.target);
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataObject),
        });
        console.log(response);
        if (response.ok) {
          const data = await response.json();
          console.log("Login Successful");

          localStorage.setItem("auth_token", data.token);

          window.alert("Success");

          if (data.user === "Customer") {
            window.location.href = "/customer_dashboard.html";
          } else if (data.user === "Teller") {
            //Change it to teller dashboard once ready
            window.location.href = "/bank_teller.html";
          } else if (data.user === "Admin") {
            //Change it to teller dashboard once ready
            window.location.href = "/admin_dashboard.html";
          }
        } else {
          const errorData = await response.json();
          console.error(
            "Login API request failed with status: " + response.status
          );
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
  };

  const formElement = document.getElementById("form");
  formElement.addEventListener("submit", handleLogin);

  document.getElementById("forgot-link").addEventListener("click", function () {
    const email = prompt("Enter your email to retrieve your username:");
    if (!email) return;

    fetch("/api/forgot-credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Your username has been sent to your email.");
        } else {
          alert(data.error || "Something went wrong.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred.");
      });
  });
});
