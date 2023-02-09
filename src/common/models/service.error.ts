import { Initializable } from '@common/utils/initializable';

export class ServiceError extends Initializable<ServiceError> {
    public message: string;

    constructor(init: ServiceError) {
        super();

        this.initialize!(init);
    }
}
