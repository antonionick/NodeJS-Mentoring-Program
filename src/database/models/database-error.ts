import { Initializable } from '@common/utils/initializable';
import type { DatabaseErrorItem } from '@database/models/database-error-item';

export class DatabaseError extends Initializable<DatabaseError> {
    public errorItems: DatabaseErrorItem[];

    constructor(init: DatabaseError) {
        super();

        this.initialize!(init);
    }
}
