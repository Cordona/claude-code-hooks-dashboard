// OIDC Configuration for Keycloak integration

// Environment variables with fallback defaults
const KEYCLOAK_BASE_URL = import.meta.env.VITE_KEYCLOAK_BASE_URL ?? 'https://localhost:8443'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'claude-code-hooks'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'claude-code-hooks-client'
const FRONTEND_URL = window.location.origin

export const oidcConfig = {
  // Keycloak OIDC discovery endpoint
  authority: `${KEYCLOAK_BASE_URL}/realms/${REALM}`,
  
  // Client configuration
  client_id: CLIENT_ID,
  redirect_uri: `${FRONTEND_URL}/auth/callback`,
  post_logout_redirect_uri: FRONTEND_URL,
  
  // OAuth2/OIDC settings
  response_type: 'code',
  scope: 'openid profile email',
  
  // PKCE (Proof Key for Code Exchange) - enabled by default in react-oidc-context
  // This provides additional security for public clients
  
  // Silent renew settings
  automaticSilentRenew: true,
  silent_redirect_uri: `${FRONTEND_URL}/silent-renew.html`,
  
  // Additional security settings
  loadUserInfo: true,
  revokeAccessTokenOnSignout: true,
  
  // Development settings
  monitorSession: true,
  checkSessionInterval: 10000, // Check session every 10 seconds
  
  // Error handling - callback is handled automatically by react-oidc-context
}