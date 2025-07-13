import * as Yup from 'yup';
import { emailYup, loginYup, passwordYup } from './commonValidators.js';

/**
 * Yup-схема для валидации регистрации пользователя
 * @type {Object}
 */
export const registerValidate = Yup.object({
  user: Yup.object({
    login: loginYup,
    email: emailYup,
    password: passwordYup,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
      .required('Обязательное поле'),
    acceptedPolicies: Yup.boolean()
      .oneOf([true], 'Поставьте галочку')
      .required(''),
  }),
});
