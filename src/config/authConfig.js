import { appRedirectPath } from '../utils/appUrl';

export const GITHUB_OAUTH_CLIENT_ID = 'TODO_REPLACE_WITH_REAL_GITHUB_CLIENT_ID'; // TODO: replace with real GitHub OAuth App client_id

export const GITHUB_OAUTH_SCOPE = 'read:user user:email';

const AUTH_ROUTES = {
  login: '/auth/student/login',
  signup: '/auth/student/signup',
};

export function getAuthRedirectUri(route = AUTH_ROUTES.login) {
  return appRedirectPath(route);
}

export function buildGithubOAuthUrl({ mode = 'login' } = {}) {
  const route = mode === 'signup' ? AUTH_ROUTES.signup : AUTH_ROUTES.login;
  const state = `${mode}-${Date.now()}`;
  const redirectUri = getAuthRedirectUri(route);
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: GITHUB_OAUTH_SCOPE,
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function getGithubCallbackPayload(search) {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  return {
    code,
    state,
    error,
    hasCallback: Boolean(code || error),
  };
}
