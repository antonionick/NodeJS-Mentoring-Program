import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';

// TODO: Check how to name by REST
enum Routes {
    User = 'user',
}

export function initRoutes(app: Express): void {
    app.use(`/${Routes.User}`, getUserRoutes());
}
