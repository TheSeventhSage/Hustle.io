import { storage } from '../../services/storage.js'

export function mergeStoredUser(user) {
  const storedUser = storage.getUser()

  if (!storedUser) return user ?? null
  if (!user) return storedUser

  return {
    ...storedUser,
    ...user,
    first_name: user.first_name ?? storedUser.first_name,
    last_name: user.last_name ?? storedUser.last_name,
    email: user.email ?? storedUser.email,
    company_name: user.company_name ?? storedUser.company_name,
    avatar: user.avatar ?? storedUser.avatar,
  }
}
