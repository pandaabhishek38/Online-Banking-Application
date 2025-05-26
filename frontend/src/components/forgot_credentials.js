document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;

    try {
      const response = await fetch("/api/forgot-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      const resultEl = document.getElementById("result");
      if (response.ok) {
        resultEl.textContent = "Check your email for username.";
      } else {
        resultEl.textContent = data.error || "Something went wrong.";
      }
    } catch (err) {
      document.getElementById("result").textContent = "Error: " + err.message;
    }
  });
});
