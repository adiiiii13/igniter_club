export function getAppBaseUrl() {
  const configuredUrl = import.meta.env.VITE_APP_BASE_URL;
  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.trim().replace(/\/$/, '');
  }
  return window.location.origin;
}

export function appRedirectPath(pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
