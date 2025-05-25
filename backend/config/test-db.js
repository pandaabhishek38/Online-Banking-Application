console.log("Starting DB test...");
const db = require("./database");

db.query("SELECT NOW() AS time", (err, result) => {
  if (err) {
    console.error("Query failed:", err);
  } else {
    console.log("Database time:", result[0].time);
  }
  db.end();
});
