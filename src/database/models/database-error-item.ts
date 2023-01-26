import { Initializable } from '@common/utils/initializable';

export class DatabaseErrorItem extends Initializable<DatabaseErrorItem> {
    public message: string;
    public value?: string;

    constructor(init: DatabaseErrorItem) {
        super();

        this.initialize!(init);
    }
}
