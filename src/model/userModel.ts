import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/databaseConfig';

class UserModel extends Model {
    public email!: string;
    public password!: string;
    public username!: string;
}

UserModel.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
    },

}, {
    sequelize,
    tableName: 'users',
});

export default UserModel;
