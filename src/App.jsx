import React from 'react'
import * as LucideIcons from 'lucide-react'

/**
 * Dev2 React Dashboard - Main App Component
 * 
 * A complete, self-contained dashboard for Home Assistant Lovelace
 * featuring weather, thermostat, lights, moods, security, family, media, and AI
 * 
 * Built with React 18 + Tailwind CSS v4
 */

// ==========================================
// UTILITIES
// ==========================================

const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const getWeatherIcon = (code) => {
  if (code === 0) return { icon: LucideIcons.Sun, label: 'Clear' }
  if (code >= 1 && code <= 3) return { icon: LucideIcons.CloudSun, label: 'Partly Cloudy' }
  if (code >= 45 && code <= 48) return { icon: LucideIcons.CloudFog, label: 'Fog' }
  if (code >= 51 && code <= 67) return { icon: LucideIcons.CloudRain, label: 'Rain' }
  if (code >= 71 && code <= 77) return { icon: LucideIcons.Snowflake, label: 'Snow' }
  if (code >= 80 && code <= 82) return { icon: LucideIcons.CloudRain, label: 'Showers' }
  if (code >= 95 && code <= 99) return { icon: LucideIcons.CloudLightning, label: 'Thunderstorm' }
  return { icon: LucideIcons.Cloud, label: 'Cloudy' }
}

// ==========================================
// BUTTON COMPONENT
// ==========================================

