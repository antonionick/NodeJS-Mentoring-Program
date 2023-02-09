import { ServiceError } from '@common/models/service.error';
import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import { IUserDataToCreate, IUserDatabaseModel, User, IUserDataToUpdate, UserServiceResult } from '@components/user/user.models';



// TODO: Add try catch
export class UserService {
    constructor(
        private readonly userDatabase: IUserDatabaseAPI,
        private readonly groupDatabase: IGroupDatabaseAPI,
        private readonly validator: IUserValidatorAPI,
    ) { }

    public async getUserById(id: string): Promise<UserServiceResult<User>> {
        const userDatabaseResult = await this.userDatabase.getUserById(id);
        if (userDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: userDatabaseResult.error });
        }

        const userDatabaseModel = userDatabaseResult.data!;
        if (!userDatabaseModel) {
            const serviceError = new ServiceError({
                message: `User with id: ${id} does not exist`,
            });
            return new UserServiceResult({ error: serviceError });
        }

        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return new UserServiceResult<User>({ data: user });
    }

    private convertDatabaseModelToUser(userDatabaseModel: IUserDatabaseModel): User {
        return new User({
            id: userDatabaseModel.id,
            login: userDatabaseModel.login,
            password: userDatabaseModel.password,
            age: userDatabaseModel.age,
        });
    }

    public async getAutosuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<UserServiceResult<User[]>> {
        const validationResult = this.validator
            .validateAutosuggestParams(loginSubstring, limit);
        if (validationResult.isValidationFail!()) {
            return new UserServiceResult({ error: validationResult });
        }

        const userDatabaseResult = await this.userDatabase
            .getAutoSuggestUsers(loginSubstring, limit);
        if (userDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: userDatabaseResult.error });
        }

        const autosuggestDatabaseModels = userDatabaseResult.data!;
        const autosuggestUsers = autosuggestDatabaseModels
            .map(this.convertDatabaseModelToUser);

        return new UserServiceResult<User[]>({ data: autosuggestUsers });
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<UserServiceResult<User>> {
        const validationResult = this.validator
            .validateUserDataToCreate(userData);
        if (validationResult.isValidationFail!()) {
            return new UserServiceResult({ error: validationResult });
        }

        const checkUserDatabaseResult =
            await this.userDatabase.checkUserExistenceByLogin(userData.login);
        if (checkUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: checkUserDatabaseResult.error });
        }

        const doesUserExist = checkUserDatabaseResult.data!;
        if (doesUserExist) {
            const serviceError = new ServiceError({
                message: `User with login: ${userData.login} is already exist`,
            });
            return new UserServiceResult({ error: serviceError });
        }

        const createUserDatabaseResult = await this.userDatabase.createUser(userData);
        if (createUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: createUserDatabaseResult.error });
        }

        const userDatabaseModel = createUserDatabaseResult.data!;
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return new UserServiceResult({ data: user });
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<UserServiceResult<User>> {
        const validationResult = this.validator
            .validateUserDataToUpdate(userData);
        if (validationResult.isValidationFail!()) {
            return new UserServiceResult({ error: validationResult });
        }

        const checkUserDatabaseResult = await this.userDatabase.checkUserExistenceById(id);
        if (checkUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: checkUserDatabaseResult.error });
        }

        const doesUserExist = checkUserDatabaseResult.data!;
        if (!doesUserExist) {
            const serviceError = new ServiceError({
                message: `User with id: ${id} does not exist`,
            });
            return new UserServiceResult({ error: serviceError });
        }

        const updateUserDatabaseResult = await this.userDatabase.updateUser(id, userData);
        if (updateUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: updateUserDatabaseResult.error });
        }

        const userDatabaseModel = updateUserDatabaseResult.data!;
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return new UserServiceResult({ data: user });
    }

    public async deleteUser(
        id: string,
    ): Promise<UserServiceResult<boolean>> {
        const checkUserDatabaseResult = await this.userDatabase.checkUserExistenceById(id);
        if (checkUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: checkUserDatabaseResult.error });
        }

        const doesUserExist = checkUserDatabaseResult.data!;
        if (!doesUserExist) {
            const serviceError = new ServiceError({
                message: `User with id: ${id} does not exist`,
            });
            return new UserServiceResult({ error: serviceError });
        }

        const deleteUserDatabaseResult = await this.userDatabase.deleteUser(id);
        if (deleteUserDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: deleteUserDatabaseResult.error });
        }
        const isDeleted = deleteUserDatabaseResult.data!;
        return new UserServiceResult({ data: isDeleted });
    }

    public async addUsersToGroup(
        groupId: string,
        usersIds: string[],
    ): Promise<UserServiceResult<boolean>> {
        const validationResult = this.validator.validateUsersIds(usersIds);
        if (validationResult.isValidationFail!()) {
            return new UserServiceResult({ error: validationResult });
        }

        const checkGroupDatabaseResult = await this.groupDatabase.checkGroupExistenceById(groupId);
        if (checkGroupDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: checkGroupDatabaseResult.error });
        }

        const doesGroupExist = checkGroupDatabaseResult.data!;
        if (!doesGroupExist) {
            const serviceError = new ServiceError({
                message: `Group with id: ${groupId} does not exist`,
            });
            return new UserServiceResult({ error: serviceError });
        }

        for (const userId of usersIds) {
            const checkUserDatabaseResult = await this.userDatabase
                .checkUserExistenceById(userId);
            if (checkUserDatabaseResult.hasError!()) {
                return new UserServiceResult({ error: checkUserDatabaseResult.error });
            }

            const doesUserExist = checkUserDatabaseResult.data!;
            if (!doesUserExist) {
                const serviceError = new ServiceError({
                    message: `User with id: ${userId} does not exits`,
                });
                return new UserServiceResult({ error: serviceError });
            }

            const checkUserBelongsToGroupDatabaseResult = await this.userDatabase
                .checkUserBelongsToGroup(userId, groupId);
            if (checkUserBelongsToGroupDatabaseResult.hasError!()) {
                return new UserServiceResult({ error: checkUserBelongsToGroupDatabaseResult.error });
            }

            const doesUserBelongToGroup = checkUserBelongsToGroupDatabaseResult.data!;
            if (doesUserBelongToGroup) {
                const serviceError = new ServiceError({
                    message: `User with id: ${userId} already in the group with id: ${groupId}`,
                });
                return new UserServiceResult({ error: serviceError });
            }
        }

        const addUsersToGroupDatabaseResult = await this.userDatabase
            .addUsersToGroup(groupId, usersIds);
        if (addUsersToGroupDatabaseResult.hasError!()) {
            return new UserServiceResult({ error: addUsersToGroupDatabaseResult.error });
        }

        const areUsersAdded = addUsersToGroupDatabaseResult.data!;
        return new UserServiceResult({ data: areUsersAdded });
    }
}
