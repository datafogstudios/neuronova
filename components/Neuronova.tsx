'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Brain, MessageSquare, BookOpen, Wind, Home, Settings, TrendingUp, Menu, X, Send, Sparkles, Lock, Check, LogOut, Plus, ChevronRight, Play, Pause, RefreshCw, AlertCircle, Target, Heart, Activity, Shield, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { sendMessageToAI } from '@/lib/anthropic'

export default function Neuronova() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser(profile)
          if (!profile.onboarding_completed) {
            setCurrentPage('onboarding')
          } else {
            setCurrentPage('dashboard')
          }
        }
      } else {
        setUser(null)
        setCurrentPage('landing')
      }
    })
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        setUser(profile)
        if (!profile.onboarding_completed) {
          setCurrentPage('onboarding')
        } else {
          setCurrentPage('dashboard')
        }
      }
    }
    setLoading(false)
  }

  const navigate = (page: string) => {
    setCurrentPage(page)
    setShowMobileMenu(false)
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('landing')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Neuronova...</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    if (!user && currentPage !== 'landing' && currentPage !== 'signup' && currentPage !== 'login') {
      return <LandingPage onNavigate={navigate} />
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />
      case 'signup':
        return <SignupPage onNavigate={navigate} />
      case 'login':
        return <LoginPage onNavigate={navigate} />
      case 'onboarding':
        return <OnboardingFlow user={user} onComplete={async () => {
          await supabase.from('users_profile').update({ onboarding_completed: true }).eq('id', user.id)
          navigate('dashboard')
        }} />
      case 'dashboard':
        return <Dashboard user={user} onNavigate={navigate} />
      case 'chat':
        return <ChatInterface user={user} onNavigate={navigate} />
      case 'mood':
        return <MoodTracking user={user} onNavigate={navigate} />
      case 'journal':
        return <JournalPage user={user} onNavigate={navigate} />
      case 'tools':
        return <CopingTools user={user} onNavigate={navigate} />
      case 'breathing':
        return <BreathingExercise onNavigate={navigate} />
      case 'insights':
        return <InsightsPage user={user} onNavigate={navigate} />
      case 'premium':
        return <PremiumPage user={user} onNavigate={navigate} />
      case 'settings':
        return <SettingsPage user={user} onLogout={handleLogout} onNavigate={navigate} />
      default:
        return <Dashboard user={user} onNavigate={navigate} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {user && (
        <AppLayout 
          currentPage={currentPage} 
          onNavigate={navigate} 
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />
      )}
      {renderPage()}
      <Footer />
      {user?.subscription_tier === 'free' && <CarbonAd />}
    </div>
  )
}

function CarbonAd() {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = `//cdn.carbonads.com/carbon.js?serve=${process.env.NEXT_PUBLIC_CARBON_ADS_SERVE || 'CWYD42QM'}&placement=${process.env.NEXT_PUBLIC_CARBON_ADS_PLACEMENT || 'neuronova'}`
    script.id = '_carbonads_js'
    const adContainer = document.getElementById('carbon-ad-container')
    if (adContainer) {
      adContainer.appendChild(script)
    }
    return () => {
      const existingScript = document.getElementById('_carbonads_js')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
      <div id="carbon-ad-container" className="bg-white rounded-lg shadow-lg p-2"></div>
    </div>
  )
}

