import { Request, Response } from 'express';
import User from '../types/user';
import userSignUpServices from '../services/accountSignUpService';
import { ERRORS, ACCOUNT_MESSAGES } from '../constants/signUpMessages';

const userSignUp = (req: Request, res: Response) => {
  const newUserData: User = req.body;
  userSignUpServices
    .isAccountPresent(newUserData.username, newUserData.email)
    .then(({ userExists, emailExists }) => {
      if (userExists) {
        throw new Error(ERRORS.USERNAME_EXISTS);
      }
      if (emailExists) {
        throw new Error(ERRORS.EMAIL_EXISTS);
      }
      return userSignUpServices.hashPassword(newUserData.password);
    })
    .then(hashPassword => {
      newUserData.password = hashPassword;
      return userSignUpServices.saveAccount(newUserData);
    })
    .then(() => res.json({ success: ACCOUNT_MESSAGES.USER_CREATED_SUCCESSFULLY }))
    .catch(error => {
      if (error.message === ERRORS.EMAIL_EXISTS || error.message === ERRORS.USERNAME_EXISTS) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: ERRORS.USER_CREATION_ERROR });
    });
};

const userSignUpController = {
  userSignUp,
};

export default userSignUpController;
