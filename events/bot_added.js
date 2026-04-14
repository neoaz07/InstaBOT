const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: {
    name: 'bot_added',
    description: 'Introduction message when the bot is added to a new group'
  },

  async run(bot, data) {
    try {
      const { api } = bot;
      const { threadID, addedBy } = data;

      logger.info(`Bot added to new thread: ${threadID} by ${addedBy}`);

      const intro =
        `👋 Hello everyone! I'm ${config.NICK_NAME_BOT}.\n\n` +
        `Thanks for adding me to this group!\n\n` +
        `📌 Prefix: ${config.PREFIX}\n` +
        `💡 Type ${config.PREFIX}help to see all available commands.\n\n` +
        `I'm here to help — let's get started! 🚀`;

      await api.sendMessage(intro, threadID);
    } catch (error) {
      logger.error('Error in bot_added event', { error: error.message });
    }
  }
};
