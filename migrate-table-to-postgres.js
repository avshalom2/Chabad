import mysqlPool from './src/lib/db.mysql.js';
import pgPool from './src/lib/db.pg.js';

function quoteMysqlIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, '``')}\``;
}

function quotePgIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function normalizeValue(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  return value;
}

async function getMysqlColumns(tableName) {
  const [rows] = await mysqlPool.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
    [process.env.DB_NAME, tableName]
  );

  return rows.map((row) => row.COLUMN_NAME);
}

async function getPgColumns(tableName, schemaName) {
  const result = await pgPool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = $2
      ORDER BY ordinal_position
    `,
    [schemaName, tableName]
  );

  return result.rows.map((row) => row.column_name);
}

async function readMysqlRows(tableName, columns) {
  const mysqlColumns = columns.map(quoteMysqlIdentifier).join(', ');
  const [rows] = await mysqlPool.query(
    `SELECT ${mysqlColumns} FROM ${quoteMysqlIdentifier(tableName)}`
  );
  return rows;
}

async function insertPgRows(tableName, schemaName, columns, rows, batchSize) {
  if (rows.length === 0) {
    return 0;
  }

  const qualifiedTable = `${quotePgIdentifier(schemaName)}.${quotePgIdentifier(tableName)}`;
  const quotedColumns = columns.map(quotePgIdentifier).join(', ');

  let inserted = 0;

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const values = [];
    const placeholders = batch.map((row, rowIndex) => {
      const rowPlaceholders = columns.map((column, columnIndex) => {
        values.push(normalizeValue(row[column]));
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });

      return `(${rowPlaceholders.join(', ')})`;
    });

    await pgPool.query(
      `INSERT INTO ${qualifiedTable} (${quotedColumns}) VALUES ${placeholders.join(', ')}`,
      values
    );

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${rows.length} rows into ${schemaName}.${tableName}`);
  }

  return inserted;
}

async function main() {
  const tableName = process.argv[2];
  const truncateTarget = process.argv.includes('--truncate');
  const schemaName =
    process.argv.find((arg) => arg.startsWith('--schema='))?.split('=')[1] || 'public';
  const batchSizeArg = process.argv.find((arg) => arg.startsWith('--batch='))?.split('=')[1];
  const batchSize = Number(batchSizeArg || 500);

  if (!tableName) {
    console.error('Usage: node migrate-table-to-postgres.js <table_name> [--truncate] [--schema=public] [--batch=500]');
    process.exit(1);
  }

  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    console.error('Batch size must be a positive integer.');
    process.exit(1);
  }

  console.log(`Preparing to migrate table "${tableName}" to PostgreSQL schema "${schemaName}"...`);

  const mysqlColumns = await getMysqlColumns(tableName);
  if (mysqlColumns.length === 0) {
    throw new Error(`MySQL table "${tableName}" was not found or has no columns.`);
  }

  const pgColumns = await getPgColumns(tableName, schemaName);
  if (pgColumns.length === 0) {
    throw new Error(`PostgreSQL table "${schemaName}.${tableName}" was not found or has no columns.`);
  }

  const sharedColumns = mysqlColumns.filter((column) => pgColumns.includes(column));
  if (sharedColumns.length === 0) {
    throw new Error(`No shared columns were found between MySQL "${tableName}" and PostgreSQL "${schemaName}.${tableName}".`);
  }

  console.log(`Using ${sharedColumns.length} shared columns: ${sharedColumns.join(', ')}`);

  const rows = await readMysqlRows(tableName, sharedColumns);
  console.log(`Read ${rows.length} rows from MySQL table "${tableName}".`);

  if (truncateTarget) {
    const qualifiedTable = `${quotePgIdentifier(schemaName)}.${quotePgIdentifier(tableName)}`;
    console.log(`Truncating PostgreSQL table ${schemaName}.${tableName} before insert...`);
    await pgPool.query(`TRUNCATE TABLE ${qualifiedTable} RESTART IDENTITY CASCADE`);
  }

  if (rows.length === 0) {
    console.log('No rows to migrate.');
    return;
  }

  const inserted = await insertPgRows(tableName, schemaName, sharedColumns, rows, batchSize);
  console.log(`Migration complete. Inserted ${inserted} rows into ${schemaName}.${tableName}.`);
}

try {
  await main();
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await Promise.allSettled([mysqlPool.end(), pgPool.end()]);
}