function LandingPage({ onNavigate }: any) {
  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Neuronova</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => onNavigate('login')} className="text-indigo-600 hover:text-indigo-700 font-semibold">Log In</button>
              <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-md">Start Free</button>
            </div>
            <button onClick={() => onNavigate('signup')} className="md:hidden bg-indigo-600 text-white px-4 py-2 rounded-full text-sm">Start Free</button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">Your AI-Powered Mental Wellness Companion</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">Experience affordable, 24/7 mental health support. Get personalized guidance for anxiety, stress, and emotional wellbeing.</p>
          <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-105">Start Your Journey Free</button>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-gray-200 mt-12">
            <div><div className="text-3xl font-bold text-indigo-600">100K+</div><div className="text-gray-600 text-sm">Active Users</div></div>
            <div><div className="text-3xl font-bold text-purple-600">4.9★</div><div className="text-gray-600 text-sm">User Rating</div></div>
            <div><div className="text-3xl font-bold text-pink-600">24/7</div><div className="text-gray-600 text-sm">Available</div></div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Your Mental Health</h2>
            <p className="text-xl text-gray-600">Evidence-based tools powered by advanced AI</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <MessageSquare className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Conversations</h3>
              <p className="text-gray-600">Chat with empathetic AI trained in CBT, DBT, and mindfulness techniques</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mood Tracking</h3>
              <p className="text-gray-600">Track emotions and get AI-powered insights into your patterns</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
              <Wind className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coping Tools</h3>
              <p className="text-gray-600">Interactive breathing exercises and grounding techniques</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Mental Wellness?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands finding peace with Neuronova</p>
          <button onClick={() => onNavigate('signup')} className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition shadow-lg">Start Free Today</button>
        </div>
      </section>
    </div>
  )
}

