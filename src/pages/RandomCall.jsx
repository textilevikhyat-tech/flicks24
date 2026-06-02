import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhoneCall, FiPhoneMissed,
  FiRefreshCw, FiUser, FiFlag, FiX, FiLoader, FiAlertCircle
} from 'react-icons/fi'

// Agora SDK (will be initialized when component mounts)
let AgoraRTC = null

const RandomCall = () => {
  const { user } = useAuth()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [duration, setDuration] = useState(0)
  const [peerInfo, setPeerInfo] = useState(null)
  const [error, setError] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAgoraLoaded, setIsAgoraLoaded] = useState(false)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const intervalRef = useRef(null)
  const clientRef = useRef(null)
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null })

  // Load Agora SDK dynamically
  useEffect(() => {
    const loadAgora = async () => {
      try {
        const module = await import('agora-rtc-sdk-ng')
        AgoraRTC = module.default
        setIsAgoraLoaded(true)
      } catch (err) {
        console.error('Failed to load Agora SDK:', err)
        setError('Video call feature loading. Please try again.')
      } finally {
        setIsInitializing(false)
      }
    }
    loadAgora()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      leaveCall()
    }
  }, [])

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const findRandomPeer = async () => {
    setIsSearching(true)
    setError('')
    
    // Find another user who is also looking for a call
    const { data: waitingUsers, error: findError } = await supabase
      .from('call_queue')
      .select('user_id, user:users(username, avatar)')
      .neq('user_id', user.id)
      .eq('status', 'waiting')
      .limit(1)

    if (findError) {
      setError('Failed to find peer')
      setIsSearching(false)
      return null
    }

    if (waitingUsers && waitingUsers.length > 0) {
      // Found a waiting user
      const peer = waitingUsers[0]
      await supabase
        .from('call_queue')
        .update({ status: 'matched', matched_with: user.id })
        .eq('user_id', peer.user_id)
      return peer
    }

    // No one waiting, add self to queue
    await supabase
      .from('call_queue')
      .upsert({ 
        user_id: user.id, 
        status: 'waiting',
        user_info: { username: user.user_metadata?.username, avatar: user.user_metadata?.avatar }
      })
    
    // Wait for match (polling)
    return new Promise((resolve) => {
      const unsubscribe = supabase
        .channel('call_queue')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'call_queue',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.status === 'matched') {
            unsubscribe.unsubscribe()
            resolve({ user_id: payload.new.matched_with })
          }
        })
        .subscribe()

      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe.unsubscribe()
        resolve(null)
      }, 30000)
    })
  }

  const startCall = async () => {
    if (!isAgoraLoaded) {
      setError('Video call is initializing. Please wait.')
      return
    }

    setError('')
    setIsSearching(true)

    try {
      const peer = await findRandomPeer()
      
      if (!peer) {
        // Remove from queue
        await supabase.from('call_queue').delete().eq('user_id', user.id)
        setError('No users available. Please try again.')
        setIsSearching(false)
        return
      }

      setPeerInfo(peer)
      setIsSearching(false)
      setIsCallActive(true)
      startTimer()

      // Initialize Agora call
      await initAgoraCall(peer.user_id)
      
    } catch (err) {
      console.error('Call error:', err)
      setError('Failed to start call. Please try again.')
      setIsSearching(false)
    }
  }

  const initAgoraCall = async (peerId) => {
    const appId = import.meta.env.VITE_AGORA_APP_ID
    if (!appId) {
      setError('Agora App ID not configured')
      return
    }

    // Create client
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    clientRef.current = client

    // Handle remote user
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType)
      if (mediaType === 'video' && remoteVideoRef.current) {
        user.videoTrack.play(remoteVideoRef.current)
      }
      if (mediaType === 'audio') {
        user.audioTrack.play()
      }
    })

    // Join channel
    const channelName = `call_${[user.id, peerId].sort().join('_')}`
    await client.join(appId, channelName, null, user.id)

    // Create local tracks
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
    localTracksRef.current = { audioTrack, videoTrack }
    
    // Play local video
    videoTrack.play(localVideoRef.current)
    
    // Publish tracks
    await client.publish([audioTrack, videoTrack])
  }

  const toggleMute = async () => {
    if (localTracksRef.current.audioTrack) {
      await localTracksRef.current.audioTrack.setEnabled(isMuted)
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = async () => {
    if (localTracksRef.current.videoTrack) {
      await localTracksRef.current.videoTrack.setEnabled(isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }

  const leaveCall = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    // Close tracks
    if (localTracksRef.current.audioTrack) {
      localTracksRef.current.audioTrack.close()
    }
    if (localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.close()
    }
    
    // Leave channel
    if (clientRef.current) {
      await clientRef.current.leave()
    }
    
    // Remove from queue
    await supabase.from('call_queue').delete().eq('user_id', user.id)
    
    setIsCallActive(false)
    setDuration(0)
    setPeerInfo(null)
  }

  const reportUser = async () => {
    if (!peerInfo) return
    const reason = prompt('Why are you reporting this user?')
    if (reason) {
      await supabase.from('call_reports').insert({
        reported_user_id: peerInfo.user_id,
        reporter_user_id: user.id,
        reason
      })
      alert('Thank you for reporting. Our team will review.')
      leaveCall()
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-flicks-dark flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-10 h-10 animate-spin text-flicks-primary mx-auto mb-4" />
          <p className="text-gray-400">Initializing video call...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-flicks-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold gradient-text">Random Call</h1>
        <p className="text-sm text-gray-400">Connect with random people worldwide</p>
      </div>

      {/* Call Area */}
      <div className="flex-1 p-4">
        {!isCallActive && !isSearching && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                <FiPhoneCall className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Connect?</h2>
              <p className="text-gray-400">Find a random person to talk to</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <button
              onClick={startCall}
              disabled={!isAgoraLoaded}
              className="px-8 py-3 gradient-bg rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <FiRefreshCw className="w-5 h-5" /> Start Call
            </button>
            
            {!isAgoraLoaded && (
              <p className="text-xs text-gray-500 mt-4">Loading video SDK...</p>
            )}
          </div>
        )}

        {isSearching && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-4 border-flicks-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl">Finding someone...</p>
            <p className="text-gray-400 mt-2">Looking for random partner</p>
            <button
              onClick={() => {
                setIsSearching(false)
                supabase.from('call_queue').delete().eq('user_id', user.id)
              }}
              className="mt-8 text-red-500"
            >
              Cancel
            </button>
          </div>
        )}

        {isCallActive && (
          <div className="relative h-full rounded-2xl overflow-hidden bg-black">
            {/* Remote Video */}
            <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" />
            
            {/* Remote Video Placeholder (while loading) */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-flicks-dark flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-4xl">
                  👤
                </div>
                <p className="text-xl font-semibold">{peerInfo?.user?.username || 'Stranger'}</p>
                <p className="text-gray-400">{formatDuration(duration)}</p>
              </div>
            </div>

            {/* Local Video (Small - Picture in Picture) */}
            <div className="absolute top-4 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-white/20 bg-black z-10">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {isVideoOff && (
                <div className="absolute inset-0 bg-flicks-surface flex items-center justify-center">
                  <FiVideoOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 z-10">
              <button
                onClick={toggleMute}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
              >
                {isMuted ? <FiMicOff className="w-5 h-5 text-red-500" /> : <FiMic className="w-5 h-5 text-white" />}
              </button>
              
              <button
                onClick={toggleVideo}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
              >
                {isVideoOff ? <FiVideoOff className="w-5 h-5 text-red-500" /> : <FiVideo className="w-5 h-5 text-white" />}
              </button>
              
              <button
                onClick={leaveCall}
                className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition"
              >
                <FiPhoneMissed className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={reportUser}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
              >
                <FiFlag className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomCall
