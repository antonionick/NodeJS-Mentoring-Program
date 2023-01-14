import type { IDatabaseProvider } from '@database/models/database-provider.models';
import { PostgresqlDatabaseProvider, PostgresqlDatabaseProviderInitOptions } from '@database/postgresql/postgresql-database.provider';

export class DatabaseResolver {
    public static async resolveDatabaseProvider(
        connectionString: string,
    ): Promise<IDatabaseProvider> {
        const databaseProvider = await DatabaseResolver.initPostgreSQLProvider(connectionString);
        return databaseProvider;
    }

    private static async initPostgreSQLProvider(
        connectionString: string,
    ): Promise<PostgresqlDatabaseProvider> {
        const initOptions = new PostgresqlDatabaseProviderInitOptions({
            connectionString,
        });

        const database = new PostgresqlDatabaseProvider();
        await database.initDatabase(initOptions);

        return database;
    }
}
