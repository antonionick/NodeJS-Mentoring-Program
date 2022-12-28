import { Initializable } from '@core/utils/initializable';

export interface IUserDataToCreate {
    login: string;
    password: string;
    age: number;
}

export interface IUserDataToUpdate extends Omit<IUserDataToCreate, 'login'> { }

// TODO: Rename
export interface IUserDatabaseData extends IUserDataToCreate {
    id: string;
    isDeleted: boolean;
}

export class User extends Initializable<User> {
    public id: string;
    public login: string;
    public password: string;
    public age: number;

    constructor(init?: User) {
        super();

        this.initialize!(init);
    }
}
