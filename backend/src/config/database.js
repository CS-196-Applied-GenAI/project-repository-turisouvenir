/**
 * MySQL connection pool. Uses mysql2/promise for async/await.
 * Pool is created lazily so tests can mock or replace it.
 */
const mysql = require('mysql2/promise');
const config = require('./index');

let pool = null;

/**
 * Get the shared connection pool. Creates it on first call.
 * @returns {Promise<import('mysql2/promise').Pool>}
 */
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Execute a query using the pool. Use for one-off queries.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<[import('mysql2/promise').RowDataPacket[], import('mysql2/promise').FieldPacket[]]>}
 */
async function query(sql, params = []) {
  const p = await getPool();
  return p.execute(sql, params);
}

/**
 * Close the pool (e.g. for graceful shutdown or tests).
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  query,
  closePool,
};
