import type { Express } from 'express';
import { getUserRoutes } from '@routes/user-routes';

enum Routes {
    User = 'User',
}

export function initRoutes(app: Express): void {
    app.use(Routes.User, getUserRoutes());
}
