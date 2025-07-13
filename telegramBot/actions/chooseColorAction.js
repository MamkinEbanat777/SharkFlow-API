/**
 * @module telegramBot/actions/chooseColor
 * @description Действие выбора цвета в Telegram боте.
 */
import {
  getBoardCreationData,
  clearBoardCreation,
} from '../../../store/tempBoardCreationStore.js';
import { createBoard } from '../../../utils/helpers/boardHelpers.js';
import send from '../../send.js';
import { logTelegramCommandError } from '../../utils/loggers/telegramLoggers.js';

export default function registerChooseColorAction(bot) {
  bot.action(/^choose_color_(.+)/, async (ctx) => {
    const user = ctx.state.user;
    const userUuid = user?.uuid;
    const colorEmoji = ctx.match[1];

    const temp = getBoardCreationData(userUuid);

    if (!temp?.title) {
      return send(ctx, '⚠️ Что-то пошло не так. Попробуйте сначала.');
    }

    try {
      await createBoard({
        userUuid,
        title: temp.title,
        color: colorEmoji,
      });

      clearBoardCreation(userUuid);

      await ctx.answerCbQuery();
      await send(ctx, `✅ Доска <b>${temp.title}</b> создана с цветом ${colorEmoji}`);

      const { getBoardsHandler } = await import('./getBoardsHandler.js');
      await getBoardsHandler(ctx);
    } catch (err) {
      logTelegramCommandError('createBoard', userUuid, err);
      await ctx.answerCbQuery('❌ Ошибка при создании доски');
    }
  });
}