function SignupPage({ onNavigate }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users_profile').insert({
        id: data.user.id,
        display_name: name,
        email: email,
        subscription_tier: 'free',
        onboarding_completed: false
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-600 mt-2">Begin your wellness journey with Neuronova</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account? <button onClick={() => onNavigate('login')} className="text-indigo-600 hover:text-indigo-700 font-semibold">Log In</button></p>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ onNavigate }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Continue your wellness journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400">
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Don't have an account? <button onClick={() => onNavigate('signup')} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign Up</button></p>
        </div>
      </div>
    </div>
  )
}
function OnboardingFlow({ user, onComplete }: any) {
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<string[]>([])
  const [conversationStyle, setConversationStyle] = useState('')

  const goalOptions = ['Manage anxiety', 'Improve mood', 'Reduce stress', 'Better sleep', 'Build confidence', 'Process emotions']
  const styleOptions = [
    { value: 'gentle', label: 'Supportive & Gentle', desc: 'Extra empathetic' },
    { value: 'direct', label: 'Direct & Practical', desc: 'Solution-focused' },
    { value: 'adaptive', label: 'Let AI Adapt', desc: 'AI learns you' }
  ]

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal))
    } else if (goals.length < 3) {
      setGoals([...goals, goal])
    }
  }

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Step {step} of 4</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Neuronova ??</h2>
            <p className="text-gray-600 mb-8">Your safe space for mental wellness.</p>
            <button onClick={nextStep} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Wellness Goals</h2>
            <p className="text-gray-600 mb-6">Select 1-3 areas</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {goalOptions.map((goal) => (
                <button key={goal} onClick={() => toggleGoal(goal)} className={`p-4 rounded-lg border-2 text-left transition ${goals.includes(goal) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                  <span className="font-medium">{goal}</span>
                </button>
              ))}
            </div>
            <button onClick={nextStep} disabled={goals.length === 0} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversation Style</h2>
            <div className="space-y-3 mb-8">
              {styleOptions.map((style) => (
                <button key={style.value} onClick={() => setConversationStyle(style.value)} className={`w-full p-4 rounded-lg border-2 text-left transition ${conversationStyle === style.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                  <div className="font-semibold text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} disabled={!conversationStyle} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300">Continue</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Crisis Resources</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2">Neuronova is not a replacement for professional help.</p>
              <p className="text-gray-700 font-semibold">???? US: 988 | ???? UK: 116 123</p>
            </div>
            <button onClick={nextStep} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold">I Understand</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AppLayout({ currentPage, onNavigate, showMobileMenu, setShowMobileMenu }: any) {
  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Neuronova</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => onNavigate('dashboard')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${currentPage === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Home className="w-5 h-5" /><span>Home</span>
            </button>
            <button onClick={() => onNavigate('chat')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${currentPage === 'chat' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <MessageSquare className="w-5 h-5" /><span>Chat</span>
            </button>
            <button onClick={() => onNavigate('settings')} className="text-gray-700 p-2 rounded-lg hover:bg-gray-50">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <button onClick={() => onNavigate('dashboard')} className={`flex flex-col items-center py-2 ${currentPage === 'dashboard' ? 'text-indigo-600' : 'text-gray-600'}`}>
            <Home className="w-6 h-6" /><span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => onNavigate('chat')} className={`flex flex-col items-center py-2 ${currentPage === 'chat' ? 'text-indigo-600' : 'text-gray-600'}`}>
            <MessageSquare className="w-6 h-6" /><span className="text-xs mt-1">Chat</span>
          </button>
          <button onClick={() => onNavigate('mood')} className={`flex flex-col items-center py-2 ${currentPage === 'mood' ? 'text-indigo-600' : 'text-gray-600'}`}>
            <TrendingUp className="w-6 h-6" /><span className="text-xs mt-1">Mood</span>
          </button>
          <button onClick={() => onNavigate('journal')} className={`flex flex-col items-center py-2 ${currentPage === 'journal' ? 'text-indigo-600' : 'text-gray-600'}`}>
            <BookOpen className="w-6 h-6" /><span className="text-xs mt-1">Journal</span>
          </button>
          <button onClick={() => onNavigate('tools')} className={`flex flex-col items-center py-2 ${currentPage === 'tools' ? 'text-indigo-600' : 'text-gray-600'}`}>
            <Wind className="w-6 h-6" /><span className="text-xs mt-1">Tools</span>
          </button>
        </div>
      </div>
    </>
  )
}

function Dashboard({ user, onNavigate }: any) {
  const [currentMood, setCurrentMood] = useState<number | null>(null)
  const moodEmojis = ['??', '??', '??', '??', '??']
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const fetchStreak = async () => {
      const { data } = await supabase
        .from('mood_checkins')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data && data.length > 0) {
        let currentStreak = 1
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < data.length - 1; i++) {
          const current = new Date(data[i].created_at)
          const next = new Date(data[i + 1].created_at)
          current.setHours(0, 0, 0, 0)
          next.setHours(0, 0, 0, 0)

          const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            currentStreak++
          } else {
            break
          }
        }
        setStreak(currentStreak)
      }
    }

    fetchStreak()
  }, [user.id])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Good Evening, {user?.display_name || 'Friend'} ??</h1>
      <p className="text-gray-600 mb-8">How are you feeling today?</p>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex justify-center space-x-4 mb-4">
          {moodEmojis.map((emoji, idx) => (
            <button key={idx} onClick={() => setCurrentMood(idx + 1)} className={`text-4xl transform hover:scale-110 transition ${currentMood === idx + 1 ? 'scale-125' : ''}`}>
              {emoji}
            </button>
          ))}
        </div>
        {currentMood && (
          <button onClick={() => onNavigate('mood')} className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Save Check-In</button>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h2 className="text-xl font-bold mb-4">Your Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">?? {streak}</div>
            <div className="text-sm opacity-90">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">?? 0</div>
            <div className="text-sm opacity-90">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">?? 0</div>
            <div className="text-sm opacity-90">Tools Used</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => onNavigate('chat')} className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition">
          <MessageSquare className="w-8 h-8 mb-3" />
          <div className="font-semibold text-left">Chat with AI</div>
        </button>
        <button onClick={() => onNavigate('insights')} className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition">
          <TrendingUp className="w-8 h-8 mb-3" />
          <div className="font-semibold text-left">View Trends</div>
        </button>
        <button onClick={() => onNavigate('journal')} className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition">
          <BookOpen className="w-8 h-8 mb-3" />
          <div className="font-semibold text-left">Journal</div>
        </button>
        <button onClick={() => onNavigate('breathing')} className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition">
          <Wind className="w-8 h-8 mb-3" />
          <div className="font-semibold text-left">Breathing</div>
        </button>
      </div>

      {user?.subscription_tier === 'free' && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Unlock Unlimited Access</h3>
              <p className="text-sm opacity-90">Get unlimited conversations</p>
            </div>
            <button onClick={() => onNavigate('premium')} className="bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Upgrade</button>
          </div>
        </div>
      )}
    </div>
  )
}
# SCRIPT 6: Component Part 3 - Chat Interface

