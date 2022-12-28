import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { appErrorHandler } from '@common/errors/app-error-handler';

// TODO: Check how to name by REST
enum Routes {
    User = 'user',
}

export function initRoutes(app: Express): void {
    app.use(`/${Routes.User}`, getUserRoutes());
    app.use(appErrorHandler);
}
