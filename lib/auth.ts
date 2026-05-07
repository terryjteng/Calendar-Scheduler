const HARDCODED_ADMINS = ['user_3DNFSdrLxN0nAcRZLe3JGHxzHAT']
const ENV_ADMINS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)
const ALL_ADMINS = [...new Set([...HARDCODED_ADMINS, ...ENV_ADMINS])]

export function isAdminUser(userId: string): boolean {
  return ALL_ADMINS.includes(userId)
}
