import * as Yup from 'yup';
import { emailYup, passwordYup } from './commonValidators.js';

/**
 * Yup-схема для валидации логина пользователя
 * @type {Object}
 */
export const loginValidate = Yup.object({
  user: Yup.object({
    email: emailYup,
    password: passwordYup,
  }),
});
