import { Request, Response } from 'express';
import userLoginServices from '../services/accountLoginService';
import { LOGIN_ERROR_MESSAGE } from '../constants/loginErrorMessages';

const userLogin = (req: Request, res: Response): void => {
  const { email, password } = req.body;
  userLoginServices
    .authenticateAccount({ email, password })
    .then(authResponse => {
      if (authResponse.success) {
        return userLoginServices.createCSRFToken().then(token => {
          res.set('X-CSRF-Token', token);
          res.cookie('jwt', authResponse.token);
          res.json({ success: true, token: authResponse.token, username: authResponse.username });
        });
      } else {
        res.status(401).json({ success: false, message: LOGIN_ERROR_MESSAGE.INVALID_EMAIL_PASSWORD });
      }
    })
    .catch(error => {
      res.status(500).json({ success: false, message: LOGIN_ERROR_MESSAGE.INTERNAL_SERVER_ERROR });
    });
};

const userLoginController = {
  userLogin,
};
export default userLoginController;
