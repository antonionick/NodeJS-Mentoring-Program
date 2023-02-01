import type { IGroupValidatorAPI } from '@components/group/api/group-validator.api';
import type { IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import { JOI_GROUP_CREATE_SCHEMA } from '@validators/joi/group/schemas/joi-group-create.schema';
import { JOI_GROUP_UPDATE_SCHEMA } from '@validators/joi/group/schemas/joi-group-update.schema';
import { JoiValidatorBase } from '@validators/joi/joi-validator-base';
import type { ValidationResult } from '@validators/models/validation-result';

export class GroupValidator extends JoiValidatorBase implements IGroupValidatorAPI {
    public validateGroupDataToCreate(
        groupDataToCreate: IGroupDataToCreate,
    ): ValidationResult {
        return this.validate(groupDataToCreate, JOI_GROUP_CREATE_SCHEMA);
    }

    public validateGroupDataToUpdate(
        groupDataToUpdate: IGroupDataToUpdate,
    ): ValidationResult {
        return this.validate(groupDataToUpdate, JOI_GROUP_UPDATE_SCHEMA);
    }
}
