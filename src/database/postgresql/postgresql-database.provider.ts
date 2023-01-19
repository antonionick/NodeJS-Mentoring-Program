import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { Initializable } from '@common/utils/initializable';
import type { IDatabaseProvider, IDatabaseProviderInitOptions } from '@database/models/database-provider.models';
import { PostgreSQLUserDatabase } from '@database/postgresql/database/postgresql-user.database';
import { POSTGRESQL_SEQUELIZE_OPTIONS } from '@database/postgresql/models/postgresql-sequelize.models';
import { initUsersPostgreSQLModelAndAddPredefinedData, POSTGRESQL_USERS_TABLE_NAME } from '@database/postgresql/models/postgresql-user.models';
import { Sequelize } from 'sequelize';

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
    private databaseInstance: Sequelize;
    private userDatabaseInstance: PostgreSQLUserDatabase;

    public async initDatabase(
        { connectionString }: PostgresqlDatabaseProviderInitOptions,
    ): Promise<void> {
        if (!connectionString) {
            throw new Error(`PostgreSQL connection string should be provided`);
        }

        try {
            this.databaseInstance = new Sequelize(connectionString, POSTGRESQL_SEQUELIZE_OPTIONS);
            await this.databaseInstance.authenticate();
            await this.initTables();
        } catch (err) {
            // TODO: Error handling
        }
    }

    private async initTables(): Promise<void> {
        await initUsersPostgreSQLModelAndAddPredefinedData(this.databaseInstance);
    }

    public getUserDatabase(): IUserDatabaseAPI {
        if (!this.userDatabaseInstance) {
            const userModel = this.databaseInstance.models[POSTGRESQL_USERS_TABLE_NAME];
            this.userDatabaseInstance = new PostgreSQLUserDatabase(userModel);
        }
        return this.userDatabaseInstance;
    }
}
