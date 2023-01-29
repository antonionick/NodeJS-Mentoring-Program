import { GroupPermission } from '@components/group/group.models';
import { SequelizeUserGroupModel } from '@database/postgresql/models/postgresql-user-group.models';
import { SequelizeUserModel } from '@database/postgresql/models/postgresql-user.models';
import { AllowNull, DataType, BelongsToMany, Column, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export const POSTGRESQL_GROUPS_TABLE_NAME = 'Groups';

export enum PostgreSQLGroupTableColumn {
    groupId = 'groupId',
    name = 'name',
    permissions = 'permissions',
}

@Table({
    tableName: POSTGRESQL_GROUPS_TABLE_NAME,
    timestamps: false,
})
export class SequelizeGroupModel extends Model {
    @Unique(true)
    @AllowNull(false)
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    public [PostgreSQLGroupTableColumn.groupId]: string;

    @Unique(true)
    @AllowNull(false)
    @Column(DataType.STRING)
    public [PostgreSQLGroupTableColumn.name]: string;

    @AllowNull(false)
    @Column(DataType.ARRAY(DataType.STRING))
    public [PostgreSQLGroupTableColumn.permissions]: string[];

    @BelongsToMany(() => SequelizeUserModel, () => SequelizeUserGroupModel)
    public users: SequelizeUserModel[];
}

export async function checkGroupEmptyAndAddPredefinedData(): Promise<void> {
    const isTableEmpty = !await SequelizeGroupModel.findOne();
    if (isTableEmpty) {
        await SequelizeGroupModel.bulkCreate([
            {
                [PostgreSQLGroupTableColumn.name]: 'group name 1',
                [PostgreSQLGroupTableColumn.permissions]: [
                    GroupPermission.Read,
                    GroupPermission.Write,
                ],
            },
            {
                [PostgreSQLGroupTableColumn.name]: 'group name 2',
                [PostgreSQLGroupTableColumn.permissions]: [
                    GroupPermission.Share,
                    GroupPermission.UploadFiles,
                ],
            },
            {
                [PostgreSQLGroupTableColumn.name]: 'group name 3',
                [PostgreSQLGroupTableColumn.permissions]: [GroupPermission.Delete],
            },
        ]);
    }
}
