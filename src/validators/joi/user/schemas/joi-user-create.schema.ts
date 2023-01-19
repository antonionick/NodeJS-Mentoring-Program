import { JOI_USER_COMMON_RULES } from '@validators/joi/user/schemas/joi-user-common';
import Joi from 'joi';

export const JOI_USER_CREATE_SCHEMA = Joi.object({
    ...JOI_USER_COMMON_RULES,

    login: Joi
        .string()
        .email()
        .required(),
});
