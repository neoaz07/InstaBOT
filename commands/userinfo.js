module.exports = {
  config: {
    name: 'userinfo',
    aliases: ['uinfo', 'profile', 'iginfo'],
    description: 'Get detailed Instagram user information',
    usage: 'userinfo <username>',
    cooldown: 10,
    role: 0,
    author: 'NeoKEX',
    category: 'utility'
  },

  async run({ api, event, args, bot, logger }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '❌ Please provide a username!\n\n' +
          'Usage: userinfo <username>\n' +
          'Example: userinfo instagram',
          event.threadId
        );
      }

      const username = args[0].replace('@', '').trim();

      if (!username) {
        return api.sendMessage('❌ Please provide a valid username!', event.threadId);
      }

      await api.sendMessage(`🔍 Fetching detailed information for @${username}...`, event.threadId);

      try {
        const userInfo = await bot.ig.getUserInfoByUsername(username);

        if (!userInfo) {
          return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
        }

        const userId       = userInfo.userID || userInfo.userId;
        const fullName     = userInfo.fullName || 'N/A';
        const bio          = userInfo.bio || 'No bio';
        const isPrivate    = userInfo.isPrivate ? '🔒 Private' : '🔓 Public';
        const isVerified   = userInfo.isVerified ? '✅ Verified' : '❌ Not Verified';
        const followers    = userInfo.followerCount ? userInfo.followerCount.toLocaleString() : 'N/A';
        const following    = userInfo.followingCount ? userInfo.followingCount.toLocaleString() : 'N/A';
        const posts        = userInfo.mediaCount ? userInfo.mediaCount.toLocaleString() : 'N/A';

        let message = `Instagram User Info\n\n`;
        message += `👤 Username: @${username}\n`;
        message += `🆔 User ID: ${userId}\n`;
        message += `📝 Full Name: ${fullName}\n`;
        message += `${isPrivate}\n`;
        message += `${isVerified}\n\n`;
        message += `📊 Statistics:\n`;
        message += `  • Posts: ${posts}\n`;
        message += `  • Followers: ${followers}\n`;
        message += `  • Following: ${following}\n\n`;
        message += `📖 Bio:\n${bio}\n\n`;
        message += `🔗 Profile: https://instagram.com/${username}`;

        return api.sendMessage(message, event.threadId);

      } catch (searchError) {
        logger.error('Error in userinfo command (search)', { error: searchError.message });
        return api.sendMessage(
          `❌ Error fetching user information for @${username}\n\n` +
          'This could be due to:\n' +
          '• User not found\n' +
          '• Account is private\n' +
          '• Instagram API rate limit\n' +
          '• Network error',
          event.threadId
        );
      }

    } catch (error) {
      logger.error('Error in userinfo command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error executing userinfo command.', event.threadId);
    }
  }
};
