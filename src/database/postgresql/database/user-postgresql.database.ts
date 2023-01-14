import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UsersTableColumn, USERS_TABLE_NAME } from '@database/models/tables/users-table.models';
import type { Client } from 'pg';

export class UserPostgreSQLDatabase implements IUserDatabaseAPI {
    constructor(
        private readonly client: Client,
    ) { }

    public async getUserById(
        id: string,
    ): Promise<IUserDatabaseModel> {
        const query = `
            select * from ${USERS_TABLE_NAME}
                where ${UsersTableColumn.userId} = '${id}'
        `;

        const queryResult = await this.client.query(query);
        if (!queryResult.rowCount) {
            return null!;
        }

        const row = queryResult.rows[0];
        const userModel: IUserDatabaseModel = {
            id: row.id,
            login: row.login,
            password: row.password,
            age: row.age,
            isDeleted: row.isDeleted,
        };
        return userModel;
    }

    public async getAutoSuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<IUserDatabaseModel[]> {
        return null as any;
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<IUserDatabaseModel> {
        return null as any;
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseModel> {
        return null as any;
    }

    public async deleteUser(
        id: string,
    ): Promise<boolean> {
        return null as any;
    }

    public async checkUserExistenceById(
        id: string,
    ): Promise<boolean> {
        return null as any;
    }

    public async checkUserExistenceByLogin(
        login: string,
    ): Promise<boolean> {
        return null as any;
    }
}
