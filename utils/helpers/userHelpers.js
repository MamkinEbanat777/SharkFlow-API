import prisma from '../prismaConfig/prismaClient.js';

export const findUserByUuid = async (uuid, select = {}) => {
  return await prisma.user.findFirst({
    where: { uuid, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

export const findUserByEmail = async (email, select = {}) => {
  return await prisma.user.findFirst({
    where: { email, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

export const findUserByGoogleSub = async (googleSub, select = {}) => {
  return await prisma.user.findFirst({
    where: { googleSub, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
}; 