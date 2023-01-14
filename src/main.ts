import 'module-alias/register';
import express from 'express';
import { getDotenvOptions } from '@core/utils/dotenv-utils';
import { initRoutes } from '@routes/routes';
import { DatabaseResolver } from '@database/database.resolver';

class Main {
    public static async initApp(): Promise<void> {
        const dotenvOptions = getDotenvOptions();

        const databaseProvider = await DatabaseResolver
            .resolveDatabaseProvider(dotenvOptions.databaseConnectionString);

        const app = express();

        app.listen(dotenvOptions.port);

        app.use(express.json());

        initRoutes(app, databaseProvider);
    }
}

Main.initApp();
