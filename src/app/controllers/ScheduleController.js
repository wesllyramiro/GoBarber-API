import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointments from '../models/Appointments';

class ScheduleController {
    async index(req, res) {
        const isProvader = await User.findOne({
            where: {
                id: req.userId,
                provider: true,
            },
        });

        if (!isProvader)
            return res.status(401).json({ error: 'User is not provader' });

        const { data } = req.query;

        const dataParse = parseISO(data);

        const appointments = await Appointments.findAll({
            where: {
                provider_id: req.userId,
                canceled_at: null,
                data: {
                    [Op.between]: [startOfDay(dataParse), endOfDay(dataParse)],
                },
            },
        });

        return res.Json(appointments);
    }
}

export default new ScheduleController();
