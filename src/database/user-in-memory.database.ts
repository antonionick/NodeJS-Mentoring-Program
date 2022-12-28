import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDataToCreate, IUserDatabaseData, IUserDataToUpdate } from '@components/user/user.models';
import { randomUUID } from 'crypto';
import { sortBy } from 'lodash';

export class UserInMemoryDatabase implements IUserDatabaseAPI {
    private readonly storage = new Map<string, IUserDatabaseData>();

    public async getUserById(id: string): Promise<IUserDatabaseData> {
        const user = this.storage.get(id);
        return user!;
    }

    public async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserDatabaseData[]> {
        const notDeletedDatabaseData = this.getNotDeletedDatabaseDatas();

        const autosuggestReducer = (
            acc: IUserDatabaseData[],
            databaseData: IUserDatabaseData,
        ): IUserDatabaseData[] => {
            if (acc.length < limit && databaseData.login.includes(loginSubstring)) {
                console.log('here we are');
                return [
                    ...acc,
                    databaseData,
                ];
            }
            return acc;
        };

        const autosuggestData = notDeletedDatabaseData.reduce(autosuggestReducer, []);
        const sortedAutosuggestData = sortBy(autosuggestData, ['login']);
        return sortedAutosuggestData;
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

    public async deleteUser(id: string): Promise<boolean> {
        const existenceUserData = this.storage.get(id);
        const databaseDataToUpdate = {
            ...existenceUserData!,
            isDeleted: true,
        };

        this.storage.set(id, databaseDataToUpdate);

        return true;
    }

    public async checkUserExistenceById(id: string): Promise<boolean> {
        const user = this.storage.get(id);
        return !!user && !user.isDeleted;
    }

    public async checkUserExistenceByLogin(login: string): Promise<boolean> {
        const notDeletedDatabaseData = this.getNotDeletedDatabaseDatas();
        return notDeletedDatabaseData.some(databaseData => databaseData.login === login);
    }

    private getNotDeletedDatabaseDatas(): IUserDatabaseData[] {
        const valuesArray = Array.from(this.storage.values());
        const notDeletedValues = valuesArray.filter(value => !value.isDeleted);

        return notDeletedValues;
    }
}
