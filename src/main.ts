import 'module-alias/register';
import express from 'express';
import { getDotenvOptions } from '@core/utils/dotenv-utils';
import { initRoutes } from '@routes/routes';
import { PostgresqlDatabaseProvider, PostgresqlDatabaseProviderInitOptions } from '@database/postgresql/postgresql-database.provider';

class Main {
    public static async initApp(): Promise<void> {
        const dotenvOptions = getDotenvOptions();

        const databaseProvider = await Main.initPostgreSQLProvider(dotenvOptions.databaseConnectionString);

        const app = express();

        app.listen(dotenvOptions.port);

        app.use(express.json());

        initRoutes(app, databaseProvider);
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

Main.initApp();
