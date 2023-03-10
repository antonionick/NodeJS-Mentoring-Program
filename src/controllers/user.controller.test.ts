import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { PassportAuthenticator } from '@authenticator/passport.authenticator';
import type { UserServiceProvider } from '@components/user/user-service.provider';
import type { UserService } from '@components/user/user.service';
import { IUserDatabaseModel, UserServiceResult, User } from '@components/user/user.models';
import { UserController } from '@controllers/user.controller';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';

describe('User Controller', () => {
    let databaseProvider: IDatabaseProvider;
    let validatorProvider: IValidatorProvider;
    let authenticator: PassportAuthenticator;

    let userService: UserService;
    let userController: UserController;
    let userServiceProvider: UserServiceProvider;

    let request: Request;
    let response: Response;
    let next: NextFunction;

    beforeAll(() => {
        databaseProvider = {
            getUserDatabase: () => null,
            getGroupDatabase: () => null,
        } as unknown as IDatabaseProvider;
        databaseProvider = Object.freeze(databaseProvider);

        validatorProvider = {
            getUserValidator: () => null,
            getGroupValidator: () => null,
        } as unknown as IValidatorProvider;
        validatorProvider = Object.freeze(validatorProvider);
    });

    beforeEach(() => {
        authenticator = {
            login: () => null,
        } as unknown as PassportAuthenticator;

        userService = {} as unknown as UserService;
        userServiceProvider = {
            provideUserService: () => userService,
        } as unknown as UserServiceProvider;
        userServiceProvider = Object.freeze(userServiceProvider) as unknown as UserServiceProvider;

        request = {} as Request;
        response = {
            send: jest.fn(() => response),
            status: jest.fn(() => response),
            json: jest.fn(() => response),
            locals: {},
        } as unknown as Response;
        next = jest.fn();

        userController = new UserController(databaseProvider, validatorProvider, authenticator, userServiceProvider);
    });

    describe('Login method', () => {
        const TEST_USER_CREDENTIALS: Partial<IUserDatabaseModel> = {
            login: 'login1@mail.com',
            password: 'Password123',
        };
        const loginTestHandler = (email: string, password: string): string => `${email}${password}`;

        beforeEach(() => {
            authenticator.login = loginTestHandler;
        });

        test(`the status should be ${StatusCodes.OK}`, async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should send token', async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const token = loginTestHandler(
                TEST_USER_CREDENTIALS.login!, TEST_USER_CREDENTIALS.password!);

            const sendMock = (response.send as jest.Mock).mock;
            const sendMockFirstCall = sendMock.calls[0];
            const firstCallArgument = sendMockFirstCall[0];
            expect(firstCallArgument).toBe(token);
        });

        test('should catch an error', async () => {
            request.user = TEST_USER_CREDENTIALS;

            authenticator.login = () => { throw new Error() };

            await userController.login(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
        })
    });

    describe('getUserById method', () => {
        const TEST_USER: User = new User({
            id: 'user_id',
            login: 'login1@mail.com',
            password: 'Password123',
            age: 15,
        });

        beforeEach(() => {
            userService.getUserById = async (id: string) => {
                if (id === TEST_USER.id) {
                    return new UserServiceResult<User>({ data: TEST_USER });
                }
                return new UserServiceResult<User>({ error: 'User does not exist' });
            };
        });

        test(`the status should be ${StatusCodes.OK}`, async () => {
            request.params = { id: TEST_USER.id };

            await userController.getUserById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should send found user', async () => {
            request.params = { id: TEST_USER.id };

            await userController.getUserById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];
            expect(firstCallArgument).toBe(TEST_USER);
        });

        test('should call next function without arguments', async () => {
            request.params = { id: TEST_USER.id };

            await userController.getUserById(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error should call next function with one',
            async () => {
                request.params = { id: 'some' };

                await userController.getUserById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error should not call status and json response methods',
            async () => {
                request.params = { id: 'some' };

                await userController.getUserById(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });
});
