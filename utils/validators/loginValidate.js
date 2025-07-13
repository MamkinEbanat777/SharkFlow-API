import * as Yup from 'yup';
import { emailYup, passwordYup } from './commonValidators.js';

/**
 * @module validators/login
 * @description Yup-схема для валидации логина пользователя.
 */
export const loginValidate = Yup.object({
  user: Yup.object({
    email: emailYup,
    password: passwordYup,
  }),
});