const Button = ({ active, onClick, onLongPress, dimmerDelay = 800, title, subTitle, icon: Icon, iconColor, children, className = '' }) => {
  const timerRef = React.useRef(null)
  const isPressingRef = React.useRef(false)

  const handleMouseDown = () => {
    isPressingRef.current = false
    timerRef.current = setTimeout(() => {
      isPressingRef.current = true
      onLongPress?.()
    }, dimmerDelay)
  }

  const handleMouseUp = () => {
    clearTimeout(timerRef.current)
    if (!isPressingRef.current && onClick) {
      onClick()
    }
    isPressingRef.current = false
  }

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleMouseLeave}
      className={`relative overflow-hidden rounded-[1.2rem] p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none shadow-sm backdrop-blur-xl border border-white/5 ${
        active
          ? 'bg-white/90 text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02] border-transparent'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/20 backdrop-blur-2xl'
      } ${className}`}
    >
      <div className="flex justify-between items-start">
        <div className={`rounded-full p-0 ${active ? iconColor : 'text-white/80'}`}>
          {Icon && <Icon size={24} fill={active ? 'currentColor' : 'none'} />}
        </div>
        {children}
      </div>
      <div className="mt-2 flex flex-col overflow-hidden">
        {title && <h3 className="font-semibold text-[15px] leading-tight tracking-tight truncate">{title}</h3>}
        {subTitle && <p className={`text-[11px] font-medium truncate ${active ? 'opacity-70' : 'text-white/50'}`}>{subTitle}</p>}
      </div>
    </div>
  )
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App({ config = {}, hass = null }) {
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [showWeatherModal, setShowWeatherModal] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('home')
  const [activeLightId, setActiveLightId] = React.useState(null)
  const [weather, setWeather] = React.useState(null)
  const [location, setLocation] = React.useState({ city: 'San Francisco', state: 'California' })

  const [lights, setLights] = React.useState([
    { id: 'den', title: 'Den', icon: LucideIcons.Armchair, on: true, brightness: 50, iconColor: 'text-orange-500', isFavorite: true },
    { id: 'kitchen', title: 'Kitchen', icon: LucideIcons.Utensils, on: true, brightness: 80, iconColor: 'text-amber-500', isFavorite: true },
    { id: 'foyer', title: 'Foyer', icon: LucideIcons.DoorOpen, on: false, brightness: 100, iconColor: 'text-blue-500', isFavorite: true },
    { id: 'dining', title: 'Dining', icon: LucideIcons.Utensils, on: false, brightness: 40, iconColor: 'text-rose-500', isFavorite: true },
    { id: 'exterior', title: 'Exterior', icon: LucideIcons.TreePine, on: true, brightness: 100, iconColor: 'text-green-500', isFavorite: true },
    { id: 'bedroom', title: 'Master Bedroom', icon: LucideIcons.BedDouble, on: false, brightness: 100, iconColor: 'text-indigo-500', isFavorite: false },
    { id: 'garage', title: 'Garage', icon: LucideIcons.Car, on: false, brightness: 100, iconColor: 'text-slate-500', isFavorite: false },
  ])

  const [thermos, setThermos] = React.useState([
    { id: 0, name: 'Downstairs', temp: 70, status: 'Heating', min: 60, max: 85 },
    { id: 1, name: 'Upstairs', temp: 68, status: 'Eco Mode', min: 65, max: 80 },
  ])
  const [currentThermoIndex, setCurrentThermoIndex] = React.useState(0)

  const [isSecurityArmed, setIsSecurityArmed] = React.useState(true)
  const [familyMembers] = React.useState([
    { id: 'dad', name: 'Dad', status: 'Home', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
    { id: 'mom', name: 'Mom', status: 'Work', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { id: 'kid', name: 'Kid', status: 'School', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
  ])

  // Clock update
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentThermo = thermos[currentThermoIndex]
  const currentWeatherCode = weather?.current?.weather_code || 0
  const currentWeatherIcon = getWeatherIcon(currentWeatherCode)
  const favoriteLights = lights.filter(l => l.isFavorite)
  const lightsOnCount = lights.filter(l => l.on).length

  const toggleLight = (id) => {
    setLights(lights.map(l => (l.id === id ? { ...l, on: !l.on } : l)))
  }

  const setLightBrightness = (id, brightness) => {
    setLights(lights.map(l => (l.id === id ? { ...l, brightness, on: true } : l)))
  }

  const adjustThermo = (delta) => {
    setThermos(thermos.map((t, i) => (i === currentThermoIndex ? { ...t, temp: t.temp + delta } : t)))
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-blue-500/30 flex overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900 blur-[120px]" />
      </div>

      {/* Navigation sidebar */}
      <nav className="hidden md:flex flex-col items-center w-20 py-8 border-r border-white/5 bg-black/40 backdrop-blur-2xl z-50 h-screen sticky top-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`mb-10 p-3 rounded-2xl transition-all duration-300 shadow-lg ${
            activeTab === 'home'
              ? 'bg-blue-600 shadow-blue-600/20 text-white'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
          }`}
        >
          <LucideIcons.Home size={24} />
        </button>

        <div className="flex flex-col gap-6 w-full px-2">
          {[
            { id: 'lights', icon: LucideIcons.Lightbulb, label: 'Lights' },
            { id: 'climate', icon: LucideIcons.Thermometer, label: 'Climate' },
            { id: 'security', icon: LucideIcons.Shield, label: 'Security' },
            { id: 'assistant', icon: LucideIcons.Sparkles, label: 'AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={24} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-purple-400' : 'group-hover:scale-110'}`} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className={`p-3 rounded-2xl transition-all duration-300 mt-auto mb-4 ${
            activeTab === 'settings' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <LucideIcons.Settings size={24} />
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-y-auto h-screen scrollbar-hide">
        {activeTab === 'home' && (
          <div className="max-w-[1600px] mx-auto p-6 md:p-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6">
              <div>
                <h2 className="text-blue-400 font-bold mb-2 tracking-wider uppercase text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h2>
                <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                  {(() => {
                    const hour = currentTime.getHours()
                    if (hour >= 5 && hour < 12) return 'Good Morning'
                    if (hour >= 12 && hour < 18) return 'Good Afternoon'
                    return 'Good Evening'
                  })()}
                </h1>
              </div>
              <div className="text-right self-center">
                <h1 className="text-6xl font-bold text-white/90 tracking-tighter leading-none font-mono">{formatTime(currentTime)}</h1>
              </div>
            </header>

            {/* Dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                {/* Weather card */}
                <div className="md:col-span-1 bg-[#1C1C1E] rounded-[1.2rem] p-4 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-xl min-h-[220px] group cursor-pointer hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <div className="flex items-center gap-1.5 text-orange-400 mb-0.5">
                        <LucideIcons.MapPin size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{location.city}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-none">{location.state}</h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-white">72°</span>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">{currentWeatherIcon.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center z-10 mt-2 mb-2">
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-yellow-300 rounded-full blur-[2px] opacity-80 animate-pulse-soft flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.4)]">
                      <currentWeatherIcon.icon size={40} className="text-white mix-blend-overlay" />
                    </div>
                  </div>
                </div>

                {/* Thermostat */}
                <div className="md:col-span-1 bg-[#1C1C1E] border border-white/10 rounded-[1.2rem] p-5 relative overflow-hidden flex flex-col min-h-[300px] shadow-2xl">
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-white leading-tight">{currentThermo.name}</h3>
                      <p className="text-xs text-white/50 font-medium">{currentThermo.status}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentThermoIndex((i) => (i - 1 + thermos.length) % thermos.length)} className="p-1.5 text-white/30 hover:text-white transition-colors">
                        <LucideIcons.ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setCurrentThermoIndex((i) => (i + 1) % thermos.length)} className="p-1.5 text-white/30 hover:text-white transition-colors">
                        <LucideIcons.ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center relative my-1">
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Target</span>
                      <div className="flex items-start">
                        <span className="text-6xl font-bold text-white tracking-tighter leading-none">{currentThermo.temp}</span>
                        <span className="text-lg font-medium text-white/50 mt-2">°F</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-8 items-center mt-1">
                    <button onClick={() => adjustThermo(-1)} className="w-12 h-12 rounded-full border-2 border-white/10 bg-transparent hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90">
                      <LucideIcons.Minus size={24} />
                    </button>
                    <button onClick={() => adjustThermo(1)} className="w-12 h-12 rounded-full border-2 border-white/10 bg-transparent hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90">
                      <LucideIcons.Plus size={24} />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Humidity: 43%</span>
                  </div>
                </div>

                {/* Favorite Lights */}
                <div className="md:col-span-2">
                  <div className="flex items-end justify-between mb-4 pr-2">
                    <div>
                      <h3 className="text-lg font-bold ml-1 text-white/90 flex items-center gap-2">
                        <LucideIcons.Lightbulb size={18} className="text-yellow-400" />
                        Favorites
                      </h3>
                      <p className="text-xs text-white/40 ml-1 mt-1">{lightsOnCount} lights on</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setLights(lights.map(l => ({ ...l, on: true })))} className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full border border-white/10 uppercase">
                        All On
                      </button>
                      <button onClick={() => setLights(lights.map(l => ({ ...l, on: false })))} className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full border border-white/10 uppercase">
                        All Off
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteLights.map((light) => (
                      <Button
                        key={light.id}
                        active={light.on}
                        onClick={() => toggleLight(light.id)}
                        onLongPress={() => setActiveLightId(light.id)}
                        dimmerDelay={800}
                        title={light.title}
                        subTitle={light.on ? `${light.brightness}% Brightness` : 'Off'}
                        icon={light.icon}
                        iconColor={light.iconColor}
                        className="aspect-[4/3]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="md:col-span-4 flex flex-col gap-6">
                {/* Security Camera */}
                <div className="bg-[#1C1C1E] rounded-[1.2rem] overflow-hidden relative aspect-[4/3] border border-white/10 shadow-2xl group cursor-pointer">
                  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 p-1.5 rounded-lg">
                        <LucideIcons.Video size={14} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white/90">Front Door</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-2 py-1 rounded-md backdrop-blur-md">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                  <img src="https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=1000&auto=format&fit=crop" alt="Camera" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                </div>

                {/* Family */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[1.2rem] p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Family</h3>
                    <div className="bg-white/10 p-1.5 rounded-full">
                      <LucideIcons.Users size={16} className="text-white/70" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="p-0.5 rounded-full border-2 transition-transform group-hover:scale-105 border-green-500">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold leading-tight">{member.name}</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">{member.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <Button
                  active={!isSecurityArmed}
                  onClick={() => setIsSecurityArmed(!isSecurityArmed)}
                  title="Security System"
                  subTitle={isSecurityArmed ? 'Armed Home' : 'Disarmed'}
                  icon={isSecurityArmed ? LucideIcons.ShieldCheck : LucideIcons.ShieldAlert}
                  iconColor={isSecurityArmed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                >
                  <div className="mt-4 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSecurityArmed ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      <span className="text-xs opacity-60 font-medium uppercase tracking-wider">{isSecurityArmed ? 'All Secure' : 'Attention Needed'}</span>
                    </div>
                    <div className="text-xs text-white/30 font-mono">09:41 AM</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lights' && (
          <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-2xl shadow-lg border border-yellow-500/20">
                <LucideIcons.Lightbulb size={24} />
              </div>
              <h2 className="text-3xl font-bold text-white">All Lights</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {lights.map((light) => (
                <Button
                  key={light.id}
                  active={light.on}
                  onClick={() => toggleLight(light.id)}
                  onLongPress={() => setActiveLightId(light.id)}
                  dimmerDelay={800}
                  title={light.title}
                  subTitle={light.on ? `${light.brightness}% Brightness` : 'Off'}
                  icon={light.icon}
                  iconColor={light.iconColor}
                  className="aspect-[4/3]"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1c1c1e]/90 backdrop-blur-3xl border-t border-white/10 p-4 pb-8 z-50 flex justify-around text-white/40">
        {[
          { id: 'home', icon: LucideIcons.Home },
          { id: 'lights', icon: LucideIcons.Lightbulb },
          { id: 'climate', icon: LucideIcons.Thermometer },
          { id: 'settings', icon: LucideIcons.Settings },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'text-blue-500' : ''}>
            <tab.icon size={28} />
          </button>
        ))}
      </div>
    </div>
  )
}
