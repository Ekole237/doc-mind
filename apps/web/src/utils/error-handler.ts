import type { ApiError } from '@/types'

export class ErrorHandler {
  static getMessage(error: any): string {
    // Si c'est déjà une ApiError structurée
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message
    }

    // Gestion des erreurs réseau
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
      return 'Erreur de connexion au serveur. Vérifiez votre connexion internet et réessayez.'
    }

    if (error?.code === 'ECONNABORTED' || error?.code === 'ERR_CANCELED') {
      return 'La requête a été annulée.'
    }

    if (error?.code === 'ETIMEDOUT' || error?.code === 'ERR_TIMEOUT') {
      return 'Le serveur met trop de temps à répondre. Veuillez réessayer dans un instant.'
    }

    // Gestion des erreurs HTTP spécifiques
    if (error?.response?.status) {
      const status = error.response.status
      
      switch (status) {
        case 400:
          return 'Requête invalide. Veuillez vérifier les informations saisies.'
        case 401:
          return 'Session expirée. Veuillez vous reconnecter.'
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
        case 404:
          return 'Ressource introuvable.'
        case 429:
          return 'Trop de requêtes. Veuillez patienter avant de réessayer.'
        case 500:
          return 'Erreur interne du serveur. Nos équipes sont informées.'
        case 502:
        case 503:
          return 'Service temporairement indisponible. Veuillez réessayer plus tard.'
        case 504:
          return 'Délai d\'attente dépassé. Veuillez réessayer.'
        default:
          if (status >= 500) {
            return 'Le service rencontre des difficultés. Nos équipes travaillent sur une solution.'
          }
          return `Erreur ${status}. Veuillez réessayer.`
      }
    }

    // Message par défaut si disponible
    if (error?.message) {
      return error.message
    }

    // Message générique en dernier recours
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.code === 'ECONNREFUSED' || 
           error?.code === 'ERR_NETWORK' ||
           error?.code === 'ETIMEDOUT' ||
           error?.code === 'ECONNABORTED'
  }

  static shouldRetry(error: any): boolean {
    const status = error?.response?.status
    
    // Erreurs réseau
    if (this.isNetworkError(error)) {
      return true
    }

    // Erreurs HTTP qui peuvent être retryées
    return status === 408 || // Request Timeout
           status === 429 || // Too Many Requests
           status === 500 || // Internal Server Error
           status === 502 || // Bad Gateway
           status === 503 || // Service Unavailable
           status === 504    // Gateway Timeout
  }

  static createApiError(error: any): ApiError {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return error as ApiError
    }

    // Erreurs réseau
    if (this.isNetworkError(error)) {
      return {
        statusCode: 0,
        message: this.getMessage(error),
        code: error.code || 'NETWORK_ERROR'
      }
    }

    // Erreurs HTTP
    if (error?.response) {
      return {
        statusCode: error.response.status,
        message: this.getMessage(error),
        code: `HTTP_${error.response.status}`
      }
    }

    // Erreur générique
    return {
      statusCode: 500,
      message: this.getMessage(error),
      code: 'UNKNOWN_ERROR'
    }
  }
}
