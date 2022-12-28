import { Initializable } from '@core/utils/initializable';

export class ValidationError extends Initializable<ValidationError> {
    public path: string;
    public message: string;

    constructor(init: ValidationError) {
        super();

        this.initialize!(init);
    }
}
