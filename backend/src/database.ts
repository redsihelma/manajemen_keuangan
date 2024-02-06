import mysql from "mysql";

const db = mysql.createConnection({
  host: "172.0.0.1",
  user: "root",
  password: "Reza172172",
  database: "manajemen_keuangan",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

export default db;
