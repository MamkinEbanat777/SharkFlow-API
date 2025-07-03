import * as Yup from 'yup';
import { emailYup, passwordYup } from './commonValidators.js';

export const loginValidate = Yup.object({
  user: Yup.object({
    email: emailYup,
    password: passwordYup,
  }),
});
