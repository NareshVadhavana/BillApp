import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { routeAccessLogger } from './middleware/logger.middleware';
import { logger } from './services/logger/logger.service';

const app = express();
const PORT = process.env.PORT;

// log every request
app.use(routeAccessLogger);

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript!');
});

app.get('/error', () => {
  throw new Error('Test error');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).send('Something went wrong...');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
