export function getDefaultAvatar(userId: string, username: string): string {
  const charSum = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const style = charSum % 2 === 0 ? 'bottts' : 'initials'
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}`
}