function ChatInterface({ user, onNavigate }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversation()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversation = async () => {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (conversations && conversations.length > 0) {
      const conv = conversations[0]
      setConversationId(conv.id)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)
      }
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Conversation' })
        .select()
        .single()

      if (newConv) {
        setConversationId(newConv.id)
        const welcomeMsg = {
          conversation_id: newConv.id,
          user_id: user.id,
          role: 'assistant',
          content: `Hey ${user.display_name}, I'm here for you. How are you feeling today?`
        }
        const { data } = await supabase.from('messages').insert(welcomeMsg).select().single()
        if (data) {
          setMessages([data])
        }
      }
    }
    setLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return

    const userMessage = {
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: input
    }

    const { data: savedUserMsg } = await supabase.from('messages').insert(userMessage).select().single()
    
    if (savedUserMsg) {
      setMessages(prev => [...prev, savedUserMsg])
    }

    setInput('')
    setIsTyping(true)

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const aiResponse = await sendMessageToAI(input, conversationHistory)

      const assistantMessage = {
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse
      }

      const { data: savedAiMsg } = await supabase.from('messages').insert(assistantMessage).select().single()
      
      if (savedAiMsg) {
        setMessages(prev => [...prev, savedAiMsg])
      }
    } catch (error: any) {
      console.error('AI Error:', error)
      const errorMessage = {
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: 'I apologize, I encountered an issue. Please check your API configuration or try again.'
      }
      const { data } = await supabase.from('messages').insert(errorMessage).select().single()
      if (data) {
        setMessages(prev => [...prev, data])
      }
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b px-4 py-4 flex items-center space-x-3">
        <button onClick={() => onNavigate('dashboard')} className="md:hidden text-white">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-bold text-white">Neuronova AI</div>
          <div className="text-xs text-white/80">Always here to listen</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 shadow-sm'} rounded-2xl px-4 py-3`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-100' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t px-4 py-4 mb-16 md:mb-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition disabled:bg-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
# SCRIPT 7: Component Part 4 - Mood & Journal

function MoodTracking({ user, onNavigate }: any) {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const emotions = ['Anxious', 'Stressed', 'Tired', 'Happy', 'Calm', 'Energized', 'Sad', 'Overwhelmed', 'Content', 'Frustrated', 'Lonely', 'Excited', 'Grateful', 'Angry', 'Hopeful']
  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊']
  const moodLabels = ['Very Bad', 'Low', 'Okay', 'Good', 'Great']

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion))
    } else {
      setSelectedEmotions([...selectedEmotions, emotion])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    
    await supabase.from('mood_checkins').insert({
      user_id: user.id,
      mood_score: moodScore * 2,
      emotions: selectedEmotions,
      note: note
    })

    setLoading(false)
    setShowSuccess(true)
    setTimeout(() => onNavigate('dashboard'), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ChevronRight className="w-5 h-5 rotate-180 mr-1" />Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">How are you feeling?</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {moodEmojis.map((emoji, idx) => (
              <button key={idx} onClick={() => setMoodScore(idx + 1)} className={`text-5xl transform transition ${moodScore === idx + 1 ? 'scale-125' : 'opacity-50 hover:opacity-75'}`}>
                {emoji}
              </button>
            ))}
          </div>
          <div className="text-lg font-semibold text-gray-700">{moodLabels[moodScore - 1]}</div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">What's contributing to this?</label>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion) => (
              <button key={emotion} onClick={() => toggleEmotion(emotion)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedEmotions.includes(emotion) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Optional: Add a note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's on your mind?" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" rows={4} />
        </div>

        <div className="flex space-x-3">
          <button onClick={() => onNavigate('dashboard')} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Skip</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Save Check-In'}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check-in Saved!</h3>
            <p className="text-gray-600">Keep up the great work 🌟</p>
          </div>
        </div>
      )}
    </div>
  )
}

function JournalPage({ user, onNavigate }: any) {
  const [entries, setEntries] = useState<any[]>([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data)
