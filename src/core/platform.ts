/** Apple platforms (macOS, iOS, iPadOS): Cmd is the command key and Option types characters. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ios/i.test(platform ?? '');
}
