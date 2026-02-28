const pool = require("../config/db");

/**
 * Create a new entry
 * @param {string} id - UUID string
 * @param {string} title - Entry title
 * @param {string} status - initial status
 * @param {number} progress - initial progress
 */
exports.createEntry = async (id, title, status = "CREATED", progress = 0) => {
  const query = `
    INSERT INTO entries(id, title, status, progress, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `;
  // Pass individual values, not an object
  await pool.query(query, [id, title, status, progress]);
};

/**
 * Get all entries
 */
exports.getAllEntries = async () => {
  const result = await pool.query(`
    SELECT * FROM entries
    ORDER BY created_at DESC
  `);
  return result.rows;
};

/**
 * Get a single entry by ID
 */
exports.getEntryById = async (id) => {
  const result = await pool.query(`
    SELECT * FROM entries
    WHERE id = $1
  `, [id]);
  return result.rows[0];
};

/**
 * Update entry status and progress (used by worker)
 */
exports.updateEntry = async (id, status, progress) => {
  const query = `
    UPDATE entries
    SET status = $1,
        progress = $2,
        updated_at = NOW()
    WHERE id = $3
  `;
  await pool.query(query, [status, progress, id]);
};