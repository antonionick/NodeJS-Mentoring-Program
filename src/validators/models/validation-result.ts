import { Initializable } from '@common/utils/initializable';
import type { ValidationError } from '@validators/models/validation-error';
import type { ValidationStatus } from '@validators/models/validation-status';

export class ValidationResult extends Initializable<ValidationResult> {
    public status: ValidationStatus;

    public errors?: ValidationError[];

    constructor(init: ValidationResult) {
        super();

        this.initialize!(init);
    }
}
