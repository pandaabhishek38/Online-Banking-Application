const http = require("http");
const fs = require("fs");
const handleAPIRequest = require("./routes/api");
const { url } = require("inspector");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 8080;

const fileExtensions = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
};

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const filePath = __dirname + "/../frontend/public/index.html";
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
  // Handling requests for the CSS file
  else if (req.url === "/main.css") {
    const cssPath = __dirname + "/../frontend/src/styles/main.css";

    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      }
    });
  }
  // Handling requests for the locate branch functionality
  else if (req.url === "/locate_branch.html") {
    const cssPath = __dirname + "/../frontend/public/locate_branch.html";

    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.url.startsWith("/api")) {
    handleAPIRequest(req, res);
  } else {
    const urlArray = req.url.split("/");
    const fileName = urlArray[urlArray.length - 1].split("?")[0];
    const fileExtension = path.extname(fileName);
    const filePath = getFilePath(fileName);

    if (filePath) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        } else {
          const contentType = fileExtensions[fileExtension] || "text/plain";
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  }
});

const getFilePath = (fileName) => {
  const filePaths = {
    // Add file paths here
    "main.css": "../frontend/src/styles/main.css",
    "application.html": "../frontend/public/application.html",
    "sign-up.html": "../frontend/public/sign-up.html",
    "login.html": "../frontend/public/login.html",
    "locate_branch.html": "../frontend/public/locate_branch.html",
    "locate_branch.css": "../frontend/src/styles/locate_branch.css",
    "sign-up.js": "../frontend/src/components/sign-up.js",
    "login.js": "../frontend/src/components/login.js",
    "locate_branch.js": "../frontend/src/components/locate_branch.js",
    "card_payment.js": "../frontend/src/components/card_payment.js",
    "card_payment.js": "../frontend/src/components/card_payment.js",
    "customer_dashboard.js": "../frontend/src/components/customer_dashboard.js",
    "sign-up.css": "../frontend/src/styles/sign-up.css",
    "business_policies.html": "../frontend/public/business_policies.html",
    "business_policies.js": "../frontend/src/components/business_policies.js",
    "business_policies.css": "../frontend/src/styles/business_policies.css",
    "policy_rates.html": "../frontend/public/policy_rates.html",
    "policy_rates.js": "../frontend/src/components/policy_rates.js",
    "policy_rates.css": "../frontend/src/styles/policy_rates.css",
    "admin_business_policies.html":
      "../frontend/public/admin_business_policies.html",
    "admin_business_policies.js":
      "../frontend/src/components/admin_business_policies.js",
    "admin_business_policies.css":
      "../frontend/src/styles/admin_business_policies.css",
    "business_policy.html": "../frontend/public/business_policy.html",
    "card_payment.html": "../frontend/public/card_payment.html",
    "card_payment.css": "../frontend/src/styles/card_payment.css",
    "customer_dashboard.html": "../frontend/public/customer_dashboard.html",
    "customer_dashboard.css": "../frontend/src/styles/customer_dashboard.css",
    "customer_dashboard.js": "../frontend/src/components/customer_dashboard.js",
    "admin_dashboard.html": "../frontend/public/admin_dashboard.html",
    "admin_dashboard.css": "../frontend/src/styles/admin_dashboard.css",
    "admin_dashboard.js": "../frontend/src/components/admin_dashboard.js",
    "bank_statement.html": "../frontend/public/bank_statement.html",
    "bank_statement.css": "../frontend/src/styles/bank_statement.css",
    "bank_statement.js": "../frontend/src/components/bank_statement.js",
    "products.html": "../frontend/public/products.html",
    "products.css": "../frontend/src/styles/products.css",
    "products.js": "../frontend/src/components/products.js",
    "report_debit_card.html": "../frontend/public/report_debit_card.html",
    "report_debit_card.css": "../frontend/src/styles/report_debit_card.css",
    "report_debit_card.js": "../frontend/src/components/report_debit_card.js",
    "modify_products.html": "../frontend/public/modify_products.html",
    "modify_products.css": "../frontend/src/styles/modify_products.css",
    "modify_products.js": "../frontend/src/components/modify_products.js",
    "bank_teller.html": "../frontend/public/bank_teller.html",
    "bank_teller.css": "../frontend/src/styles/bank_teller.css",
    "bank_teller.js": "../frontend/src/components/bank_teller.js",
    "index.css": "../frontend/src/styles/index.css",
    "schedule_meeting.html": "../frontend/public/schedule_meeting.html",
    "schedule_meeting.js": "../frontend/src/components/schedule_meeting.js",
    "schedule_meeting.css": "../frontend/src/styles/schedule_meeting.css",
    "automated_interest.html": "../frontend/public/automated_interest.html",
    "automated_interest.js": "../frontend/src/components/automated_interest.js",
    "funds_transfer.html": "../frontend/public/funds_transfer.html",
    "funds_transfer.css": "../frontend/src/styles/funds_transfer.css",
    "funds_transfer.js": "../frontend/src/components/funds_transfer.js",
    "create_teller.html": "../frontend/public/create_teller.html",
    "create_teller.css": "../frontend/src/styles/create_teller.css",
    "create_teller.js": "../frontend/src/components/create_teller.js",
    "overdraft.html": "../frontend/public/overdraft.html",
    "overdraft.css": "../frontend/src/styles/overdraft.css",
    "overdraft.js": "../frontend/src/components/overdraft.js",
    "debit_card.html": "../frontend/public/debit_card.html",
    "debit_card.css": "../frontend/src/styles/debit_card.css",
    "debit_card_request.js": "../frontend/src/components/debit_card_request.js",
    "my_debit_card.html": "../frontend/public/my_debit_card.html",
    "my_debit_card.css": "../frontend/src/styles/my_debit_card.css",
    "card_details.js": "../frontend/src/components/card_details.js",
    "customer_list.html": "../frontend/public/customer_list.html",
    "customer_list.css": "../frontend/src/styles/customer_list.css",
    "customer_list.js": "../frontend/src/components/customer_list.js",
    "application.js": "../frontend/src/components/application.js",
    "forgot_credentials.html": "../frontend/public/forgot_credentials.html",
    "forgot_credentials.js": "../frontend/src/components/forgot_credentials.js",
    "reset-password.html": "../frontend/public/reset-password.html",
    "reset-password.js": "../frontend/src/components/reset-password.js",
  };
  return filePaths[fileName] ? path.join(__dirname, filePaths[fileName]) : null;
};

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
