import {
    startOfDay,
    endOfDay,
    isAfter,
    format,
    setHours,
    setMinutes,
    setSeconds,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';

class AvailableController {
    async index(req, res) {
        const { date } = req.query;

        if (!date) return res.status(400).json({ error: 'Invalid Date' });

        const searchDate = Number(date);

        const appointments = await Appointments.findAll({
            where: {
                provader_id: req.params.provaderId,
                canceled_at: null,
                data: {
                    [Op.between]: [
                        startOfDay(searchDate),
                        endOfDay(searchDate),
                    ],
                },
            },
        });

        const schedule = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
        ];

        const available = schedule.map(time => {
            const [hour, minute] = time.split(':');

            const value = setSeconds(
                setMinutes(setHours(searchDate, hour), minute),
                0
            );

            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                available:
                    isAfter(value, new Date()) &&
                    !appointments.find(a => format(a.data, 'HH:mm') !== time),
            };
        });

        return res.json(available);
    }
}

export default new AvailableController();
