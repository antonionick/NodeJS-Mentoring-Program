import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserCreationData } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import { UserInMemoryDatabase } from '@database/user-in-memory.database';
import type { Request, Response } from 'express';

export class UserController {
    private static userService: UserService;
    private static userDatabase: IUserDatabaseAPI;

    public static async createUser(
        request: Request,
        response: Response,
        next: CallableFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userCreationData = UserController.getUserCreationData(request);

        try {
            const user = await userService.createUser(userCreationData);
            response
                .status(200)
                .json(user);
            next();
        } catch (err) {
            // TODO: Error handler
        }
    }

    private static getUserCreationData({ body }: Request): IUserCreationData {
        return {
            login: body.login,
            password: body.password,
            age: body.age,
        };
    }

    private static getUserService(): UserService {
        if (!UserController.userService) {
            const userDatabase = UserController.getUserDatabase();
            const userService = new UserService(userDatabase);
            UserController.userService = userService;
        }
        return UserController.userService;
    }

    private static getUserDatabase(): IUserDatabaseAPI {
        if (!UserController.userDatabase) {
            const userDatabase = new UserInMemoryDatabase();
            UserController.userDatabase = userDatabase;
        }
        return UserController.userDatabase;
    }
}
