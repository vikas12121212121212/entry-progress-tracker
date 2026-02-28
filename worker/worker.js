require("dotenv").config();
const { Worker } = require("bullmq");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
};

// Helper: sleep for simulating stages
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Concurrency-safe update for an entry.
 * Only updates if the new progress is higher than current progress.
 */
async function updateEntry(id, status, progress) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the row to prevent concurrent updates
    const res = await client.query(
      "SELECT progress FROM entries WHERE id=$1 FOR UPDATE",
      [id]
    );

    if (!res.rows.length) {
      console.log(`Entry not found: ${id}`);
      await client.query("ROLLBACK");
      return;
    }

    const currentProgress = res.rows[0].progress;

    // Only update if new progress is greater
    if (progress > currentProgress) {
      await client.query(
        `UPDATE entries
         SET status=$1, progress=$2, updated_at=NOW()
         WHERE id=$3`,
        [status, progress, id]
      );
      console.log(`Entry ${id} → ${status} (${progress}%)`);
    } else {
      console.log(`Skipped updating ${id}: current progress ${currentProgress}% >= ${progress}%`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Error updating entry ${id}:`, err);
    throw err; // Let BullMQ retry if needed
  } finally {
    client.release();
  }
}

// Worker setup
new Worker(
  "entryQueue",
  async (job) => {
    const { id } = job.data;

    // Fetch entry title (optional)
    const result = await pool.query("SELECT title FROM entries WHERE id=$1", [id]);
    if (!result.rows.length) return console.log(`Entry not found: ${id}`);
    const { title } = result.rows[0];
    console.log("Processing entry:", id, title);

    // Simulate progressive stages with 5-second delay
    await updateEntry(id, "PROCESSING", 20);
    await sleep(5000);

    await updateEntry(id, "STAGE_1_COMPLETE", 60);
    await sleep(5000);

    await updateEntry(id, "STAGE_2_COMPLETE", 80);
    await sleep(5000);

    await updateEntry(id, "COMPLETED", 100);

    console.log(`Job finished: ${id}`);
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || 5), // multiple workers can process different entries
  }
);

console.log("✅ Worker started and listening for jobs...");