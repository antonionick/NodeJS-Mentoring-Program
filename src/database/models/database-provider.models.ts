import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';

export interface IDatabaseProviderInitOptions {}

export interface IDatabaseProvider {
    initDatabase(
        initOptions: IDatabaseProviderInitOptions,
    ): Promise<void>;

    getUserDatabase(): IUserDatabaseAPI;
    getGroupDatabase(): IGroupDatabaseAPI;
}
