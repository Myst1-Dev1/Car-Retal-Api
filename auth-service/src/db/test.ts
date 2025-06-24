import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('✅ Conexão bem-sucedida com o banco de dados PostgreSQL');
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Falha na conexão com o banco:', err.message);
});