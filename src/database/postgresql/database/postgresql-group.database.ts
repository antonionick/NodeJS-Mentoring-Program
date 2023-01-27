import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
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

    public async getGroupById(id: string): Promise<IGroupDatabaseModel> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.groupId]: id,
                },
            });

            return groupSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(groupSequelizeModel)
                : null!;
        } catch (error: unknown) {
            this.handlerError(error);
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

    public async getAllGroups(): Promise<IGroupDatabaseModel[]> {
        try {
            const groupSequelizeModels = await SequelizeGroupModel.findAll();
            const groupDatabaseModels = groupSequelizeModels
                .map(this.convertSequelizeModelToDatabaseModel.bind(this));
            return groupDatabaseModels;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async createGroup(dataToCreate: IGroupDataToCreate): Promise<IGroupDatabaseModel> {
        try {
            const groupId = randomUUID();
            const createdGroupSequelizeMode = await SequelizeGroupModel.create({
                [PostgreSQLGroupTableColumn.groupId]: groupId,
                [PostgreSQLGroupTableColumn.name]: dataToCreate.name,
                [PostgreSQLGroupTableColumn.permissions]: dataToCreate.permissions,
            });

            const groupDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdGroupSequelizeMode);
            return groupDatabaseModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async updateGroup(
        id: string,
        dataToUpdate: IGroupDataToUpdate,
    ): Promise<IGroupDatabaseModel> {
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

            return await this.getGroupById(id);
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async deleteGroup(id: string): Promise<boolean> {
        try {
            const affectedCount = await SequelizeGroupModel.destroy({
                where: {
                    [PostgreSQLGroupTableColumn.id]: id,
                },
            });
            return !!affectedCount;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async checkGroupExistenceById(id: string): Promise<boolean> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.groupId]: id,
                },
            });
            return !!groupSequelizeModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }

    public async checkGroupExistenceByName(name: string): Promise<boolean> {
        try {
            const groupSequelizeModel = await SequelizeGroupModel.findOne({
                where: {
                    [PostgreSQLGroupTableColumn.name]: name,
                },
            });
            return !!groupSequelizeModel;
        } catch (error: unknown) {
            this.handlerError(error);
        }
    }
}
