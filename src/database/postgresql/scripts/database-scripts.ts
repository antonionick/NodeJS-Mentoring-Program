import type { Client } from 'pg';

const DATABASE_NAME = 'nodejsglobalmentoringprogram';

const CHECK_IF_DATABASE_EXISTS_SCRIPT = `select from pg_database where datname = '${DATABASE_NAME}'`;
const CREATE_DATABASE_SCRIPT = `create database ${DATABASE_NAME}`;

async function checkIfDatabaseExists(
    client: Client,
): Promise<boolean> {
    const databaseExistenceResponse = await client.query(CHECK_IF_DATABASE_EXISTS_SCRIPT);
    return databaseExistenceResponse.rowCount !== 0;
}

export async function processDatabaseScripts(
    client: Client,
): Promise<void> {
    const doesExists = await checkIfDatabaseExists(client);
    if (!doesExists) {
        await client.query(CREATE_DATABASE_SCRIPT);
    }
}
