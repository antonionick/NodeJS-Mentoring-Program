import { GROUP_PERMISSION_LIST } from '@components/group/group.models';
import Joi from 'joi';

export const JOI_GROUP_COMMON_RULES = {
    permissions: Joi
        .array()
        .items(
            Joi
                .string()
                .valid(...GROUP_PERMISSION_LIST),
        )
        .unique()
        .min(1),
};
