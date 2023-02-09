import { Initializable } from '@common/utils/initializable';
import type { DatabaseError } from '@database/models/database-error';

export class DatabaseResult<T = unknown> extends Initializable<DatabaseResult> {
    public data?: T;

    public error?: Error | DatabaseError;

    constructor(init: DatabaseResult) {
        super();

        this.initialize!(init);
    }

    public hasError?(): boolean {
        return !!this.error;
    }
}
