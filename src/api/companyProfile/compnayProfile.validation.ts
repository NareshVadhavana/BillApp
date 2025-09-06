import { body } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { ERROR_MESSAGES } from '../../constants';

class CompanyProfileValidation {
  createCompanyValidation = () =>
    validate([
      body('companyName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'companyName')),
      body('phoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')),
      body('username')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'username')),
      body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password')),
    ]);
}

export default CompanyProfileValidation;
