const logger = require('../utils/logger');
const Banner = require('../utils/banner');
const config = require('../config');

module.exports = {
  config: {
    name: 'ready',
    description: 'Fired once the bot has successfully connected to Instagram'
  },

  async run(bot, data) {
    const commandCount = bot.commandLoader.getAllCommandNames().length;
    const eventCount   = bot.eventLoader.getAllEventNames().length;

    logger.info('Bot is ready and connected!', {
      userID:   bot.userID,
      username: bot.username
    });

    Banner.startupMessage(
      bot.userID,
      bot.username,
      commandCount,
      eventCount
    );

    logger.info(
      `✅ ${config.NICK_NAME_BOT} is online — ` +
      `${commandCount} commands | ${eventCount} events | ` +
      `prefix: "${config.PREFIX}"${config.NO_PREFIX ? ' (noPrefix enabled for admins & devs)' : ''}`
    );
  }
};
