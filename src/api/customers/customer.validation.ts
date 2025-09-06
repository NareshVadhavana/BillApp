import { body } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { ERROR_MESSAGES } from '../../constants';

class CustomerValidation {
  createCustomerValidation = () =>
    validate([
      body('name')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'name')),
      body('phoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber')),
      body('address')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'address')),
    ]);
}

export default CustomerValidation;
