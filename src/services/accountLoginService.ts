import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../model/userModel';
import dotenv from 'dotenv';
import csrf from 'csrf-token';
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY!;

interface LoginCredentials {
  email: string;
  password: string;


}

interface AuthResponse {
  success: boolean;
  token?: string;
  username?: string;
}

const createCSRFToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const token = csrf.createSync('EPAM RD Project');
      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

const authenticateAccount = ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          resolve({ success: false });
        } else {
          bcrypt.compare(password, user.password).then((isPasswordValid: boolean) => {
            if (!isPasswordValid) {
              resolve({ success: false });
            } else {
              const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
              resolve({ success: true, token, username: user.username });
            }
          });
        }
      })
      .catch(error => {
        console.error('Error in authentication:', error);
        reject({ success: false });
      });
  });
};

const adminLoginService = {
  authenticateAccount,
  createCSRFToken
}
export default adminLoginService;
