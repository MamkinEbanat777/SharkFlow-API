import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { DefaultAuthProvider } from 'adminjs';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { resourceOptions } from '#config/resourceOptions.js';
import bcrypt from 'bcrypt';
import { modelNames } from '#config/modelNames.js';
import {
  logAdminInfo,
  logAdminWarn,
  logAdminSecurity,
} from './utils/loggers/adminLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import {
  RedisStore,
  redisClient,
  connectRedis,
} from '#config/tcpRedisConfig.js';

if (process.env.NODE_ENV === 'production') {
  await connectRedis();
}

AdminJS.registerAdapter({ Database, Resource });

const resources = modelNames.map((name) => ({
  resource: { model: getModelByName(name), client: prisma },
  options: resourceOptions[name] || {},
}));

const adminJs = new AdminJS({
  resources,
  rootPath: '/admin',
  branding: {
    companyName: 'SharkFlow Admin',
    softwareBrothers: false,
    logo: '/admin/logo.png',
    favicon: '/admin/favicon.png',
  },
  dashboard: {
    component: false,
  },
  assets: {
    styles: ['/admin/admin.css'],
  },
});

const authenticate = async ({ email, password }, ctx) => {
  const req = ctx?.req;
  const { ipAddress, userAgent } = getRequestInfo(req);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logAdminSecurity(
        'unknown',
        ipAddress,
        `Попытка входа с несуществующим email: ${email}`,
        userAgent,
      );
      return null;
    }

    if (user.role !== 'admin') {
      logAdminWarn(
        'loginDenied',
        `Попытка входа с email ${email} без прав admin (роль: ${user.role})`,
        ipAddress,
        userAgent,
      );
      logAdminSecurity(
        user.uuid,
        ipAddress,
        `Попытка входа без прав admin (роль: ${user.role})`,
        userAgent,
      );
      return null;
    }

    if (!user.password) {
      logAdminWarn(
        'loginDenied',
        `У пользователя ${email} отсутствует пароль`,
        ipAddress,
        userAgent,
      );
      logAdminSecurity(
        user.uuid,
        ipAddress,
        `Попытка входа без пароля`,
        userAgent,
      );
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logAdminWarn(
        'loginDenied',
        `Неверный пароль для email ${email}`,
        ipAddress,
        userAgent,
      );
      logAdminSecurity(user.uuid, ipAddress, `Неверный пароль`, userAgent);
      return null;
    }

    logAdminInfo(
      'login',
      `Успешный вход: ${email} (${user.uuid})`,
      ipAddress,
      userAgent,
    );
    return { email: user.email, id: user.id, role: user.role };
  } catch (err) {
    logAdminWarn(
      'loginError',
      `Ошибка при попытке входа для email ${email}: ${err.message}`,
      ipAddress,
      userAgent,
    );
    return null;
  }
};

const authProvider = new DefaultAuthProvider({ authenticate });

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    cookiePassword:
      process.env.NODE_ENV === 'production'
        ? process.env.ADMIN_COOKIE_PASSWORD
        : 'supersecret-cookie-password',
    provider: authProvider,
  },
  null,
  {
    store:
      process.env.NODE_ENV === 'production'
        ? new RedisStore({ client: redisClient })
        : undefined,
    resave: false,
    saveUninitialized: true,
    secret:
      process.env.NODE_ENV === 'production'
        ? process.env.ADMIN_COOKIE_PASSWORD
        : 'supersecret-cookie-password',
    cookie: {
      maxAge:
        process.env.NODE_ENV === 'production'
          ? process.env.ADMIN_COOKIE_MAX_AGE
          : 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/admin',
    },
  },
);

export { adminJs, adminRouter };
