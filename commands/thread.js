module.exports = {
  config: {
    name: 'thread',
    aliases: ['gc', 'group'],
    description: 'Manage thread-level settings — ban, unban, prefix, info',
    usage: 'thread <info|ban|unban|prefix <value>|resetprefix>',
    role: 2,
    cooldown: 3,
    category: 'admin'
  },

  async run({ api, event, args, config, database, logger }) {
    if (args.length === 0) return this.showInfo(api, event, database, config);

    const action = args[0].toLowerCase();

    if (action === 'info') return this.showInfo(api, event, database, config);

    if (action === 'ban') return this.banThread(api, event, args, database, logger);

    if (action === 'unban') return this.unbanThread(api, event, args, database, logger);

    if (action === 'prefix') {
      if (!args[1]) return api.sendMessage('⚠️ Usage: thread prefix <value>', event.threadId);
      return this.setPrefix(api, event, args[1], database, config);
    }

    if (action === 'resetprefix') return this.resetPrefix(api, event, database, config);

    if (action === 'banned') return this.listBanned(api, event, database);

    return api.sendMessage(
      '🔧 Thread Commands\n\n' +
      '• thread info — show this thread\'s settings\n' +
      '• thread ban [id] — ban a thread (default: current)\n' +
      '• thread unban <id> — unban a thread\n' +
      '• thread banned — list all banned threads\n' +
      '• thread prefix <value> — set custom prefix for this thread\n' +
      '• thread resetprefix — reset to global prefix',
      event.threadId
    );
  },

  showInfo(api, event, database, config) {
    const td = database.getThreadData(event.threadId);
    const isBanned = td.settings?.banned === true;
    const prefix = td.prefix || config.PREFIX;

    return api.sendMessage(
      `🗂️ Thread Info\n\n` +
      `ID:      ${event.threadId}\n` +
      `Prefix:  ${prefix}${td.prefix ? ' (custom)' : ' (global)'}\n` +
      `Banned:  ${isBanned ? '🚫 Yes' : '✅ No'}\n` +
      `Created: ${td.createdAt ? new Date(td.createdAt).toLocaleString() : 'N/A'}`,
      event.threadId
    );
  },

  banThread(api, event, args, database, logger) {
    const targetId = args[1] || event.threadId;
    const td = database.getThreadData(targetId);

    if (td.settings?.banned) {
      return api.sendMessage(`ℹ️ Thread ${targetId} is already banned.`, event.threadId);
    }

    database.setThreadData(targetId, { settings: { ...td.settings, banned: true } });
    database.save();
    logger.info(`Thread ${targetId} banned by ${event.senderID}`);
    return api.sendMessage(`🚫 Thread ${targetId} has been banned from using the bot.`, event.threadId);
  },

  unbanThread(api, event, args, database, logger) {
    const targetId = args[1];
    if (!targetId) return api.sendMessage('⚠️ Usage: thread unban <threadID>', event.threadId);

    const td = database.getThreadData(targetId);
    if (!td.settings?.banned) {
      return api.sendMessage(`ℹ️ Thread ${targetId} is not currently banned.`, event.threadId);
    }

    const settings = { ...td.settings, banned: false };
    database.setThreadData(targetId, { settings });
    database.save();
    logger.info(`Thread ${targetId} unbanned by ${event.senderID}`);
    return api.sendMessage(`✅ Thread ${targetId} has been unbanned.`, event.threadId);
  },

  listBanned(api, event, database) {
    const banned = Object.values(database.data.threads)
      .filter(t => t.settings?.banned === true)
      .map(t => t.id);

    if (banned.length === 0) return api.sendMessage('ℹ️ No threads are currently banned.', event.threadId);
    return api.sendMessage(`🚫 Banned Threads (${banned.length}):\n\n${banned.join('\n')}`, event.threadId);
  },

  setPrefix(api, event, value, database, config) {
    if (value.length > 10) return api.sendMessage('⚠️ Prefix must be 10 characters or less.', event.threadId);
    database.setThreadData(event.threadId, { prefix: value });
    database.save();
    return api.sendMessage(`✅ Thread prefix set to: ${value}\n\nGlobal prefix is still: ${config.PREFIX}`, event.threadId);
  },

  resetPrefix(api, event, database, config) {
    database.setThreadData(event.threadId, { prefix: null });
    database.save();
    return api.sendMessage(`✅ Thread prefix reset to global default: ${config.PREFIX}`, event.threadId);
  }
};
