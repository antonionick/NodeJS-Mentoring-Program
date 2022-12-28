import type { ValidationError } from '@common/validation/validation-error';
import type { ValidationStatus } from '@common/validation/validation-status';
import { Initializable } from '@core/utils/initializable';

export class ValidationResult extends Initializable<ValidationResult> {
    public status: ValidationStatus;

    public errors?: ValidationError[];

    constructor(init: ValidationResult) {
        super();

        this.initialize!(init);
    }
}
