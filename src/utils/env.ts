/**
 * Type-safe environment variable handling
 * Provides typed access to Vite environment variables with proper defaults
 */

/**
 * Environment variable configuration with types and defaults
 */
interface EnvironmentConfig {
    readonly BACKEND_BASE_URL: string
    readonly USER_INITIALIZE_PATH: string
    readonly SSE_CONNECT_ENDPOINT: string
    readonly SSE_DISCONNECT_ENDPOINT: string
    readonly API_KEY_GENERATE_PATH: string
    readonly API_KEY_LIST_PATH: string
    readonly API_KEY_MANAGE_PATH: string
    readonly KEYCLOAK_BASE_URL: string
    readonly KEYCLOAK_REALM: string
    readonly KEYCLOAK_CLIENT_ID: string
    readonly APP_NAME: string
    readonly APP_VERSION: string
    readonly ENABLE_DEVTOOLS: boolean
    readonly ENABLE_MSW: boolean
}

/**
 * Default values for environment variables
 */
const ENV_DEFAULTS = {
    BACKEND_BASE_URL: 'http://localhost:8085',
    USER_INITIALIZE_PATH: '/api/v1/claude-code/user/initialize',
    SSE_CONNECT_ENDPOINT: '/api/v1/claude-code/hooks/events/stream/connect',
    SSE_DISCONNECT_ENDPOINT: '/api/v1/claude-code/hooks/events/stream/disconnect',
    API_KEY_GENERATE_PATH: '/api/v1/claude-code/developer/api-key/generate',
    API_KEY_LIST_PATH: '/api/v1/claude-code/user/api-keys',
    API_KEY_MANAGE_PATH: '/api/v1/claude-code/user/api-key',
    KEYCLOAK_BASE_URL: 'https://localhost:8443',
    KEYCLOAK_REALM: 'claude-code-hooks',
    KEYCLOAK_CLIENT_ID: 'claude-code-hooks-frontend',
    APP_NAME: 'Claude Code Hooks Dashboard',
    APP_VERSION: '0.1.0',
    ENABLE_DEVTOOLS: true,
    ENABLE_MSW: false,
} as const

/**
 * Parse string environment variable to boolean
 * @param value - String value from environment
 * @param defaultValue - Default boolean value
 * @returns Parsed boolean value
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue
    return value.toLowerCase() === 'true'
}

/**
 * Get type-safe environment variable value
 * @param key - Environment variable key (without VITE_ prefix)
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
const getEnvVar = <T>(key: string, defaultValue: T): T => {
    const value = import.meta.env[`VITE_${key}`]

    if (value === undefined) {
        return defaultValue
    }

    // Handle boolean conversion
    if (typeof defaultValue === 'boolean') {
        return parseBoolean(value, defaultValue) as T
    }

    return value as T
}

/**
 * Type-safe environment configuration
 * All environment variables with proper typing and defaults
 */
export const env: EnvironmentConfig = {
    BACKEND_BASE_URL: getEnvVar('BACKEND_BASE_URL', ENV_DEFAULTS.BACKEND_BASE_URL),
    USER_INITIALIZE_PATH: getEnvVar('USER_INITIALIZE_PATH', ENV_DEFAULTS.USER_INITIALIZE_PATH),
    SSE_CONNECT_ENDPOINT: getEnvVar('SSE_CONNECT_ENDPOINT', ENV_DEFAULTS.SSE_CONNECT_ENDPOINT),
    SSE_DISCONNECT_ENDPOINT: getEnvVar('SSE_DISCONNECT_ENDPOINT', ENV_DEFAULTS.SSE_DISCONNECT_ENDPOINT),
    API_KEY_GENERATE_PATH: getEnvVar('API_KEY_GENERATE_PATH', ENV_DEFAULTS.API_KEY_GENERATE_PATH),
    API_KEY_LIST_PATH: getEnvVar('API_KEY_LIST_PATH', ENV_DEFAULTS.API_KEY_LIST_PATH),
    API_KEY_MANAGE_PATH: getEnvVar('API_KEY_MANAGE_PATH', ENV_DEFAULTS.API_KEY_MANAGE_PATH),
    KEYCLOAK_BASE_URL: getEnvVar('KEYCLOAK_BASE_URL', ENV_DEFAULTS.KEYCLOAK_BASE_URL),
    KEYCLOAK_REALM: getEnvVar('KEYCLOAK_REALM', ENV_DEFAULTS.KEYCLOAK_REALM),
    KEYCLOAK_CLIENT_ID: getEnvVar('KEYCLOAK_CLIENT_ID', ENV_DEFAULTS.KEYCLOAK_CLIENT_ID),
    APP_NAME: getEnvVar('APP_NAME', ENV_DEFAULTS.APP_NAME),
    APP_VERSION: getEnvVar('APP_VERSION', ENV_DEFAULTS.APP_VERSION),
    ENABLE_DEVTOOLS: getEnvVar('ENABLE_DEVTOOLS', ENV_DEFAULTS.ENABLE_DEVTOOLS),
    ENABLE_MSW: getEnvVar('ENABLE_MSW', ENV_DEFAULTS.ENABLE_MSW),
} as const

/**
 * Construct full SSE endpoint URL
 * @returns Complete SSE endpoint URL
 */
export const getSSEEndpoint = (): string => {
    return env.BACKEND_BASE_URL + env.SSE_CONNECT_ENDPOINT
}

/**
 * Construct full user initialization endpoint URL
 * @returns Complete user initialization endpoint URL
 */
export const getUserInitializeEndpoint = (): string => {
    return env.BACKEND_BASE_URL + env.USER_INITIALIZE_PATH
}

/**
 * Construct full SSE disconnect endpoint URL
 * @param connectionId - The connection ID to disconnect
 * @returns Complete SSE disconnect endpoint URL
 */
export const getSSEDisconnectEndpoint = (connectionId: string): string => {
    return env.BACKEND_BASE_URL + env.SSE_DISCONNECT_ENDPOINT + '/' + connectionId
}