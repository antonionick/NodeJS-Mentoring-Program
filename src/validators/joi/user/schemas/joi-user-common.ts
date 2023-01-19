import Joi from 'joi';

const USER_AGE_MIN_VALUE = 4;
const USER_AGE_MAX_VALUE = 130;

export const JOI_USER_COMMON_RULES = {
    password: Joi
        .string()
        .alphanum()
        .required(),

    age: Joi
        .number()
        .integer()
        .min(USER_AGE_MIN_VALUE)
        .max(USER_AGE_MAX_VALUE)
        .required(),
};
