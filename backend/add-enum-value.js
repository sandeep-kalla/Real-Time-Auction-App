const { Client } = require('pg');

async function addEnumValue() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to database');
    
    // First check if the value already exists
    const checkResult = await client.query(`
      SELECT unnest(enum_range(NULL::enum_auctions_status)) as status;
    `);
    
    const existingValues = checkResult.rows.map(row => row.status);
    console.log('Existing enum values:', existingValues);
    
    if (existingValues.includes('awaiting_counter_response')) {
      console.log('✅ awaiting_counter_response already exists in enum');
    } else {
      await client.query(`ALTER TYPE enum_auctions_status ADD VALUE 'awaiting_counter_response';`);
      console.log('✅ Successfully added awaiting_counter_response to enum');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

addEnumValue();
