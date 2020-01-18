import express from 'express';
import path from 'path';
import Youch from 'youch';
import cors from 'cors';
import routes from './routes';

import './database';

class App {
    constructor() {
        this.server = express();

        this.middlewares();
        this.routes();
        this.exceptionHandle();
    }

    middlewares() {
        this.server.use(express.json());
        this.server.use(cors());
        this.server.use(
            '/files',
            express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
        );
    }

    routes() {
        this.server.use(routes);
    }

    exceptionHandle() {
        this.server.use(async (error, req, res, next) => {
            const errors = new Youch(error, req).toJSON();

            return res.status(500).json(errors);
        });
    }
}

export default new App().server;
