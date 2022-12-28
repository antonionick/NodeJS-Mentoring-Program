import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { IUserDataToCreate, IUserDatabaseData, User, IUserDataToUpdate } from '@components/user/user.models';

export class UserService {
    constructor(
        private readonly database: IUserDatabaseAPI,
    ) { }

    public async getUserById(id: string): Promise<User> {
        const userDatabaseData = await this.database.getUserById(id);
        if (!userDatabaseData) {
            // TODO: Error
        }

        const user = this.getUserByDatabaseData(userDatabaseData);
        return user;
    }

    public async getAutosuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<User[]> {
        if (Number.isNaN(limit)) {
            // TODO: Error
        }
        if (!limit) {
            return [];
        }

        const autosuggestDatabaseDatas = await this.database.getAutoSuggestUsers(loginSubstring, limit);
        console.log(autosuggestDatabaseDatas);
        const autosuggestUsers = autosuggestDatabaseDatas
            .map(this.getUserByDatabaseData);
        console.log(autosuggestUsers);

        return autosuggestUsers;
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<User> {
        const isUserExist = await this.database.checkUserExistenceByLogin(userData.login);
        if (isUserExist) {
            // TODO: Throw an error
        }

        const userDatabaseData = await this.database.createUser(userData);
        const user = this.getUserByDatabaseData(userDatabaseData);
        return user;
    }

    // TODO: Rename
    private getUserByDatabaseData(userDatabaseData: IUserDatabaseData): User {
        return new User({
            id: userDatabaseData.id,
            login: userDatabaseData.login,
            password: userDatabaseData.password,
            age: userDatabaseData.age,
        });
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<User> {
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            // TODO: Throw an error
        }

        const userDatabaseData = await this.database.updateUser(id, userData);
        const user = this.getUserByDatabaseData(userDatabaseData);
        return user;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            // TODO: Throw an error
        }

        const isDeleted = await this.database.deleteUser(id);
        return isDeleted;
    }
}
