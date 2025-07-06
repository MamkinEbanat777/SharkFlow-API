---
sidebar_position: 1
title: Helpers API Documentation
description: Автогенерированная документация из JSDoc комментариев
---

# TaskFlow Helpers API

Документация автоматически сгенерирована из JSDoc комментариев в коде.

## 📚 Доступные модули

### 🔐 Аутентификация
- **[authHelpers.js](/jsdoc/authHelpers.js.html)** - Работа с токенами, IP адресами, cookies
- **[googleOAuthHelpers.js](/jsdoc/googleOAuthHelpers.js.html)** - Google OAuth интеграция
- **[totpHelpers.js](/jsdoc/totpHelpers.js.html)** - TOTP двухфакторная аутентификация

### 👤 Пользователи
- **[userHelpers.js](/jsdoc/userHelpers.js.html)** - Поиск и валидация пользователей
- **[avatarHelpers.js](/jsdoc/avatarHelpers.js.html)** - Работа с аватарами пользователей

### 📋 Контент
- **[boardHelpers.js](/jsdoc/boardHelpers.js.html)** - Управление досками
- **[taskHelpers.js](/jsdoc/taskHelpers.js.html)** - Управление задачами

### 🔑 Подтверждения
- **[confirmationHelpers.js](/jsdoc/confirmationHelpers.js.html)** - Коды подтверждения
- **[validateConfirmationCode.js](/jsdoc/validateConfirmationCode.js.html)** - Валидация кодов
- **[sendUserConfirmationCode.js](/jsdoc/sendUserConfirmationCode.js.html)** - Отправка кодов

### 📤 Загрузка
- **[uploadAvatarAndUpdateUser.js](/jsdoc/uploadAvatarAndUpdateUser.js.html)** - Загрузка аватаров в Cloudinary

## 🚀 Быстрый доступ

<div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px'}}>

<a href="/jsdoc/userHelpers.js.html" style={{
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '14px'
}}>
👤 User Helpers
</a>

<a href="/jsdoc/authHelpers.js.html" style={{
  padding: '10px 15px',
  backgroundColor: '#28a745',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '14px'
}}>
🔐 Auth Helpers
</a>

<a href="/jsdoc/googleOAuthHelpers.js.html" style={{
  padding: '10px 15px',
  backgroundColor: '#dc3545',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '14px'
}}>
🌐 Google OAuth
</a>

<a href="/jsdoc/boardHelpers.js.html" style={{
  padding: '10px 15px',
  backgroundColor: '#ffc107',
  color: 'black',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '14px'
}}>
📋 Board Helpers
</a>

<a href="/jsdoc/taskHelpers.js.html" style={{
  padding: '10px 15px',
  backgroundColor: '#17a2b8',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontSize: '14px'
}}>
✅ Task Helpers
</a>

</div>

## 📖 Как использовать

1. **Кликни на любой модуль** выше для просмотра полной документации
2. **JSDoc автоматически показывает:**
   - Описание каждой функции
   - Параметры и их типы
   - Возвращаемые значения
   - Примеры использования
   - Связанные функции

## 🔄 Автообновление

Документация автоматически обновляется при изменении JSDoc комментариев в коде. Для обновления:

```bash
# В корне проекта
jsdoc utils/helpers/ -d docs/jsdoc

# Затем перезапустить Docusaurus
cd docs-site && npm start
```

---

*Документация сгенерирована из JSDoc комментариев в `utils/helpers/`* 