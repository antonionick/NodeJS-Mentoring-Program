import type { IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import type { ValidationResult } from '@validators/models/validation-result';

export interface IGroupValidatorAPI {
    validateGroupDataToCreate(groupDataToCreate: IGroupDataToCreate): ValidationResult;
    validateGroupDataToUpdate(groupDataToUpdate: IGroupDataToUpdate): ValidationResult;
}
