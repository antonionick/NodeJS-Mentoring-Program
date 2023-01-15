import Joi from 'joi';

export const JOI_USER_AUTOSUGGEST_SCHEMA = Joi.object({
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
