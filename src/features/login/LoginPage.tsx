import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLoginAnimation, setShowLoginAnimation] = useState(true)

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        navigate("/app", { replace: true })
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [showWelcome, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginAnimation(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setShowWelcome(true)
  }

  if (showWelcome) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/LoginPhoto.webp')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <div className="size-28 rounded-full border-4 border-white/30 bg-white shadow-2xl overflow-hidden animate-in zoom-in-50 duration-1000 delay-200 relative z-10">
              <img
                src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg"
                alt="Arte Guapinol"
                className="size-full object-contain p-2"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <style>{`
                @keyframes expandRing {
                  0% { transform: scale(0.9); opacity: 0; }
                  15% { opacity: 0.5; }
                  100% { transform: scale(2.5); opacity: 0; }
                }
                .expand-ring {
                  animation: expandRing 4s ease-out infinite;
                }
              `}</style>
              <div className="expand-ring absolute size-28 rounded-full border border-white/40" style={{ animationDelay: '0ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/30" style={{ animationDelay: '1300ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/20" style={{ animationDelay: '2600ms' }} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white animate-in slide-in-from-bottom-4 duration-700 delay-500">
            ¡Bienvenido!
          </h2>
          <p className="mt-2 text-lg text-white/80 animate-in slide-in-from-bottom-4 duration-700 delay-700">
            Artesanías Guapinol
          </p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-white/50">
            by Katheryn Méndez and Brandon Carrillo
          </p>
        </div>
      </div>
    )
  }

  if (showLoginAnimation) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/LoginPhoto.webp')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="size-28 rounded-full border-4 border-white/30 bg-white shadow-2xl overflow-hidden relative z-10">
              <img
                src="https://res.cloudinary.com/dkwvaxxdw/image/upload/v1771647969/WhatsApp_Image_2026-02-20_at_10.25.08_PM_tunvuh.jpg"
                alt="Arte Guapinol"
                className="size-full object-contain p-2"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <style>{`
                @keyframes expandRing {
                  0% { transform: scale(0.9); opacity: 0; }
                  15% { opacity: 0.5; }
                  100% { transform: scale(2.5); opacity: 0; }
                }
                .expand-ring {
                  animation: expandRing 4s ease-out infinite;
                }
              `}</style>
              <div className="expand-ring absolute size-28 rounded-full border border-white/40" style={{ animationDelay: '0ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/30" style={{ animationDelay: '1300ms' }} />
              <div className="expand-ring absolute size-28 rounded-full border border-white/20" style={{ animationDelay: '2600ms' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/LoginPhoto.webp')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#E8E3D9]/50 bg-white/55 backdrop-blur-sm p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#33361D]">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-[#5C5F47]">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#33361D]">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-[#D9D4C7] bg-white/65 px-4 py-3 text-sm text-[#33361D] outline-none transition focus:border-[#708C3E] focus:ring-2 focus:ring-[#708C3E]/20"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#33361D]">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-[#D9D4C7] bg-white/65 px-4 py-3 pr-12 text-sm text-[#33361D] outline-none transition focus:border-[#708C3E] focus:ring-2 focus:ring-[#708C3E]/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5C5F47] hover:text-[#33361D] transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`relative flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                rememberMe
                  ? "border-[#5B732E] bg-[#5B732E]"
                  : "border-[#D9D4C7] bg-white/65 hover:border-[#708C3E]"
              }`}
            >
              {rememberMe && (
                <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-sm text-[#33361D] select-none">Recordarme</span>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#5B732E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4D6228] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}