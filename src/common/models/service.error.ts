import { Initializable } from '@common/utils/initializable';

// TODO: Add handler
export class ServiceError extends Initializable<ServiceError> {
    public message: string;

    constructor(init: ServiceError) {
        super();

        this.initialize!(init);
    }
}
