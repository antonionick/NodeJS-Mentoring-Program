import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { IUserCreationData, IUserDatabaseData, User } from '@components/user/user.models';

export class UserService {
    constructor(
        private readonly database: IUserDatabaseAPI,
    ) { }

    public async createUser(
        userData: IUserCreationData,
    ): Promise<User> {
        const isUserExist = await this.database.checkUserExistenceByLogin(userData.login);
        if (isUserExist) {
            // TODO: Throw an error
        }

        const userDatabaseData = await this.database.createUser(userData);
        const user = this.getUserByDatabaseData(userDatabaseData);
        return user;
    }

    private getUserByDatabaseData(userDatabaseData: IUserDatabaseData): User {
        return new User({
            id: userDatabaseData.id,
            login: userDatabaseData.login,
            password: userDatabaseData.password,
            age: userDatabaseData.age,
        });
    }
}
