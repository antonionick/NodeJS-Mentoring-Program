import { USER_JOI_COMMON_RULES } from '@validators/user/joi/schemas/user-joi-common';
import Joi from 'joi';

export const USER_JOI_UPDATE_SCHEMA = Joi.object(USER_JOI_COMMON_RULES);
