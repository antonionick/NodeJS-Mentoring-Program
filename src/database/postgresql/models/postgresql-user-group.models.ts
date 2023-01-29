import { SequelizeGroupModel } from '@database/postgresql/models/postgresql-group.models';
import { SequelizeUserModel } from '@database/postgresql/models/postgresql-user.models';
import { Column, ForeignKey, Model, DataType, Table, Unique, AllowNull, PrimaryKey } from 'sequelize-typescript';

export const POSTGRESQL_USER_GROUP_TABLE_NAME = 'UserGroup';

export enum PostgreSQLUserGroupTableColumn {
    userGroupId= 'userGroupId',
    userId = 'userId',
    groupId = 'groupId',
}

@Table({
    tableName: POSTGRESQL_USER_GROUP_TABLE_NAME,
    timestamps: false,
})
export class SequelizeUserGroupModel extends Model {
    @Unique(true)
    @AllowNull(false)
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    public [PostgreSQLUserGroupTableColumn.userGroupId]: string;

    @ForeignKey(() => SequelizeUserModel)
    @Column(DataType.UUID)
    public [PostgreSQLUserGroupTableColumn.userId]: string;

    @ForeignKey(() => SequelizeGroupModel)
    @Column(DataType.UUID)
    public [PostgreSQLUserGroupTableColumn.groupId]: string;
}

export async function checkUserGroupEmptyAndAddPredefinedData(): Promise<void> {
    const isTableEmpty = !await SequelizeUserGroupModel.findOne();
    if (isTableEmpty) {
        const users = await SequelizeUserModel.findAll({ limit: 3 });
        const groups = await SequelizeGroupModel.findAll({ limit: 3 });

        await SequelizeUserGroupModel.bulkCreate([
            {
                [PostgreSQLUserGroupTableColumn.userId]: users[0].dataValues.userId,
                [PostgreSQLUserGroupTableColumn.groupId]: groups[0].dataValues.groupId,
            },
            {
                [PostgreSQLUserGroupTableColumn.userId]: users[1].dataValues.userId,
                [PostgreSQLUserGroupTableColumn.groupId]: groups[1].dataValues.groupId,
            },
            {
                [PostgreSQLUserGroupTableColumn.userId]: users[2].dataValues.userId,
                [PostgreSQLUserGroupTableColumn.groupId]: groups[2].dataValues.groupId,
            },
        ]);
    }
}
