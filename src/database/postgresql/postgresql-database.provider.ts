import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { Initializable } from '@common/utils/initializable';
import type { IDatabaseProvider, IDatabaseProviderInitOptions } from '@database/models/database-provider.models';
import { PostgreSQLUserDatabase } from '@database/postgresql/database/postgresql-user.database';
import { POSTGRESQL_SEQUELIZE_OPTIONS } from '@database/postgresql/models/postgresql-sequelize.models';
import { checkUsersEmptyAndAddPredefinedData, SequelizeUserModel } from '@database/postgresql/models/postgresql-user.models';
import { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { Sequelize } from 'sequelize-typescript';
import { checkGroupEmptyAndAddPredefinedData, SequelizeGroupModel } from '@database/postgresql/models/postgresql-group.models';
import { PostgreSQLGroupDatabase } from '@database/postgresql/database/postgresql-group.database';
import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import { checkUserGroupEmptyAndAddPredefinedData, SequelizeUserGroupModel } from '@database/postgresql/models/postgresql-user-group.models';

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
    private groupDatabaseInstance: PostgreSQLGroupDatabase;
    private databaseErrorsConverter: PostgreSQLDatabaseErrorsConverter;

    public async initDatabase(
        { connectionString }: PostgresqlDatabaseProviderInitOptions,
    ): Promise<void> {
        if (!connectionString) {
            throw new Error(`PostgreSQL connection string should be provided`);
        }

        this.databaseInstance = new Sequelize(connectionString, POSTGRESQL_SEQUELIZE_OPTIONS);
        await this.databaseInstance.authenticate();
        await this.initTables();
    }

    private async initTables(): Promise<void> {
        this.databaseInstance.addModels([
            SequelizeUserModel,
            SequelizeGroupModel,
            SequelizeUserGroupModel,
        ]);
        await this.databaseInstance.sync();

        await checkUsersEmptyAndAddPredefinedData();
        await checkGroupEmptyAndAddPredefinedData();
        await checkUserGroupEmptyAndAddPredefinedData();
    }

    public getUserDatabase(): IUserDatabaseAPI {
        if (!this.userDatabaseInstance) {
            const errorsConverter = this.getErrorsConverter();
            this.userDatabaseInstance = new PostgreSQLUserDatabase(
                errorsConverter, this.databaseInstance);
        }
        return this.userDatabaseInstance;
    }

    public getGroupDatabase(): IGroupDatabaseAPI {
        if (!this.groupDatabaseInstance) {
            const errorsConverter = this.getErrorsConverter();
            this.groupDatabaseInstance = new PostgreSQLGroupDatabase(errorsConverter);
        }
        return this.groupDatabaseInstance;
    }

    private getErrorsConverter(): PostgreSQLDatabaseErrorsConverter {
        if (!this.databaseErrorsConverter) {
            this.databaseErrorsConverter = new PostgreSQLDatabaseErrorsConverter();
        }
        return this.databaseErrorsConverter;
    }
}
