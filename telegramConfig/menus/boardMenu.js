import menuPkg from 'telegraf-inline-menu';
import { boardsHandler } from '../handlers/boards/boardsHandler.js';
import withAuth from '../withAuth.js';

const { MenuTemplate, MenuMiddleware } = menuPkg;

const boardTemplate = new MenuTemplate(() => 'Меню досок');

boardTemplate.interact('📋 Показать все доски', 'allBoards', {
  do: withAuth(boardsHandler),
});

export default function registerBoardMenu(bot) {
  const middleware = new MenuMiddleware('boards/', boardTemplate);
  bot.use(middleware.middleware());
}
