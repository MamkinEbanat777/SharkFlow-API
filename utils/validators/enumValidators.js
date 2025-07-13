import { UserRole, Status, Priority } from '@prisma/client';

/**
 * Валидация роли пользователя
 * @param {string} role - Роль для валидации
 * @returns {Object} Результат валидации
 * @returns {boolean} returns.isValid - Валидность значения
 * @returns {string} [returns.error] - Сообщение об ошибке
 * @returns {string} [returns.value] - Валидное значение
 */
export const validateUserRole = (role) => {
  if (!role) {
    return { isValid: false, error: 'Роль обязательна' };
  }
  
  if (typeof role !== 'string') {
    return { isValid: false, error: 'Роль должна быть строкой' };
  }
  
  if (!Object.values(UserRole).includes(role)) {
    return { 
      isValid: false, 
      error: `Роль должна быть одной из: ${Object.values(UserRole).join(', ')}` 
    };
  }
  
  return { isValid: true, value: role };
};

/**
 * Валидация статуса задачи
 * @param {string|null|undefined} status - Статус для валидации
 * @returns {Object} Результат валидации
 * @returns {boolean} returns.isValid - Валидность значения
 * @returns {string} [returns.error] - Сообщение об ошибке
 * @returns {string|null} [returns.value] - Валидное значение
 */
export const validateTaskStatus = (status) => {
  if (status === null || status === undefined) {
    return { isValid: true, value: null };
  }
  
  if (typeof status !== 'string') {
    return { isValid: false, error: 'Статус должен быть строкой' };
  }
  
  if (!Object.values(Status).includes(status)) {
    return { 
      isValid: false, 
      error: `Статус должен быть одним из: ${Object.values(Status).join(', ')}` 
    };
  }
  
  return { isValid: true, value: status };
};

/**
 * Валидация приоритета задачи
 * @param {string|null|undefined} priority - Приоритет для валидации
 * @returns {Object} Результат валидации
 * @returns {boolean} returns.isValid - Валидность значения
 * @returns {string} [returns.error] - Сообщение об ошибке
 * @returns {string|null} [returns.value] - Валидное значение
 */
export const validateTaskPriority = (priority) => {
  if (priority === null || priority === undefined) {
    return { isValid: true, value: null };
  }
  
  if (typeof priority !== 'string') {
    return { isValid: false, error: 'Приоритет должен быть строкой' };
  }
  
  if (!Object.values(Priority).includes(priority)) {
    return { 
      isValid: false, 
      error: `Приоритет должен быть одним из: ${Object.values(Priority).join(', ')}` 
    };
  }
  
  return { isValid: true, value: priority };
};

/**
 * Валидация всех enum'ов в одном месте
 * @param {Object} data - Данные для валидации
 * @param {string} [data.role] - Роль пользователя
 * @param {string|null} [data.status] - Статус задачи
 * @param {string|null} [data.priority] - Приоритет задачи
 * @returns {{isValid: boolean, errors: string[], data: Object}} Результат валидации
 */
export const validateEnumData = (data) => {
  const errors = [];
  const validatedData = {};

  if (data.role !== undefined) {
    const roleValidation = validateUserRole(data.role);
    if (!roleValidation.isValid) {
      errors.push(roleValidation.error);
    } else {
      validatedData.role = roleValidation.value;
    }
  }

  if (data.status !== undefined) {
    const statusValidation = validateTaskStatus(data.status);
    if (!statusValidation.isValid) {
      errors.push(statusValidation.error);
    } else {
      validatedData.status = statusValidation.value;
    }
  }

  if (data.priority !== undefined) {
    const priorityValidation = validateTaskPriority(data.priority);
    if (!priorityValidation.isValid) {
      errors.push(priorityValidation.error);
    } else {
      validatedData.priority = priorityValidation.value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData,
  };
}; 