import nodemailer from 'nodemailer';
import expressHandlebars from 'express-handlebars';
import nodeHandlebars from 'nodemailer-express-handlebars';
import { resolve } from 'path';
import mailConfig from '../config/mail';

class Mail {
    constructor() {
        const { host, port, secure, auth } = mailConfig;

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: auth.user ? auth : null,
        });
    }

    configTemplate() {
        const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

        this.transporter.use(
            'compile',
            nodeHandlebars({
                viewEngine: expressHandlebars.create({
                    layoutsDir: resolve(viewPath, 'layouts'),
                    partialsDir: resolve(viewPath, 'partials'),
                    defaultLayout: 'default.hbs',
                }),
                viewPath,
                extName: '.hbs',
            })
        );
    }

    sendMail(message) {
        return this.transporter.sendMail({
            ...mailConfig.default,
            ...message,
        });
    }
}

export default new Mail();
