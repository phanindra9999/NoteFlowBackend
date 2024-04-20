import { Request, Response } from 'express';
import userSignUpController from '../src/controller/userSignUpController';
import userSignUpServices from '../src/services/accountSignUpService';
import { ERRORS, ACCOUNT_MESSAGES } from '../src/constants/signUpMessages';

jest.mock('../src/services/accountSignUpService');
jest.mock('bcrypt');

describe('userSignUpController', () => {
  const mockRequest: Partial<Request> = {
    body: { userName: 'user', email: 'user@test.com', password: 'hashedPassword' },
  };

  const mockResponse: Response = {
    json: jest.fn() as jest.Mock,
    status: jest.fn(() => mockResponse) as jest.Mock,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register new user successfully', done => {
    (userSignUpServices.isAccountPresent as jest.Mock).mockResolvedValue({ userExists: false, emailExists: false });
    (userSignUpServices.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (userSignUpServices.saveAccount as jest.Mock).mockResolvedValue(undefined);

    userSignUpController.userSignUp(mockRequest as Request, mockResponse as Response);
    process.nextTick(() => {
      try {
        expect(userSignUpServices.isAccountPresent).toHaveBeenCalledWith(
          mockRequest.body.userName,
          mockRequest.body.email,
        );
        expect(userSignUpServices.hashPassword).toHaveBeenCalledWith(mockRequest.body.password);
        expect(userSignUpServices.saveAccount).toHaveBeenCalledWith({
          userName: mockRequest.body.userName,
          email: mockRequest.body.email,
          password: 'hashedPassword',
        });
        expect(mockResponse.json).toHaveBeenCalledWith({ success: ACCOUNT_MESSAGES.USER_CREATED_SUCCESSFULLY });
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handle existing user error', done => {
    (userSignUpServices.isAccountPresent as jest.Mock).mockResolvedValue({ userExists: true, emailExists: false });

    userSignUpController.userSignUp(mockRequest as Request, mockResponse as Response);
    process.nextTick(() => {
      expect(userSignUpServices.isAccountPresent).toHaveBeenCalledWith(
        mockRequest.body.userName,
        mockRequest.body.email,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: ERRORS.USERNAME_EXISTS });
      done();
    });
  });

  it('handle existing email error', done => {
    (userSignUpServices.isAccountPresent as jest.Mock).mockResolvedValue({ userExists: false, emailExists: true });

    userSignUpController.userSignUp(mockRequest as Request, mockResponse as Response);
    process.nextTick(() => {
      expect(userSignUpServices.isAccountPresent).toHaveBeenCalledWith(
        mockRequest.body.userName,
        mockRequest.body.email,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: ERRORS.EMAIL_EXISTS });
      done();
    });
  });

  it('handle saveAccount error', done => {
    (userSignUpServices.isAccountPresent as jest.Mock).mockResolvedValue({ userExists: false, emailExists: false });
    (userSignUpServices.saveAccount as jest.Mock).mockRejectedValue(new Error('SaveAccount failed'));

    userSignUpController.userSignUp(mockRequest as Request, mockResponse as Response);
    process.nextTick(() => {
      expect(userSignUpServices.isAccountPresent).toHaveBeenCalledWith(
        mockRequest.body.userName,
        mockRequest.body.email,
      );
      expect(userSignUpServices.saveAccount).toHaveBeenCalledWith({
        userName: mockRequest.body.userName,
        email: mockRequest.body.email,
        password: 'hashedPassword',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: ERRORS.USER_CREATION_ERROR });
      done();
    });
  });
});
