const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const { DB_NAME } = process.env;
    const db = await mysql.createConnection({
      host: "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    if (process.argv[2] === 'seed') {
      await db.execute(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      console.log(`${DB_NAME} dropped`);
    }
    const [header] = await db.execute(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);

    console.log(`${DB_NAME} ${!header.warningStatus ? 'created' : 'exists'}`);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
