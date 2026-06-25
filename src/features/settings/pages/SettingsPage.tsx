import { useMemo, useRef, useState, type FormEvent } from "react"
import { ArrowLeft, Camera, LockKeyhole, Mail, RotateCcw, UserPlus, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { sileo } from "sileo"
import { supabase } from "@/lib/supabase"
import { DEFAULT_AVATAR_URL } from "@/shared/constants/brand"
import { useProfileStore } from "@/shared/store/useProfileStore"

const PRODUCTION_APP_URL = "https://artesanias-guapinol.vercel.app/"

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."))
    reader.readAsDataURL(file)
  })
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl)
  const resetAvatarUrl = useProfileStore((state) => state.resetAvatarUrl)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [activeTab, setActiveTab] = useState<"users" | "passwords">("users")

  const resolvedAvatarUrl = avatarUrl ?? DEFAULT_AVATAR_URL
  const hasCustomAvatar = useMemo(() => Boolean(avatarUrl), [avatarUrl])

  const handleAvatarFile = async (file: File | undefined) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      sileo.error({ title: "Archivo no válido", description: "Selecciona una imagen." })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      sileo.error({ title: "Imagen muy grande", description: "Máximo 2 MB." })
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setAvatarUrl(dataUrl)
      sileo.success({ title: "Foto actualizada" })
    } catch (error) {
      sileo.error({
        title: "No se pudo cargar",
        description: error instanceof Error ? error.message : "Intenta con otra imagen.",
      })
    }
  }

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      sileo.error({ title: "Faltan datos", description: "Correo y contraseña son obligatorios." })
      return
    }

    if (password.trim().length < 6) {
      sileo.error({ title: "Contraseña corta", description: "Usa al menos 6 caracteres." })
      return
    }

    setIsCreatingUser(true)

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: PRODUCTION_APP_URL,
          data: {
            full_name: fullName.trim() || null,
            role: "user",
          },
        },
      })

      if (error) throw error

      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        })
      }

      sileo.success({
        title: "Usuario creado",
        description: "Si Supabase requiere confirmación, revisa el correo registrado.",
      })
      setFullName("")
      setEmail("")
      setPassword("")
    } catch (error) {
      sileo.error({
        title: "No se pudo crear",
        description: error instanceof Error ? error.message : "Intenta de nuevo.",
      })
    } finally {
      setIsCreatingUser(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-2xl border border-gray-200 bg-background px-3 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          aria-label="Regresar"
          title="Regresar"
        >
          <ArrowLeft className="size-5" />
        </button>

        <h1 className="truncate text-2xl font-bold tracking-tight">Configuración</h1>
      </div>

      <div className="flex w-fit items-center rounded-2xl bg-gray-100/60 p-1 dark:bg-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "users"
              ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
              : "text-gray-500 hover:text-gray-800 dark:text-white/45 dark:hover:text-white/70"
          }`}
        >
          Usuarios
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("passwords")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "passwords"
              ? "bg-background text-[#708C3E] shadow-sm dark:text-[#A7D878]"
              : "text-gray-500 hover:text-gray-800 dark:text-white/45 dark:hover:text-white/70"
          }`}
        >
          Contraseñas
        </button>
      </div>

      {activeTab === "users" ? (
        <>
          <section className="rounded-2xl border border-gray-200 bg-background p-4 dark:border-white/10 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="size-20 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm dark:border-white/10">
                  <img
                    src={resolvedAvatarUrl}
                    alt="Foto de perfil"
                    className="size-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold">Foto de perfil</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/55">
                    Se muestra en la esquina superior derecha.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleAvatarFile(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#708C3E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7634]"
                >
                  <Camera className="size-4" />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAvatarUrl()
                    sileo.info({ title: "Foto restaurada" })
                  }}
                  disabled={!hasCustomAvatar}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-background px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                  aria-label="Restaurar logo"
                  title="Restaurar logo"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-background p-4 dark:border-white/10 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#708C3E]/10 text-[#708C3E] dark:bg-[#708C3E]/20 dark:text-[#A7D878]">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Crear usuario</h2>
                <p className="text-sm text-gray-500 dark:text-white/55">Crea accesos para el equipo.</p>
              </div>
            </div>

            <form className="grid gap-3" onSubmit={handleCreateUser}>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nombre completo"
                className="h-11 rounded-2xl border border-gray-200 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:border-white/10 dark:text-white"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="Correo"
                  className="h-11 rounded-2xl border border-gray-200 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:border-white/10 dark:text-white"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Contraseña"
                  className="h-11 rounded-2xl border border-gray-200 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#708C3E] px-5 text-sm font-semibold text-white transition hover:bg-[#5f7634] disabled:opacity-60"
                >
                  <UserPlus className="size-4" />
                  {isCreatingUser ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </section>

        </>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-background p-4 dark:border-white/10 sm:p-5">
            <Mail className="size-5 text-gray-400 dark:text-white/40" />
            <h2 className="mt-3 text-base font-semibold">Cambio de correo</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/55">
              Pendiente para una siguiente etapa.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-background p-4 dark:border-white/10 sm:p-5">
            <LockKeyhole className="size-5 text-gray-400 dark:text-white/40" />
            <h2 className="mt-3 text-base font-semibold">Cambio de contraseña</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/55">
              Pendiente para una siguiente etapa.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
