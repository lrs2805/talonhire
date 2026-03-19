const rateLimitMap = new Map<string, number[]>()

export function rateLimit(ip: string, maxReq = 30, windowMs = 60000): boolean {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => now - t < windowMs)
  if (timestamps.length >= maxReq) return false
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}
