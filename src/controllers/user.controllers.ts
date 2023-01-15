import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';

export class UserController {
    private userService: UserService;

    constructor(
        private readonly databaseProvider: IDatabaseProvider,
        private readonly validatorProvider: IValidatorProvider,
    ) { }

    public async getUserById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const id = request.params.id;

        try {
            const user = await userService.getUserById(id);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    public async getAutosuggest(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const { limit, loginSubstring } = request.query;

        try {
            const autosuggestUsers = await userService
                .getAutosuggestUsers(loginSubstring as string, Number(limit));

            response
                .status(StatusCodes.OK)
                .json(autosuggestUsers);
            next();
        } catch (err) {
            next(err);
        }
    }

    public async createUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userDataToCreate = this.getUserDataToCreate(request);

        try {
            const user = await userService.createUser(userDataToCreate);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    private getUserDataToCreate({ body }: Request): IUserDataToCreate {
        return {
            login: body.login,
            password: body.password,
            age: body.age,
        };
    }

    public async updateUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userDataToUpdate = this.getUserDataToUpdate(request);
        const userIdToUpdate = request.params.id;

        try {
            const user = await userService.updateUser(userIdToUpdate, userDataToUpdate);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    private getUserDataToUpdate({ body }: Request): IUserDataToUpdate {
        return {
            age: body.age,
            password: body.password,
        };
    }

    public async deleteUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userIdToDelete = request.params.id;

        try {
            const isDeleted = await userService.deleteUser(userIdToDelete);
            response
                .status(StatusCodes.OK)
                .send(isDeleted);
            next();
        } catch (err) {
            next(err);
        }
    }

    private getUserService(): UserService {
        if (!this.userService) {
            const userDatabase = this.databaseProvider.getUserDatabase();
            const userValidator = this.validatorProvider.getUserValidator();
            const userService = new UserService(userDatabase, userValidator);
            this.userService = userService;
        }
        return this.userService;
    }
}
