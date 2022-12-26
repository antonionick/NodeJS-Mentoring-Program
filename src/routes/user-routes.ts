import { Router } from 'express';

export function getUserRoutes(): Router {
    const userRouter = Router();

    userRouter.get('');
    userRouter.post('');
    userRouter.put('');
    userRouter.delete('');

    return userRouter;
}
