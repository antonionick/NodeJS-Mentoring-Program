import { JOI_GROUP_COMMON_RULES } from '@validators/joi/group/schemas/joi-group-common.schema';
import Joi from 'joi';

export const JOI_GROUP_CREATE_SCHEMA = Joi.object({
    ...JOI_GROUP_COMMON_RULES,

    name: Joi
        .string()
        .required(),
});
