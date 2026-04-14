const ConfigManager = require('./configManager');
const logger = require('./logger');

/**
 * Role System
 * ──────────────────────────────────────────────────────────────────────
 * 0  Normal User      — everyone
 * 1  Group Admin      — thread-level admin (checked via threadInfo)
 * 2  Bot Admin        — adminBot list  (2nd highest, powerful)
 * 3  Premium User     — premiumUsers list (access to premium commands)
 * 4  Bot Developer    — devUsers list  (highest, full access)
 *
 * hasPermission matrix (✓ = can use command of that role):
 *            req 0  req 1  req 2  req 3  req 4
 *  Role 0      ✓
 *  Role 1      ✓      ✓
 *  Role 2      ✓      ✓      ✓      ✓
 *  Role 3      ✓      ✓             ✓
 *  Role 4      ✓      ✓      ✓      ✓      ✓
 * ──────────────────────────────────────────────────────────────────────
 */

class PermissionManager {
  /**
   * Check whether a user is a thread-level admin.
   * threadInfo should be the object returned by getThreadInfo / api.getThread().
   * It may contain adminIDs (array of {uid}) or participantsAddedBy etc.
   */
  static isGroupAdmin(userId, threadInfo) {
    if (!threadInfo) return false;
    const uid = String(userId);

    // Standard fca/nkxica adminIDs field
    if (Array.isArray(threadInfo.adminIDs)) {
      return threadInfo.adminIDs.some(a =>
        (typeof a === 'object' ? String(a.uid || a.id || '') : String(a)) === uid
      );
    }

    // Alternative: adminParticipants array
    if (Array.isArray(threadInfo.adminParticipants)) {
      return threadInfo.adminParticipants.some(a => String(a.userID || a.uid || a) === uid);
    }

    return false;
  }

  /**
   * Get the user's global role (ignores thread-level role 1).
   * Returns 4 | 3 | 2 | 0
   */
  static getGlobalRole(userId) {
    const uid = String(userId);
    if (ConfigManager.getDevUsers().includes(uid))     return 4;
    if (ConfigManager.getAdmins().includes(uid))       return 2;
    if (ConfigManager.getPremiumUsers().includes(uid)) return 3;
    return 0;
  }

  /**
   * Get the user's effective role in a given thread.
   * Returns 4 | 3 | 2 | 1 | 0
   */
  static getUserRole(userId, threadInfo = null) {
    const globalRole = this.getGlobalRole(userId);
    if (globalRole !== 0) return globalRole;           // already has a global role
    if (this.isGroupAdmin(userId, threadInfo)) return 1;
    return 0;
  }

  /**
   * Check whether the user meets the required role.
   * @param {string} userId
   * @param {number} requiredRole  0–4
   * @param {Object|null} threadInfo  thread object from getThreadInfo (needed for role 1)
   */
  static async hasPermission(userId, requiredRole = 0, threadInfo = null) {
    if (requiredRole === 0) return true;

    const globalRole = this.getGlobalRole(userId);

    // Developer (4) can do everything
    if (globalRole === 4) return true;

    switch (requiredRole) {
      case 1:
        // group admin, bot admin, or dev
        return globalRole === 2 || globalRole === 3 || this.isGroupAdmin(userId, threadInfo);

      case 2:
        // bot admin or dev only
        return globalRole === 2;

      case 3:
        // premium, bot admin, or dev
        return globalRole === 3 || globalRole === 2;

      case 4:
        // dev only (already handled above)
        return false;

      default:
        return false;
    }
  }

  /** Human-readable role name */
  static getRoleName(role) {
    return {
      0: 'Normal User',
      1: 'Group Administrator',
      2: 'Bot Admin',
      3: 'Premium User',
      4: 'Bot Developer'
    }[role] ?? 'Unknown';
  }

  /**
   * True when the user may run commands without the prefix.
   * (noPrefix applies to Bot Admins (2) and Developers (4))
   */
  static canUseNoPrefix(userId) {
    const g = this.getGlobalRole(userId);
    return g === 2 || g === 4;
  }
}

module.exports = PermissionManager;
