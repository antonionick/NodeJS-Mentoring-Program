import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDataToCreate, IUserDatabaseModel, IUserDataToUpdate } from '@components/user/user.models';
import { randomUUID } from 'crypto';
import { sortBy } from 'lodash';

export class UserInMemoryDatabase implements IUserDatabaseAPI {
    private readonly storage = new Map<string, IUserDatabaseModel>();

    public async getUserById(id: string): Promise<IUserDatabaseModel> {
        const user = this.storage.get(id);
        return user!;
    }

    public async getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserDatabaseModel[]> {
        const autosuggestReducer = (
            acc: IUserDatabaseModel[],
            databaseModel: IUserDatabaseModel,
        ): IUserDatabaseModel[] => {
            if (acc.length < limit && databaseModel.login.includes(loginSubstring)) {
                return [
                    ...acc,
                    databaseModel,
                ];
            }
            return acc;
        };

        const notDeletedUsers = this.getNotDeletedUsers();
        const autosuggestUsers = notDeletedUsers.reduce(autosuggestReducer, []);
        const sortedAutosuggestUsers = sortBy(autosuggestUsers, ['login']);
        return sortedAutosuggestUsers;
    }

    public async createUser(userData: IUserDataToCreate): Promise<IUserDatabaseModel> {
        const userId = randomUUID();
        const user = {
            id: userId,
            login: userData.login,
            password: userData.password,
            age: userData.age,
            isDeleted: false,
        };

        this.storage.set(userId, user);

        return user;
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseModel> {
        const existenceUser = this.storage.get(id);
        const userToUpdate = {
            id: existenceUser!.id,
            login: existenceUser!.login,
            isDeleted: existenceUser!.isDeleted,

            age: userData.age || existenceUser!.age,
            password: userData.password || existenceUser!.password,
        };

        this.storage.set(id, userToUpdate);

        return userToUpdate;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const existenceUser = this.storage.get(id);
        const userToUpdate = {
            ...existenceUser!,
            isDeleted: true,
        };

        this.storage.set(id, userToUpdate);

        return true;
    }

    public async checkUserExistenceById(id: string): Promise<boolean> {
        const user = this.storage.get(id);
        return !!user && !user.isDeleted;
    }

    public async checkUserExistenceByLogin(login: string): Promise<boolean> {
        const notDeletedUsers = this.getNotDeletedUsers();
        return notDeletedUsers.some(user => user.login === login);
    }

    private getNotDeletedUsers(): IUserDatabaseModel[] {
        const usersList = Array.from(this.storage.values());
        const notDeletedUsers = usersList.filter(user => !user.isDeleted);

        return notDeletedUsers;
    }
}
