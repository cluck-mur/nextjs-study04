/**
 * MySql リモート接続
 *
 * https://vercel.com/guides/deploying-next-and-mysql-with-vercel
 * からコピー
 */
const mysql = require("serverless-mysql");

const mysql_config = {
  config: {
    host:
      process.env.MYSQL_ENV_ENABLE != void 0
        ? process.env.MYSQL_HOST
        : "@mysql_host",
    database:
      process.env.MYSQL_ENV_ENABLE != void 0
        ? process.env.MYSQL_DATABASE
        : "@mysql_database",
    user:
      process.env.MYSQL_ENV_ENABLE != void 0
        ? process.env.MYSQL_USER
        : "@mysql_user",
    password:
      process.env.MYSQL_ENV_ENABLE != void 0
        ? process.env.MYSQL_PASSWORD
        : "@mysql_password",
    port: 3306,
    ssl: true,
  },
};

// const db = mysql({
//   config: {
//     host: process.env.MYSQL_ENV_ENABLE != void 0 ? process.env.MYSQL_HOST : "@mysql_host",
//     database: process.env.MYSQL_ENV_ENABLE != void 0 ? process.env.MYSQL_DATABASE : "@mysql_database",
//     user: process.env.MYSQL_ENV_ENABLE != void 0 ? process.env.MYSQL_USER : "@mysql_user",
//     password: process.env.MYSQL_ENV_ENABLE != void 0 ? process.env.MYSQL_PASSWORD : "@mysql_password",
//   },
// })
const db = mysql(mysql_config);

exports.query = async (query) => {
  try {
    // console.log(mysql_config);
    const results = await db.query(query);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
};
