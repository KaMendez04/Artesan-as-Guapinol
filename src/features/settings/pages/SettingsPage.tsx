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
  const whatsappPhone = useProfileStore((state) => state.whatsappPhone)
  const setWhatsappPhone = useProfileStore((state) => state.setWhatsappPhone)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState(whatsappPhone)
  const [isSavingPhone, setIsSavingPhone] = useState(false)
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

  const handleSaveWhatsApp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const phone = whatsappInput.trim().replace(/\D/g, "")
    if (!phone) {
      sileo.error({ title: "Número inválido" })
      return
    }
    setIsSavingPhone(true)
    try {
      setWhatsappPhone(phone)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").update({ whatsapp_phone: phone }).eq("id", user.id)
      }
      sileo.success({ title: "Número guardado" })
    } catch {
      sileo.error({ title: "No se pudo guardar en el servidor" })
    } finally {
      setIsSavingPhone(false)
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-x-hidden text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md px-3 py-2 text-gray-700 transition hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
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
          <section className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                  <img src={resolvedAvatarUrl} alt="Foto de perfil" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Foto de perfil</p>
                  <p className="truncate text-xs text-gray-500 dark:text-white/50">Esquina superior derecha</p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#708C3E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5f7634]"
                >
                  <Camera className="size-3.5" />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => { resetAvatarUrl(); sileo.info({ title: "Foto restaurada" }) }}
                  disabled={!hasCustomAvatar}
                  className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 p-2 text-gray-700 dark:text-white transition hover:bg-white/80 disabled:opacity-40"
                  aria-label="Restaurar logo"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35">Número de WhatsApp del catálogo</p>
            <form className="flex flex-wrap items-center gap-2" onSubmit={handleSaveWhatsApp}>
              <input
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value.replace(/\D/g, ""))}
                placeholder="84131678"
                maxLength={8}
                inputMode="numeric"
                className="h-9 min-w-0 flex-1 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:text-white"
                style={{ minWidth: "140px" }}
              />
              <button
                type="submit"
                disabled={isSavingPhone}
                className="h-9 shrink-0 rounded-xl bg-[#708C3E] px-3 text-sm font-semibold text-white transition hover:bg-[#5f7634] disabled:opacity-60"
              >
                {isSavingPhone ? "..." : "Guardar"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 shrink-0 text-[#708C3E] dark:text-[#A7D878]" />
              <p className="text-sm font-semibold">Crear usuario</p>
            </div>

            <form className="grid gap-3" onSubmit={handleCreateUser}>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nombre completo"
                className="h-10 w-full rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:text-white"
              />

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Correo"
                className="h-10 w-full rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:text-white"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Contraseña"
                className="h-10 w-full rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-[#708C3E]/30 dark:text-white"
              />

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#708C3E] px-5 text-sm font-semibold text-white transition hover:bg-[#5f7634] disabled:opacity-60 sm:w-auto"
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
          <div className="rounded-2xl border border-dashed border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4 sm:p-5">
            <Mail className="size-5 text-gray-400 dark:text-white/40" />
            <h2 className="mt-3 text-base font-semibold">Cambio de correo</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/55">
              Pendiente para una siguiente etapa.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-md p-4 sm:p-5">
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
