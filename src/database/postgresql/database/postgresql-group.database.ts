import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import { DatabaseResult } from '@database/models/database-result';
import { PostgreSQLBaseDatabase } from '@database/postgresql/database/postgresql-base.database';
import type { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { PostgreSQLGroupTableColumn, SequelizeGroupModel } from '@database/postgresql/models/postgresql-group.models';
import { randomUUID } from 'crypto';
import type { Model } from 'sequelize';

export class PostgreSQLGroupDatabase
    extends PostgreSQLBaseDatabase
    implements IGroupDatabaseAPI {
    constructor(
        errorsConverter: PostgreSQLDatabaseErrorsConverter,
    ) {
        super(errorsConverter);
    }

    public async getGroupById(
        id: string,
    ): Promise<DatabaseResult<IGroupDatabaseModel>> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.groupId]: id,
                },
            });

            const resultGroupModel = groupSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(groupSequelizeModel)
                : null!;
            return new DatabaseResult({ data: resultGroupModel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IGroupDatabaseModel>;
        }
    }

    private convertSequelizeModelToDatabaseModel(
        groupSequelizeModel: Model,
    ): IGroupDatabaseModel {
        const dataValues = groupSequelizeModel.dataValues;

        const groupDatabaseModel: IGroupDatabaseModel = {
            id: dataValues.groupId,
            name: dataValues.name,
            permissions: dataValues.permissions,
        };
        return groupDatabaseModel;
    }

    public async getAllGroups(): Promise<DatabaseResult<IGroupDatabaseModel[]>> {
        try {
            const groupSequelizeModels = await SequelizeGroupModel.findAll();
            const groupDatabaseModels = groupSequelizeModels
                .map(this.convertSequelizeModelToDatabaseModel.bind(this));
            return new DatabaseResult({ data: groupDatabaseModels });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IGroupDatabaseModel[]>;
        }
    }

    public async createGroup(
        dataToCreate: IGroupDataToCreate,
    ): Promise<DatabaseResult<IGroupDatabaseModel>> {
        try {
            const groupId = randomUUID();
            const createdGroupSequelizeMode = await SequelizeGroupModel.create({
                [PostgreSQLGroupTableColumn.groupId]: groupId,
                [PostgreSQLGroupTableColumn.name]: dataToCreate.name,
                [PostgreSQLGroupTableColumn.permissions]: dataToCreate.permissions,
            });

            const groupDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdGroupSequelizeMode);
            return new DatabaseResult({ data: groupDatabaseModel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IGroupDatabaseModel>;
        }
    }

    public async updateGroup(
        id: string,
        dataToUpdate: IGroupDataToUpdate,
    ): Promise<DatabaseResult<IGroupDatabaseModel>> {
        try {
            await SequelizeGroupModel.update(
                {
                    [PostgreSQLGroupTableColumn.permissions]: dataToUpdate.permissions,
                },
                {
                    where: {
                        [PostgreSQLGroupTableColumn.groupId]: id,
                    },
                },
            );

            const groupDatabaseModel = await this.getGroupById(id);
            return new DatabaseResult({ data: groupDatabaseModel });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<IGroupDatabaseModel>;
        }
    }

    public async deleteGroup(
        id: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const affectedCount = await SequelizeGroupModel.destroy({
                where: {
                    [PostgreSQLGroupTableColumn.groupId]: id,
                },
            });
            const isGroupDeleted = !!affectedCount;
            return new DatabaseResult({ data: isGroupDeleted });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async checkGroupExistenceById(
        id: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.groupId]: id,
                },
            });
            const doesGroupExistById = !!groupSequelizeModel;
            return new DatabaseResult({ data: doesGroupExistById });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }

    public async checkGroupExistenceByName(
        name: string,
    ): Promise<DatabaseResult<boolean>> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.name]: name,
                },
            });
            const doesGroupExistByName = !!groupSequelizeModel;
            return new DatabaseResult({ data: doesGroupExistByName });
        } catch (error: unknown) {
            return this.handlerError(error) as DatabaseResult<boolean>;
        }
    }
}
