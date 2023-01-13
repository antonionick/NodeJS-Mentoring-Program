import { initUserDatabaseAndInsertPredefinedData } from '@database/postgresql/scripts/user.scripts';
import { Client } from 'pg';

export async function executeInitDatabaseScript(): Promise<void> {
    const connectionString = 'postgresql://postgres:admin@localhost:5432/nodejsglobalmentoringprogram';

    const client = new Client(connectionString);
    await client.connect();

    await initUserDatabaseAndInsertPredefinedData(client);

    await client.end();
}
