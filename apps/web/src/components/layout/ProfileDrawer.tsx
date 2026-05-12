import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Input } from "@workspace/ui/components/input"
import { KeyRound, Loader2, Mail, ShieldCheck, UserCircle } from "lucide-react"
import { useState } from "react"
import { updatePassword as apiUpdatePassword } from "../../api/client"
import { useAuth } from "@/hooks/useAuth"

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isAdmin = user?.role === "admin"

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.")
      return
    }

    setIsLoading(true)
    try {
      await apiUpdatePassword(password)
      setSuccess("Mot de passe mis à jour avec succès.")
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la mise à jour.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Mon Profil
          </DrawerTitle>
          <DrawerDescription>
            Consultez vos informations et gérez vos accès.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 space-y-6 p-4">
          {/* User Info */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Adresse Email
                </span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Rôle
                </span>
                <span className="text-sm font-medium capitalize">
                  {user?.role === "admin" ? "Administrateur" : user?.role === "employee" ? "Collaborateur" : "Invité"}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Password Change */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <KeyRound className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Sécurité du compte
                </h3>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-500/50 bg-green-500/5 py-2 text-green-600">
                    <AlertDescription className="text-xs">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="new-password" title="Nouveau mot de passe" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                    Nouveau mot de passe
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-lg bg-muted/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" title="Confirmer le mot de passe" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-10 rounded-lg bg-muted/20"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
