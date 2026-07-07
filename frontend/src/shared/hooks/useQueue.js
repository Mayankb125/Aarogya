import { useCallback, useEffect, useMemo, useState } from 'react'
import { emitWithAck, getSocket } from '../services/socketService'

const INITIAL_STATE = {
  queue: [],
  currentToken: null,
  lastTokenNumber: 0,
  avgConsultTime: 5,
}

function normalizeQueueState(state) {
  return {
    ...INITIAL_STATE,
    ...state,
    queue: Array.isArray(state?.queue) ? state.queue : [],
  }
}

function useQueue() {
  const [queueState, setQueueState] = useState(INITIAL_STATE)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const socket = getSocket()

    function applyState(nextState) {
      setQueueState(normalizeQueueState(nextState))
      setIsLoading(false)
    }

    function handleSocketError(payload) {
      setError(payload?.message || 'Queue server error')
      setIsLoading(false)
    }

    socket.on('connect', () => {
      setIsConnected(true)
      setError('')
      socket.emit('queue:sync', (response) => {
        if (response?.ok) {
          applyState(response.state)
          return
        }

        handleSocketError(response?.error)
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('queue:state', applyState)
    socket.on('queue:updated', applyState)
    socket.on('queue:cleared', applyState)
    socket.on('queue:error', handleSocketError)

    if (!socket.connected) {
      socket.connect()
    } else {
      setIsConnected(true)
      setError('')
      socket.emit('queue:sync', (response) => {
        if (response?.ok) {
          applyState(response.state)
          return
        }
        handleSocketError(response?.error)
      })
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('queue:state', applyState)
      socket.off('queue:updated', applyState)
      socket.off('queue:cleared', applyState)
      socket.off('queue:error', handleSocketError)
    }
  }, [])

  const runAction = useCallback(async (eventName, payload) => {
    setIsSaving(true)
    setError('')

    try {
      const state = await emitWithAck(eventName, payload)
      setQueueState(normalizeQueueState(state))
      return state
    } catch (actionError) {
      setError(actionError.message)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const actions = useMemo(
    () => ({
      addPatient: (payload) => runAction('patient:add', payload),
      callNext: (doctorId) => runAction('token:callNext', { doctorId }),
      resetQueue: () => runAction('queue:reset'),
      updateAvgConsultTime: (avgConsultTime) =>
        runAction('queue:updateAvgConsultTime', { avgConsultTime }),
      clearError: () => setError(''),
    }),
    [runAction],
  )

  return {
    ...queueState,
    actions,
    error,
    isConnected,
    isLoading,
    isSaving,
  }
}

export default useQueue
