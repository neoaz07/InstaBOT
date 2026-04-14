const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: {
    name: 'gc_join',
    description: 'Welcome new members when they join a group chat'
  },

  async run(bot, data) {
    try {
      if (!config.LOG_EVENTS.event && !config.LOG_EVENTS.disableAll === false) return;

      const { api } = bot;
      const { threadID, addedParticipants, addedBy } = data;

      if (!addedParticipants || addedParticipants.length === 0) return;

      for (const participant of addedParticipants) {
        const userId   = String(participant.userFbId || participant.userId || '');
        const fullName = participant.fullName || participant.name || `User ${userId}`;

        logger.info(`New member joined thread ${threadID}: ${fullName} (${userId})`);

        const message =
          `👋 Welcome to the group, ${fullName}!\n\n` +
          `We're happy to have you here. Type ${config.PREFIX}help to see what I can do.`;

        await api.sendMessage(message, threadID);
      }
    } catch (error) {
      logger.error('Error in gc_join event', { error: error.message });
    }
  }
};
