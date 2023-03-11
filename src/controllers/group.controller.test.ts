import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { GroupController } from '@controllers/group.controller';
import type { GroupService } from '@components/group/group.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { GroupServiceProvider } from '@components/group/group-service.provider';
import { GroupServiceResult, IGroupDataToCreate, IGroupDataToUpdate, GroupPermission, Group } from '@components/group/group.models';

describe('Group Controller', () => {
    let databaseProvider: IDatabaseProvider;
    let validatorProvider: IValidatorProvider;

    let groupService: GroupService;
    let groupServiceProvider: GroupServiceProvider;
    let groupController: GroupController;

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
        groupService = {} as unknown as GroupService;
        groupServiceProvider = {
            provideGroupService: () => groupService,
        } as unknown as GroupServiceProvider;
        groupServiceProvider = Object.freeze(groupServiceProvider) as unknown as GroupServiceProvider;

        request = {} as Request;
        response = {
            send: jest.fn(() => response),
            status: jest.fn(() => response),
            json: jest.fn(() => response),
            locals: {},
        } as unknown as Response;
        next = jest.fn();

        groupController = new GroupController(databaseProvider, validatorProvider, groupServiceProvider);
    });

    describe('getGroupById method', () => {
        const ERROR_TEST_GROUP_ID = 'some';
        const TEST_GROUP = new Group({
            id: 'group_id',
            name: 'group_name',
            permissions: [GroupPermission.Read],
        });

        beforeEach(() => {
            const getGroupByIdHandler = async (id: string) => {
                if (id === TEST_GROUP.id) {
                    return new GroupServiceResult<Group>({ data: TEST_GROUP });
                }
                return new GroupServiceResult<Group>({ error: 'test error text' });
            }
            groupService.getGroupById = jest.fn(getGroupByIdHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const getGroupByIdMock = (groupService.getGroupById as jest.Mock).mock;
            const firstCall = getGroupByIdMock.calls[0];

            expect(firstCall[0]).toBe(TEST_GROUP.id);
        });

        test(`should call the status method of response`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const getGroupByIdMock = (groupService.getGroupById as jest.Mock).mock;
            const groupServiceResult = await getGroupByIdMock.results[0].value;
            const resultValue = groupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });
});
