import type { LogInfo } from '@common/models/log-info.models';
import { Initializable } from '@common/utils/initializable';

export class ErrorHandlerData extends Initializable<ErrorHandlerData> {
    error: unknown;
    logInfo?: LogInfo;

    constructor(init: ErrorHandlerData) {
        super();

        this.initialize!(init);
    }
}
