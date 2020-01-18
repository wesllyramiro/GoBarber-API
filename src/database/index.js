import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointments from '../app/models/Appointments';

const models = [User, File, Appointments];

class Database {
    constructor() {
        this.init();
        this.mongos();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);

        models.forEach(model => model.init(this.connection));
        models.forEach(
            model =>
                model.associations && model.associations(this.connection.models)
        );
    }

    mongos() {
        this.mongosConnection = mongoose.connect(
            'http://localhost:3333/gobarber',
            { useNewUrlParser: true, useFindAndModify: true }
        );
    }
}

export default new Database();
