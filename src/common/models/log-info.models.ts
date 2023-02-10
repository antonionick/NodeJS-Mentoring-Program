import { Initializable } from '@common/utils/initializable';

export class LogInfo extends Initializable<LogInfo> {
    public className: string;
    public methodName: string;
    public parameters: unknown[];

    public executionTime: number;

    constructor(init: LogInfo) {
        super();

        this.initialize!(init);
    }
}
