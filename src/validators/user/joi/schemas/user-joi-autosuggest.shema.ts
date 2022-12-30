import Joi from 'joi';

export const USER_JOI_AUTOSUGGEST_SCHEMA = Joi.object({
    loginSubstring: Joi
        .string()
        .allow('')
        .required(),

    limit: Joi
        .number()
        .required()
        .positive()
        .integer(),
});
