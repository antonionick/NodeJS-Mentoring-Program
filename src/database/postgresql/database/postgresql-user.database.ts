import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
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
    ): Promise<IUserDatabaseModel> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });

            return userSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(userSequelizeModel)
                : null!;
        } catch (error: unknown) {
            this.handlerError(error);
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

    public async getAutoSuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<IUserDatabaseModel[]> {
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
            return usersDatabaseModels;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<IUserDatabaseModel> {
        try {
            const userId = randomUUID();
            const createdUserSequelizeModel = await SequelizeUserModel.create({
                [PostgreSQLUsersTableColumn.userId]: userId,
                [PostgreSQLUsersTableColumn.login]: userData.login,
                [PostgreSQLUsersTableColumn.password]: userData.password,
                [PostgreSQLUsersTableColumn.age]: userData.age,
            });

            const userDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdUserSequelizeModel);
            return userDatabaseModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseModel> {
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

            return await this.getUserById(id);
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async deleteUser(
        id: string,
    ): Promise<boolean> {
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
            return !!affectedCount;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async addUsersToGroup(groupId: string, usersIds: string[]): Promise<boolean> {
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
            return areUsersAdded;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async checkUserExistenceById(
        userId: string,
    ): Promise<boolean> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            return !!userSequelizeModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async checkUserExistenceByLogin(
        login: string,
    ): Promise<boolean> {
        try {
            const userSequelizeModel = await SequelizeUserModel.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.login]: login,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            return !!userSequelizeModel;
        } catch (error) {
            this.handlerError(error);
        }
    }

    public async checkUserBelongsToGroup(
        userId: string,
        groupId: string,
    ): Promise<boolean> {
        try {
            const userSequelizeModel = await SequelizeUserGroupModel.findOne({
                where: {
                    [PostgreSQLUserGroupTableColumn.userId]: userId,
                    [PostgreSQLUserGroupTableColumn.groupId]: groupId,
                },
            });
            return !!userSequelizeModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }
}
