import User from '../models/User';
import File from '../models/File';

class ProvaderController {
    async index(req, res) {
        const provader = await User.findAll({
            where: { provider: true },
            attributes: ['id', 'name', 'email', 'avatar_id'],
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['name', 'path', 'url'],
                },
            ],
        });

        return res.Json(provader);
    }
}

export default new ProvaderController();
