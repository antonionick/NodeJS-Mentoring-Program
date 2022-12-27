import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserCreationData, IUserDatabaseData } from '@components/user/user.models';
import { randomUUID } from 'crypto';

export class UserInMemoryDatabase implements IUserDatabaseAPI {
    private readonly storage = new Map<string, IUserDatabaseData>();

    public async createUser(userData: IUserCreationData): Promise<IUserDatabaseData> {
        const userId = randomUUID();
        const databaseData = {
            id: userId,
            login: userData.login,
            password: userData.password,
            age: userData.age,
            isDeleted: false,
        };

        this.storage.set(userId, databaseData);

        return databaseData;
    }

    public async checkUserExistenceByLogin(login: string): Promise<boolean> {
        const valuesArray = Array.from(this.storage.values());
        return valuesArray.some(databaseData => databaseData.login === login);
    }
}
