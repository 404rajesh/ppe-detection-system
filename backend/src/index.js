const app = require("./app");
const { pool } = require("./config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const initializeAdmin = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [process.env.ADMIN_USERNAME]
    );

    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );
      await pool.query(
        `INSERT INTO users (username, password_hash, role) 
         VALUES ($1, $2, $3)`,
        [process.env.ADMIN_USERNAME, hashedPassword, "admin"]
      );
      console.log("Admin user created successfully");
    } else {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );
      await pool.query(
        `UPDATE users SET password_hash = $1 WHERE username = $2`,
        [hashedPassword, process.env.ADMIN_USERNAME]
      );
      console.log("Admin user updated successfully");
    }
  } catch (error) {
    console.error("Admin initialization error:", error);
  }
};

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection verified");

    await initializeAdmin();

    app.listen(PORT, () => {
      console.log("================================");
      console.log(`PPE Detection Backend running`);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log("================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();