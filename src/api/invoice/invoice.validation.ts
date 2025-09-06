import { body } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { ERROR_MESSAGES } from '../../constants';

class InvoiceValidation {
  createInvoiceValidation = () =>
    validate([
      body('customerId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'customerId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'customerId')),
      body('customerPhoneNumber')
        .optional()
        .isNumeric()
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'customerPhoneNumber')),
      body('customerName')
        .optional()
        .isAlphanumeric()
        .withMessage(ERROR_MESSAGES.COMMON.ALPHA_NUMERIC.replace(':attribute', 'customerName')),
      body('customerAddress')
        .optional()
        .isString()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'customerAddress')),
    ]);
}

export default InvoiceValidation;
