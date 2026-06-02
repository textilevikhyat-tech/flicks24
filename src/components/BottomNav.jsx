import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiVideo, FiUsers, FiPlusCircle, FiUser } from 'react-icons/fi'

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/reels', icon: FiVideo, label: 'Reels' },
    { path: '/circles', icon: FiUsers, label: 'Circles' },
    { path: '/random-call', icon: FiPlusCircle, label: 'Call' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-xl transition ${
                  isActive ? 'text-flicks-primary' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
