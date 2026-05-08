import { useState, useCallback } from 'react'
import type { ApiError } from '@/types'
import { ErrorHandler } from '@/utils/error-handler'

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err: any) => {
    const apiError = ErrorHandler.createApiError(err)
    setError(apiError)
    
    // Auto-clear error after 5 seconds for non-critical errors
    if (apiError.statusCode !== 401 && apiError.statusCode !== 403) {
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, [])

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    if (ErrorHandler.shouldRetry(error!)) {
      setIsLoading(true)
      clearError()
      
      try {
        await retryFn()
      } catch (retryError) {
        handleError(retryError)
      } finally {
        setIsLoading(false)
      }
    }
  }, [error, handleError])

  return {
    error,
    isLoading,
    clearError,
    handleError,
    retry
  }
}
