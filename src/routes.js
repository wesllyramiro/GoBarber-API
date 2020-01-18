import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProvaderController from './app/controllers/ProvaderController';
import AppointmentsController from './app/controllers/AppointmentsController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.use(authMiddlewares);
routes.post('/session', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/provader', ProvaderController.index);
routes.get('/provader/provaderId/available', AvailableController.index);

routes.post('/appointments', AppointmentsController.store);
routes.get('/appointments', AppointmentsController.index);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notification', NotificationController.index);
routes.put('/notification/:id', NotificationController.update);

export default routes;
