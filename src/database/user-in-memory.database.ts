import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDataToCreate, IUserDatabaseData, IUserDataToUpdate } from '@components/user/user.models';
import { randomUUID } from 'crypto';

export class UserInMemoryDatabase implements IUserDatabaseAPI {
    private readonly storage = new Map<string, IUserDatabaseData>();

    public getAll(): IUserDatabaseData[] {
        return Array.from(this.storage.values());
    }

    public async createUser(userData: IUserDataToCreate): Promise<IUserDatabaseData> {
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

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseData> {
        const existenceUserData = this.storage.get(id);
        const databaseDataToUpdate = {
            id: existenceUserData!.id,
            login: existenceUserData!.login,
            isDeleted: existenceUserData!.isDeleted,

            age: userData.age || existenceUserData!.age,
            password: userData.password || existenceUserData!.password,
        };

        this.storage.set(id, databaseDataToUpdate);

        return databaseDataToUpdate;
    }

    public async checkUserExistenceById(id: string): Promise<boolean> {
        return this.storage.has(id);
    }

    public async checkUserExistenceByLogin(login: string): Promise<boolean> {
        const valuesArray = Array.from(this.storage.values());
        return valuesArray.some(databaseData => databaseData.login === login);
    }
}
