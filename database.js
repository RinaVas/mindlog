import mysql from "mysql2/promise";

// Database Connection -----------------------------------

const dbConfig = {
  database: process.env.DB || "mindlog",
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PSWD || "",
  namedPlaceholders: true,
};

let database = null;

try {
  database = await mysql.createConnection(dbConfig);
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit();
}

export default database;
