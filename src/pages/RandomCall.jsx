import React, { useState, useRef, useEffect } from 'react'
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhoneCall, FiPhoneMissed, FiRefreshCw } from 'react-icons/fi'

const RandomCall = () => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [duration, setDuration] = useState(0)
  const [peerName, setPeerName] = useState(null)
  const localVideoRef = useRef(null)
  const intervalRef = useRef(null)

  // Mock video call - actual Agora implementation later
  const startSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      setIsCallActive(true)
      setPeerName(['Alex', 'Sarah', 'Mike', 'Emily'][Math.floor(Math.random() * 4)])
      startTimer()
    }, 3000)
  }

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const endCall = () => {
    setIsCallActive(false)
    setDuration(0)
    setPeerName(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Mock local video
  useEffect(() => {
    if (localVideoRef.current && isCallActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localVideoRef.current.srcObject = stream
        })
        .catch(err => console.log('Camera access denied:', err))
    }
    return () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCallActive])

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
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center mx-auto mb-4">
                <FiPhoneCall className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Connect?</h2>
              <p className="text-gray-400">Find a random person to talk to</p>
            </div>
            <button onClick={startSearch} className="px-8 py-3 bg-flicks-primary rounded-full font-semibold flex items-center gap-2">
              <FiRefreshCw className="w-5 h-5" /> Start Call
            </button>
          </div>
        )}

        {isSearching && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-4 border-flicks-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl">Finding someone...</p>
            <p className="text-gray-400 mt-2">Looking for random partner</p>
            <button onClick={() => setIsSearching(false)} className="mt-8 text-red-500">Cancel</button>
          </div>
        )}

        {isCallActive && (
          <div className="relative h-full rounded-2xl overflow-hidden bg-black">
            {/* Remote Video (Mock) */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-flicks-dark flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center mx-auto mb-4 text-4xl">
                  👤
                </div>
                <p className="text-xl font-semibold">{peerName}</p>
                <p className="text-gray-400">{formatDuration(duration)}</p>
              </div>
            </div>

            {/* Local Video (Small) */}
            <div className="absolute top-4 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-white/20 bg-black">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {isVideoOff && <div className="absolute inset-0 bg-flicks-surface flex items-center justify-center">Camera Off</div>}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <button onClick={() => setIsMuted(!isMuted)} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition">
                {isMuted ? <FiMicOff className="w-5 h-5 text-red-500" /> : <FiMic className="w-5 h-5 text-white" />}
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition">
                {isVideoOff ? <FiVideoOff className="w-5 h-5 text-red-500" /> : <FiVideo className="w-5 h-5 text-white" />}
              </button>
              <button onClick={endCall} className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition">
                <FiPhoneMissed className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomCall
