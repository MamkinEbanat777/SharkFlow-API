import * as Yup from 'yup';
import { Filter } from 'bad-words';

const filter = new Filter();
const noCyrillicRegex = /^[^\u0400-\u04FF]*$/;

export const loginValidate = Yup.object({
  user: Yup.object({
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
  }),
});
