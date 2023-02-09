import { EnumUtils } from '@common/utils/enum-utils';
import { Initializable } from '@common/utils/initializable';
import { omit } from 'lodash';

export interface IGroupDataToCreate {
    name: string;
    permissions: GroupPermission[];
}

export interface IGroupDataToUpdate extends Omit<IGroupDataToCreate, 'name'> { }

export interface IGroupDatabaseModel extends IGroupDataToCreate {
    id: string;
}

export enum GroupPermission {
    Read = 'READ',
    Write = 'WRITE',
    Delete = 'DELETE',
    Share = 'SHARE',
    UploadFiles = 'UPLOAD_FILES'
}
export const GROUP_PERMISSION_LIST: GroupPermission[] = EnumUtils.toArray(GroupPermission);

export class Group extends Initializable<Group> {
    public id: string;
    public name: string;
    public permissions: GroupPermission[];

    constructor(init?: Group) {
        super();

        this.initialize!(init);
    }
}

export class GroupServiceResult<T = unknown> extends Initializable<GroupServiceResult> {
    public data?: T;
    public error?: unknown;

    constructor(init?: GroupServiceResult) {
        super();

        this.initialize!(init);
    }

    public hasError?(): boolean {
        return !!this.error;
    }
}
