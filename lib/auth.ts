const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export function isAdminUser(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId)
}
