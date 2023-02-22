import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { DatabaseResult } from '@database/models/database-result';
import { PostgreSQLBaseDatabase } from '@database/postgresql/database/postgresql-base.database';
import type { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { PostgreSQLUserGroupTableColumn, SequelizeUserGroupModel } from '@database/postgresql/models/postgresql-user-group.models';
import { PostgreSQLUsersTableColumn, SequelizeUserModel } from '@database/postgresql/models/postgresql-user.models';
import { randomUUID } from 'crypto';
import { Model, Op } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

const IS_DELETED_COMMON_QUERY = {
    [Op.not]: true,
};

export class PostgreSQLUserDatabase
    extends PostgreSQLBaseDatabase
    implements IUserDatabaseAPI {
    constructor(
        errorsConverter: PostgreSQLDatabaseErrorsConverter,
        private readonly sequelize: Sequelize,
    ) {
        super(errorsConverter);
    }

    public async getUserById(
        userId: string,
    ): Promise<DatabaseResult<IUserDatabaseModel>> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });

            const resultUserMorel = userSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(userSequelizeModel)
                : null!;
            return new DatabaseResult({ data: resultUserMorel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IUserDatabaseModel>;
        }
    }

    private convertSequelizeModelToDatabaseModel(
        userSequelizeModel: Model,
    ): IUserDatabaseModel {
        const dataValues = userSequelizeModel.dataValues;

        const userDatabaseModel: IUserDatabaseModel = {
            id: dataValues.userId,
            login: dataValues.login,
            password: dataValues.password,
            age: dataValues.age,
            isDeleted: dataValues.isDeleted,
        };
        return userDatabaseModel;
    }

    public async getUserByLogin(
        login: string,
    ): Promise<DatabaseResult<IUserDatabaseModel>> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.login]: login,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });

            const resultUserMorel = userSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(userSequelizeModel)
                : null!;
            return new DatabaseResult({ data: resultUserMorel });
        } catch (error) {
            return this.handlerError(error) as DatabaseResult<IUserDatabaseModel>;
        }
    }

    public async getAutoSuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<DatabaseResult<IUserDatabaseModel[]>> {
        try {
            const userSequelizeModels = await SequelizeUserModel.findAll({
                where: {
                    [PostgreSQLUsersTableColumn.login]: {
                        [Op.substring]: loginSubstring,
                    },
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
                order: [
                    [PostgreSQLUsersTableColumn.login, 'ASC'],
                ],
                limit,
            });

            const usersDatabaseModels = userSequelizeModels
                .map(this.convertSequelizeModelToDatabaseModel.bind(this));
                return new DatabaseResult({ data: usersDatabaseModels });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IUserDatabaseModel[]>;
        }
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<DatabaseResult<IUserDatabaseModel>> {
        try {
            const userId = randomUUID();
            const createdUserSequelizeModel = await SequelizeUserModel.create({
                [PostgreSQLUsersTableColumn.userId]: userId,
                [PostgreSQLUsersTableColumn.login]: userData.login,
                [PostgreSQLUsersTableColumn.password]: userData.password,
                [PostgreSQLUsersTableColumn.age]: userData.age,
            });

            const userDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdUserSequelizeModel);
            return new DatabaseResult({ data: userDatabaseModel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IUserDatabaseModel>;
        }
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<DatabaseResult<IUserDatabaseModel>> {
        try {
            await SequelizeUserModel.update(
                {
                    [PostgreSQLUsersTableColumn.age]: userData.age,
                    [PostgreSQLUsersTableColumn.password]: userData.password,
                },
                {
                    where: {
                        [PostgreSQLUsersTableColumn.userId]: id,
                        [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                    },
                },
            );

            const userDatabaseModel = await this.getUserById(id);
            return new DatabaseResult({ data: userDatabaseModel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IUserDatabaseModel>;
        }
    }

    public async deleteUser(
        id: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const [affectedCount] = await SequelizeUserModel.update(
                {
                    [PostgreSQLUsersTableColumn.isDeleted]: true,
                },
                {
                    where: {
                        [PostgreSQLUsersTableColumn.userId]: id,
                        [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                    },
                },
            );
            const isUserDeleted = !!affectedCount;
            return new DatabaseResult({ data: isUserDeleted });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async addUsersToGroup(
        groupId: string,
        usersIds: string[],
    ): Promise<DatabaseResult<boolean>> {
        try {
            const areUsersAdded = this.sequelize.transaction(async transaction => {
                for (const userId of usersIds) {
                    await SequelizeUserGroupModel.create(
                        {
                            [PostgreSQLUserGroupTableColumn.userId]: userId,
                            [PostgreSQLUserGroupTableColumn.groupId]: groupId,
                        },
                        { transaction },
                    );
                }
                return true;
            });
            return new DatabaseResult({ data: areUsersAdded });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async checkUserExistenceById(
        userId: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            const doseUserExistById = !!userSequelizeModel;
            return new DatabaseResult({ data: doseUserExistById });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async checkUserExistenceByLogin(
        login: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.login]: login,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            const doesUserExistByLogin = !!userSequelizeModel;
            return new DatabaseResult({ data: doesUserExistByLogin });
        } catch (error) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async checkUserBelongsToGroup(
        userId: string,
        groupId: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const userSequelizeModel = await SequelizeUserGroupModel.findOne({
                where: {
                    [PostgreSQLUserGroupTableColumn.userId]: userId,
                    [PostgreSQLUserGroupTableColumn.groupId]: groupId,
                },
            });
            const doesUserBelongToGroup = !!userSequelizeModel;
            return new DatabaseResult({ data: doesUserBelongToGroup });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }
}
