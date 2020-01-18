import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
    get key() {
        return 'CancellationMail';
    }

    async Handle({ data }) {
        const { appointment } = data;

        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provader.name,
                user: appointment.user.name,
                date: format(
                    parseISO(appointment.date),
                    "'dia' dd 'de ' MMMM ', às ' H:mm ",
                    { locale: pt }
                ),
            },
        });
    }
}

export default new CancellationMail();
