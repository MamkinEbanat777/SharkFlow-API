import * as Yup from 'yup';
import { Filter } from 'bad-words';

const filter = new Filter();
const noCyrillicRegex = /^[^\u0400-\u04FF]*$/;

export const registerValidate = Yup.object({
  user: Yup.object({
    login: Yup.string()
      .min(3, 'Логин должен быть не меньше 3 символов')
      .max(30, 'Логин должен быть не длиннее 20 символов')
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'Логин может содержать только латинские буквы, цифры и подчёркивания',
      )
      .matches(noCyrillicRegex, 'Кириллица запрещена')
      .test('no-profanity', 'Логин содержит недопустимые слова', (val) =>
        val ? !filter.isProfane(val) : true,
      )
      .required('Обязательное поле'),

    email: Yup.string()
      .email('Неверный формат почты')
      .matches(
        noCyrillicRegex,
        'Кириллица запрещена в адресе электронной почты',
      )
      .required('Обязательное поле'),

    password: Yup.string()
      .min(8, 'Пароль должен быть не меньше 8 символов')
      .max(100, 'Пароль слишком длинный')
      .matches(
        /[A-Z]/,
        'Пароль должен содержать хотя бы одну заглавную латинскую букву',
      )
      .matches(
        /[a-z]/,
        'Пароль должен содержать хотя бы одну строчную латинскую букву',
      )
      .matches(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
      .matches(
        /[@$!%*?&#]/,
        'Пароль должен содержать хотя бы один специальный символ (@, $, !, %, *, ?, &, #)',
      )
      .matches(noCyrillicRegex, 'Кириллица запрещена')
      .test('no-profanity', 'Пароль содержит недопустимые слова', (val) =>
        val ? !filter.isProfane(val) : true,
      )

      .required('Обязательное поле'),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
      .required('Обязательное поле'),
    acceptedPolicies: Yup.boolean()
      .oneOf([true], 'Поставьте галочку')
      .required(''),
  }),
});
