import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString, { max: 1, prepare: false });

async function runManualMigration() {
  console.log('Running manual migrations...');
  
  const sqlContent = fs.readFileSync(path.join(process.cwd(), 'drizzle', '0000_ancient_trauma.sql'), 'utf-8');
  
  // Split the file by statements
  const statements = sqlContent.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const statement of statements) {
    console.log(`Executing: ${statement.slice(0, 50)}...`);
    // Need to use raw execution
    await client.unsafe(statement);
  }
  
  console.log('Migrations complete!');
  process.exit(0);
}

runManualMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
