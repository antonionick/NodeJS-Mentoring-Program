import Joi from 'joi';

export const JOI_USERS_IDS_SCHEMA = Joi.object({
    usersIds: Joi
        .array()
        .items(
            Joi
                .string()
                .guid(),
        )
        .unique()
        .min(1),
});
