window.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resetForm");
  const messageBox = document.getElementById("message");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      messageBox.textContent = "Passwords do not match.";
      return;
    }

    try {
      console.log("Sending reset payload:", { token, newPassword });

      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      console.log("Reset response:", data);

      if (res.ok) {
        messageBox.textContent =
          "Password reset successfully. You can now log in.";
      } else {
        messageBox.textContent = data.error || "Failed to reset password.";
      }
    } catch (err) {
      messageBox.textContent = "Error resetting password.";
    }
  });
});
