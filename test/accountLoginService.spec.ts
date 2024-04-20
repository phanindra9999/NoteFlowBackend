import accountLoginService from '../src/services/accountLoginService';
import UserModel from '../src/model/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/model/userModel');

describe('authenticateAccount', () => {
  it('should return success false if user not found', async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    const response = await accountLoginService.authenticateAccount({ email: 'test@test.com', password: 'password' });
    expect(response).toEqual({ success: false });
  });

  it('should return success false if password is invalid', async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com', password: 'hashedpassword' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await accountLoginService.authenticateAccount({ email: 'test@test.com', password: 'password' });
    expect(response).toEqual({ success: false });
  });

  it('should return success true and token if password is valid', async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com', password: 'hashedpassword' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token');

    const response = await accountLoginService.authenticateAccount({
      email: 'test@test.com',
      password: 'hashedpassword',
    });
    expect(response).toEqual({ success: true, token: 'token' });
  });
});

describe('createCSRFToken', () => {
  it('should create a CSRF token', async () => {
    const token = await accountLoginService.createCSRFToken();
    expect(typeof token).toBe('string');
  });
});
