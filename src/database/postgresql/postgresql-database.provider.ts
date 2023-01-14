import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { Initializable } from '@core/utils/initializable';
import type { IDatabaseProvider, IDatabaseProviderInitOptions } from '@database/models/database-provider.models';
import { UserPostgreSQLDatabase } from '@database/postgresql/database/user-postgresql.database';
import { initUsersTableAndInsertPredefinedData } from '@database/postgresql/scripts/user.scripts';
import { Client } from 'pg';

export class PostgresqlDatabaseProviderInitOptions
    extends Initializable<PostgresqlDatabaseProviderInitOptions>
    implements IDatabaseProviderInitOptions {
    connectionString: string;

    constructor(init: PostgresqlDatabaseProviderInitOptions) {
        super();

        this.initialize!(init);
    }
}

export class PostgresqlDatabaseProvider implements IDatabaseProvider {
    private databaseInstance: Client;
    private userDatabaseInstance: UserPostgreSQLDatabase;

    public async initDatabase(
        { connectionString }: PostgresqlDatabaseProviderInitOptions,
    ): Promise<void> {
        if (!connectionString) {
            throw new Error(`PostgreSQL connection string should be provided`);
        }

        try {
            this.databaseInstance = new Client(connectionString);
            await this.databaseInstance.connect();
            await this.initTables();
        } catch (err) {
            // TODO: Error handling
        }
    }

    private async initTables(): Promise<void> {
        await initUsersTableAndInsertPredefinedData(this.databaseInstance);
    }

    public getUserDatabase(): IUserDatabaseAPI {
        if (!this.userDatabaseInstance) {
            this.userDatabaseInstance = new UserPostgreSQLDatabase(this.databaseInstance);
        }
        return this.userDatabaseInstance;
    }
}
