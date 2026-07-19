import { Request } from 'express';

export function getClientIp(request?: Request): string {
  const cloudflareIp = request?.header('cf-connecting-ip');
  if (cloudflareIp) {
    return normalizeIp(cloudflareIp);
  }

  const realIp = request?.header('x-real-ip');
  if (realIp) {
    return normalizeIp(realIp);
  }

  const forwardedFor = request?.header('x-forwarded-for');
  if (forwardedFor) {
    return normalizeIp(forwardedFor.split(',')[0]);
  }

  return normalizeIp(
    request?.ip ||
      request?.socket?.remoteAddress ||
      request?.connection?.remoteAddress ||
      'unknown',
  );
}

function normalizeIp(ip: string): string {
  return ip.trim().replace(/^::ffff:/, '');
}
