module.exports = {
  config: {
    name: 'uid',
    aliases: ['userid', 'getuid', 'id'],
    description: 'Get Instagram User ID from username',
    usage: 'uid [username]',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX',
    category: 'utility'
  },

  async run({ api, event, args, bot, logger }) {
    try {
      if (args.length === 0) {
        const senderUID = event.senderID;
        return api.sendMessage(`👤 Your User ID:\n\n🆔 ${senderUID}`, event.threadId);
      }

      const username = args[0].replace('@', '').trim();

      if (!username) {
        return api.sendMessage('❌ Please provide a valid username!\n\nUsage: uid <username>', event.threadId);
      }

      await api.sendMessage(`🔍 Searching for user: @${username}...`, event.threadId);

      try {
        const userInfo = await bot.ig.getUserInfoByUsername(username);

        if (!userInfo) {
          return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
        }

        const userId      = userInfo.userID || userInfo.userId;
        const fullName    = userInfo.fullName || 'N/A';
        const isPrivate   = userInfo.isPrivate ? '🔒 Private' : '🔓 Public';
        const isVerified  = userInfo.isVerified ? '✅ Verified' : '';
        const followers   = userInfo.followerCount ? userInfo.followerCount.toLocaleString() : 'N/A';
        const following   = userInfo.followingCount ? userInfo.followingCount.toLocaleString() : 'N/A';

        const message =
          `👤 User Information:\n\n` +
          `📝 Username: @${username}\n` +
          `🆔 User ID: ${userId}\n` +
          `👨‍💼 Full Name: ${fullName}\n` +
          `${isPrivate} ${isVerified}\n` +
          `👥 Followers: ${followers}\n` +
          `➡️ Following: ${following}`;

        return api.sendMessage(message, event.threadId);

      } catch (searchError) {
        try {
          const searchResults = await bot.ig.searchUsers(username);

          if (!searchResults || searchResults.length === 0) {
            return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
          }

          const user         = searchResults[0];
          const userId       = user.userID || user.userId;
          const fullName     = user.fullName || 'N/A';
          const actualUsername = user.username || username;
          const isPrivate    = user.isPrivate ? '🔒 Private' : '🔓 Public';
          const isVerified   = user.isVerified ? '✅ Verified' : '';

          let message =
            `👤 User Information:\n\n` +
            `📝 Username: @${actualUsername}\n` +
            `🆔 User ID: ${userId}\n` +
            `👨‍💼 Full Name: ${fullName}\n` +
            `${isPrivate} ${isVerified}`;

          if (searchResults.length > 1) {
            message += `\n\n💡 Found ${searchResults.length} matches. Showing first result.`;
          }

          return api.sendMessage(message, event.threadId);

        } catch (error2) {
          logger.error('Error in uid command (search fallback)', { error: error2.message });
          return api.sendMessage(
            `❌ Failed to find user @${username}\n\n` +
            `Possible reasons:\n` +
            `• User doesn't exist\n` +
            `• Username is incorrect\n` +
            `• Account is restricted\n\n` +
            `Error: ${error2.message}`,
            event.threadId
          );
        }
      }

    } catch (error) {
      logger.error('Error in uid command', { error: error.message, stack: error.stack });
      return api.sendMessage(
        `❌ An error occurred while fetching user ID.\n\nError: ${error.message}`,
        event.threadId
      );
    }
  }
};
