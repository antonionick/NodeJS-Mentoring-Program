import 'module-alias/register';
import express from 'express';
import { getDotenvOptions } from '@core/utils/dotenv-utils';
import { initRoutes } from '@routes/routes';

const app = express();
const dotenvOptions = getDotenvOptions();

app.listen(dotenvOptions.port);

app.use(express.json());

initRoutes(app);
