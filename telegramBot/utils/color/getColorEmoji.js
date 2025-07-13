/**
 * @module telegramBot/utils/color/getColorEmoji
 * @description Утилиты для работы с цветами и эмодзи в Telegram боте.
 */
const colorEmojiMap = {
  '#ff0000': '🔴', 
  '#00ff00': '🟢', 
  '#0000ff': '🔵', 
  '#ff00ff': '💜', 
  '#00ffff': '🟦', 
  '#000000': '⚫',  
  '#808080': '⚪', 
  '#ffa500': '🟠', 
  '#800080': '🟣', 
  '#ffff00': '🟡', 
  '#008000': '🟢', 
};

export function getColorEmoji(hex) {
  return colorEmojiMap[hex.toLowerCase()] || '⚪';
}
