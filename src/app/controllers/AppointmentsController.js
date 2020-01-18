import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointments from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentsController {
    async index(req, res) {
        const { page = 1 } = req.query;
        const appointments = await Appointments.findAll({
            where: {
                userId: req.userId,
                canceled_at: null,
            },
            attributes: ['id', 'data', 'past', 'cancelable'],
            include: [
                {
                    model: User,
                    as: 'provader',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
            order: ['data'],
            limit: 20,
            offset: (page - 1) * 20,
        });

        return res.Json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            provader_id: Yup.number().required(),
            data: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fail' });

        const isProvader = await User.findOne({
            where: {
                id: req.provader_id,
                provider: true,
            },
        });

        if (!isProvader)
            return res.status(401).json({ error: 'User is not provader' });

        const startHour = startOfHour(parseISO(req.data));

        if (isBefore(startHour, new Date()))
            return res.status(400).json({ error: 'date pass' });

        const existsAppointments = await Appointments.findOne({
            where: {
                provader_id: req.provader_id,
                canceled_at: null,
                data: req.data,
            },
        });

        if (existsAppointments)
            return res.status(400).json({ error: 'exists appointments' });

        const user = await User.findByPk(req.provader_id);

        const dataFormat = format(
            startHour,
            "'dia' dd 'de ' MMMM ', às ' H:mm ",
            { locale: pt }
        );

        await Notification.create({
            content: `Novo agendamento criado por ${user.name} no ${dataFormat} `,
            user: req.provader_id,
        });

        const file = await Appointments.create({
            user_id: req.userId,
            provader_id: req.provader_id,
            data: req.data,
        });

        return res.Json(file);
    }

    async delete(req, res) {
        const appointment = Appointments.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provader',
                    attributes: ['name', 'email'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                },
            ],
        });

        if (appointment.user_id !== req.userId) {
            return res
                .status(403)
                .json({ error: 'is not permition perform this operation' });
        }

        const dateSub = subHours(appointment.date, 2);

        if (isBefore(appointment.date, dateSub)) {
            return res
                .status(400)
                .json({ error: 'limit time for canceled outdated' });
        }

        appointment.canceled_at = new Date();

        await appointment.save();

        await Queue.add(CancellationMail.key, {
            appointment,
        });

        return res.json(appointment);
    }
}

export default new AppointmentsController();
