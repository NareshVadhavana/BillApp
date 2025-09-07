import { body } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { ERROR_MESSAGES } from '../../constants';

class InvoiceValidation {
  createInvoiceValidation = () =>
    validate([
      body('customerPhoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'customerPhoneNumber'))
        .isNumeric()
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'customerPhoneNumber'))
        .isLength({ min: 10, max: 10 })
        .withMessage('Phone number must be exactly 10 digits'),
      body('customerName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'customerName')),
      body('customerAddress')
        .optional()
        .isString()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'customerAddress')),

      // Items array validation
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),

      body('items.*.itemName').notEmpty().withMessage('Item name is required'),

      body('items.*.unitPrice')
        .notEmpty()
        .withMessage('Unit price is required')
        .isFloat({ gt: 0 })
        .withMessage('Unit price must be a positive number'),

      body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),

      body('items.*.itemTotalPrice')
        .notEmpty()
        .withMessage('Item total price is required')
        .isFloat({ gt: 0 })
        .withMessage('Item total price must be a positive number'),

      // Optional: subtotal & grand total validation
      body('subTotal')
        .notEmpty()
        .withMessage('Subtotal is required')
        .isFloat({ gt: 0 })
        .withMessage('Subtotal must be a positive number'),

      body('grandTotal')
        .notEmpty()
        .withMessage('Grand total is required')
        .isFloat({ gt: 0 })
        .withMessage('Grand total must be a positive number'),
    ]);
}

export default InvoiceValidation;
