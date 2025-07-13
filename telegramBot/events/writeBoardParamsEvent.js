/**
 * @module telegramBot/events/writeBoardParams
 * @description Событие записи параметров доски в Telegram боте.
 */
import send from '../send.js';
import { Markup } from 'telegraf';
import {
  getBoardCreationData,
  setBoardCreationState,
  setBoardTitle,
} from '../store/tempBoardCreateStore.js';

export default function registerWriteBoardParamsEvent(bot) {
  bot.on('text', async (ctx) => {
    const userUuid = ctx.state.user?.uuid;
    const temp = getBoardCreationData(userUuid);

    if (temp?.state === 'awaiting_title') {
      setBoardTitle(userUuid, ctx.message.text);
      setBoardCreationState(userUuid, 'awaiting_color');

      const colors = ['🔴', '🟢', '🔵', '🟡', '🟣', '⚫️'];
      const keyboard = Markup.inlineKeyboard(
        colors.map((emoji) =>
          Markup.button.callback(emoji, `choose_color_${emoji}`),
        ),
        { columns: 3 },
      );

      return send(ctx, 'Выберите цвет доски:', keyboard);
    }
  });
}
