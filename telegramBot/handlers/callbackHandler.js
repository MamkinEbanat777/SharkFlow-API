import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';
import { showProfileHandler } from './users/showProfileHandler.js';
import { getBoardsHandler } from './boards/getBoardsHandler.js';
import { logoutHandler } from './users/logoutHandler.js';
import { mainMenuHandler } from './mainMenuHandler.js';
import { showHelpHandler } from './users/showHelpHandler.js';
import send from '../send.js';
import { createBoardsHandler } from './boards/createBoardHandler.js';

/**
 * Регистрация экшенов
 * @param {string} ctx - контекст от TG
 * @returns {void} - ничего
 * @example
 * bot.on('callback_query', callbackHandler);
 * В данной функции необходимо регистрировать новые экшены для вызова по нажатию на кнопки
 * Пример вызова в кнопке:
 * @example
 * Markup.button.callback('👤 Мой профиль', 'show_profile'),
 * Затем внутри case вызываем миддлварь для защищенных экшенов и после вызываем хендлер содержащий логику вызова
 */
export async function callbackHandler(ctx) {
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) {
    return;
  }

  await ctx.answerCbQuery();

  switch (callbackData) {
    case 'show_profile':
      await authenticateTelegramMiddleware(ctx, async () => {
        await showProfileHandler(ctx);
      });
      break;

    case 'show_boards':
      await authenticateTelegramMiddleware(ctx, async () => {
        await getBoardsHandler(ctx);
      });
      break;

    case 'create_board':
      await authenticateTelegramMiddleware(ctx, async () => {
        await createBoardsHandler(ctx);
      });
      break;

    case 'logout':
      await authenticateTelegramMiddleware(ctx, async () => {
        await logoutHandler(ctx);
      });
      break;

    case 'back_to_main':
      await authenticateTelegramMiddleware(ctx, async () => {
        await mainMenuHandler(ctx);
      });
      break;

    case 'help':
      await showHelpHandler(ctx);
      break;

    default:
      await send(ctx, '❌ Неизвестная команда');
  }
}
