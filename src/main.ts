import 'module-alias/register';
import express from 'express';
import type { Express } from 'express';
import { getDotenvOptions } from '@core/utils/dotenv-utils';
import { initRoutes } from '@routes/routes';
import { PostgresqlDatabaseProvider, PostgresqlDatabaseProviderInitOptions } from '@database/postgresql/postgresql-database.provider';
import { JoiValidatorProvider } from '@validators/joi/joi-validator.provider';

class Main {
    public static async initApp(): Promise<void> {
        const dotenvOptions = getDotenvOptions();

        const validatorProvider = new JoiValidatorProvider();
        const databaseProvider = await Main.initPostgreSQLProvider(dotenvOptions.databaseConnectionString);

        const server = Main.initServer(dotenvOptions.port);

        initRoutes(server, databaseProvider, validatorProvider);
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

    private static initServer(port: number): Express {
        const expressServer = express();
        expressServer.listen(port);
        expressServer.use(express.json());
        return expressServer;
    }
}

Main.initApp();
