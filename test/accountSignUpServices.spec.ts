import UserModel from '../src/model/userModel';
import accountSignUpService from '../src/services/accountSignUpService';

jest.mock('../src/model/userModel');

describe('adminSignUpService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return if user or email already exists', () => {
    UserModel.findOne = jest.fn().mockResolvedValueOnce({ userName: 'user1' }).mockResolvedValueOnce(null);

    return accountSignUpService.isAccountPresent('user1', 'email1@xyz.com').then(result => {
      expect(result).toEqual({ userExists: true, emailExists: false });
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { userName: 'user1' } });
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { email: 'email1@xyz.com' } });
    });
  });

  it('should return false if user and email do not exist', () => {
    UserModel.findOne = jest.fn().mockResolvedValue(null);

    return accountSignUpService.isAccountPresent('user2', 'email2@xyz.com').then(result => {
      expect(result).toEqual({ userExists: false, emailExists: false });
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { userName: 'user2' } });
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { email: 'email2@xyz.com' } });
    });
  });

  it('should save new user', () => {
    const mockUserData = {
      userName: 'admin1',
      email: 'email1@xyz.com',
      password: 'hashedpassword123',
      mobileNumber: 1234567890,
      userRole: 'ADMIN',
    };
    UserModel.create = jest.fn().mockResolvedValue(mockUserData);

    return accountSignUpService.saveAccount(mockUserData).then(result => {
      expect(result).toEqual(mockUserData);
      expect(UserModel.create).toHaveBeenCalledWith(mockUserData);
    });
  });
});
