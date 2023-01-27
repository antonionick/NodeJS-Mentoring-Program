import { GroupPermission } from '@components/group/group.models';
import { randomUUID } from 'crypto';
import { DataTypes } from 'sequelize';
import { AllowNull, Column, Model, Sequelize, Table, Unique } from 'sequelize-typescript';

export const POSTGRESQL_GROUP_TABLE_NAME = 'Group';

export enum PostgreSQLGroupTableColumn {
    id = 'id',
    groupId = 'groupId',
    name = 'name',
    permissions = 'permissions',
}

@Table({
    tableName: POSTGRESQL_GROUP_TABLE_NAME,
    timestamps: false,
})
export class SequelizeGroupModel extends Model {
    @Unique(true)
    @AllowNull(false)
    @Column(DataTypes.UUID)
    public [PostgreSQLGroupTableColumn.groupId]: string;

    @Unique(true)
    @AllowNull(false)
    @Column(DataTypes.STRING)
    public [PostgreSQLGroupTableColumn.name]: string;

    @AllowNull(false)
    @Column(DataTypes.ARRAY(DataTypes.STRING))
    public [PostgreSQLGroupTableColumn.permissions]: string[];
}

async function initGroupPostgreSQLModel(
    sequelize: Sequelize,
): Promise<void> {
    sequelize.addModels([SequelizeGroupModel]);
    await SequelizeGroupModel.sync();
}

async function checkAndAddPredefinedData(): Promise<void> {
    const isTableEmpty = !await SequelizeGroupModel.findOne();
    if (isTableEmpty) {
        await SequelizeGroupModel.bulkCreate([
            {
                [PostgreSQLGroupTableColumn.groupId]: randomUUID(),
                [PostgreSQLGroupTableColumn.name]: 'group name 1',
                [PostgreSQLGroupTableColumn.permissions]: [
                    GroupPermission.Read,
                    GroupPermission.Write,
                ],
            },
            {
                [PostgreSQLGroupTableColumn.groupId]: randomUUID(),
                [PostgreSQLGroupTableColumn.name]: 'group name 2',
                [PostgreSQLGroupTableColumn.permissions]: [
                    GroupPermission.Share,
                    GroupPermission.UploadFiles,
                ],
            },
            {
                [PostgreSQLGroupTableColumn.groupId]: randomUUID(),
                [PostgreSQLGroupTableColumn.name]: 'group name 3',
                [PostgreSQLGroupTableColumn.permissions]: [GroupPermission.Delete],
            },
        ]);
    }
}

export async function initGroupPostgreSQLModelAndAddPredefinedData(
    sequelize: Sequelize,
): Promise<void> {
    await initGroupPostgreSQLModel(sequelize);
    await checkAndAddPredefinedData();
}
