import * as Yup from 'yup';
import { Filter } from 'bad-words';

export const filter = new Filter();
export const noCyrillicRegex = /^[^\u0400-\u04FF]*$/;
export const loginRegex = /^[a-zA-Z0-9_]+$/;
export const passwordSpecialCharRegex = /[@$!%*?&#]/;

export const validateBooleanField = (value, fieldName) => {
  if (value === undefined) return { isValid: true, value: undefined };
  if (typeof value !== 'boolean') {
    return { isValid: false, error: `Поле ${fieldName} должно быть boolean` };
  }
  return { isValid: true, value };
};

export const validateTitleField = (title, entityName = 'элемента', maxLength = 64) => {
  if (title === undefined) return { isValid: true, value: undefined };
  if (typeof title !== 'string') {
    return { isValid: false, error: `Название ${entityName} должно быть строкой` };
  }
  const sanitized = title.trim();
  if (sanitized.length < 1) {
    return { isValid: false, error: `Название ${entityName} не может быть пустым` };
  }
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Название слишком длинное (максимум ${maxLength} символов)` };
  }
  return { isValid: true, value: sanitized };
};

export const emailYup = Yup.string()
  .email('Неверный формат почты')
  .matches(noCyrillicRegex, 'Кириллица запрещена в адресе электронной почты')
  .required('Обязательное поле');

export const loginYup = Yup.string()
  .min(3, 'Логин должен быть не меньше 3 символов')
  .max(30, 'Логин должен быть не длиннее 20 символов')
  .matches(loginRegex, 'Логин может содержать только латинские буквы, цифры и подчёркивания')
  .matches(noCyrillicRegex, 'Кириллица запрещена')
  .test('no-profanity', 'Логин содержит недопустимые слова', (val) => val ? !filter.isProfane(val) : true)
  .required('Обязательное поле');

export const passwordYup = Yup.string()
  .min(8, 'Пароль должен быть не меньше 8 символов')
  .max(100, 'Пароль слишком длинный')
  .matches(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную латинскую букву')
  .matches(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную латинскую букву')
  .matches(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
  .matches(passwordSpecialCharRegex, 'Пароль должен содержать хотя бы один специальный символ (@, $, !, %, *, ?, &, #)')
  .matches(noCyrillicRegex, 'Кириллица запрещена')
  .test('no-profanity', 'Пароль содержит недопустимые слова', (val) => val ? !filter.isProfane(val) : true)
  .required('Обязательное поле'); 
