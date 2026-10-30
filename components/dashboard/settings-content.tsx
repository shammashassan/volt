"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/responsive-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  User,
  Lock,
  Trash2,
  ShieldAlert,
  UserCircle,
  Settings,
  Key,
  Smartphone,
  Laptop,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  LogOut,
} from "lucide-react"

interface SessionItem {
  id: string
  token: string
  userId: string
  ipAddress?: string
  userAgent?: string
  createdAt: string | Date
  expiresAt: string | Date
}

interface PasskeyItem {
  id: string
  name?: string
  createdAt?: string | Date
  aaguid?: string
}

export function SettingsContent() {
  const { data: session, isPending } = authClient.useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Profile state for dirty check
  const [profileData, setProfileData] = useState({ name: "", email: "" })
  const [initialProfileData, setInitialProfileData] = useState({ name: "", email: "" })

  // Password state
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  // Security Sub-states
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
  const [securityLoading, setSecurityLoading] = useState(false)

  // 2FA Dialog States
  const [showEnable2FA, setShowEnable2FA] = useState(false)
  const [enable2FAPassword, setEnable2FAPassword] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isEnrolling2FA, setIsEnrolling2FA] = useState(false)
  const [showDisable2FA, setShowDisable2FA] = useState(false)
  const [disable2FAPassword, setDisable2FAPassword] = useState("")
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  // Passkey Dialog States
  const [showAddPasskey, setShowAddPasskey] = useState(false)
  const [passkeyName, setPasskeyName] = useState("")
  const [isAddingPasskey, setIsAddingPasskey] = useState(false)

  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const fetchSecurityData = useCallback(async () => {
    setSecurityLoading(true)
    try {
      const [sessionsRes, passkeysRes] = await Promise.allSettled([
        authClient.listSessions(),
        authClient.passkey.listUserPasskeys(),
      ])

      if (sessionsRes.status === "fulfilled" && sessionsRes.value?.data) {
        setSessions(sessionsRes.value.data as unknown as SessionItem[])
      }

      if (passkeysRes.status === "fulfilled" && passkeysRes.value?.data) {
        setPasskeys(passkeysRes.value.data as unknown as PasskeyItem[])
      }
    } catch (err) {
      console.error("Failed to load security metadata:", err)
    } finally {
      setSecurityLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      const data = { name: session.user.name || "", email: session.user.email || "" }
      setProfileData(data)
      setInitialProfileData(data)
    }
  }, [session])

  useEffect(() => {
    if (activeTab === "security") {
      void fetchSecurityData()
    }
  }, [activeTab, fetchSecurityData])

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any
  const is2FAEnabled = Boolean(user?.twoFactorEnabled)
  const isProfileDirty = profileData.name !== initialProfileData.name || profileData.email !== initialProfileData.email
  const isPasswordValid =
    passwordData.currentPassword.length >= 8 &&
    passwordData.newPassword.length >= 8 &&
    passwordData.newPassword === passwordData.confirmPassword

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      await toast.promise(
        (async () => {
          let emailChanged = false

          if (profileData.name !== initialProfileData.name) {
            const { error: nameError } = await authClient.updateUser({
              name: profileData.name,
            })
            if (nameError) throw new Error(nameError.message || "Failed to update name")
          }

          if (profileData.email !== initialProfileData.email) {
            const { error: emailError } = await authClient.changeEmail({
              newEmail: profileData.email,
              callbackURL: "/settings",
            })
            if (emailError) throw new Error(emailError.message || "Failed to change email")
            emailChanged = true
          }

          setInitialProfileData(profileData)
          router.refresh()
          return { emailChanged }
        })(),
        {
          loading: "Updating profile...",
          success: (data: { emailChanged?: boolean }) =>
            data?.emailChanged
              ? "Verification email sent to your new address."
              : "Profile updated successfully",
          error: (err: unknown) => (err instanceof Error ? err.message : String(err)) || "Failed to update profile",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)

    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            revokeOtherSessions: true,
          })

          if (error) {
            throw new Error(error.message || "Failed to update password")
          }

          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
          await fetchSecurityData()
        })(),
        {
          loading: "Updating password...",
          success: "Password updated successfully. Other sessions revoked.",
          error: (err: unknown) => (err instanceof Error ? err.message : String(err)) || "Failed to update password",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // 2FA Enrollment Handlers
  const handleStartEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEnrolling2FA(true)

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: enable2FAPassword,
        method: "totp",
      })

      if (error) {
        throw new Error(error.message || "Failed to initiate two-factor enrollment")
      }

      if (data && "totpURI" in data) {
        setTotpURI(data.totpURI)
        setBackupCodes(data.backupCodes)
      }
    } catch (err: unknown) {
      toast.add({
        title: err instanceof Error ? err.message : "Failed to begin 2FA enrollment",
        type: "error",
      })
    } finally {
      setIsEnrolling2FA(false)
    }
  }

  const handleVerify2FAEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEnrolling2FA(true)

    try {
      await toast.promise(
        (async () => {
          const { data, error } = await authClient.twoFactor.verifyTotp({
            code: totpCode.trim(),
          })

          if (error) {
            throw new Error(error.message || "Invalid verification code")
          }

          if (data) {
            setShowEnable2FA(false)
            setTotpURI("")
            setTotpCode("")
            setEnable2FAPassword("")
            setShowBackupCodes(true)
            router.refresh()
          }
          return data
        })(),
        {
          loading: "Verifying 2FA code...",
          success: "Two-Factor Authentication is now enabled!",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to verify 2FA code",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsEnrolling2FA(false)
    }
  }

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEnrolling2FA(true)

    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.twoFactor.disable({
            password: disable2FAPassword,
          })

          if (error) {
            throw new Error(error.message || "Failed to disable two-factor authentication")
          }

          setShowDisable2FA(false)
          setDisable2FAPassword("")
          router.refresh()
        })(),
        {
          loading: "Disabling 2FA...",
          success: "Two-Factor Authentication disabled",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to disable 2FA",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsEnrolling2FA(false)
    }
  }

  // Passkey Handlers
  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingPasskey(true)

    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.passkey.addPasskey({
            name: passkeyName.trim() || `${user?.name || "Volt"}'s Passkey`,
          })

          if (error) {
            throw new Error(error.message || "Failed to register passkey")
          }

          setShowAddPasskey(false)
          setPasskeyName("")
          await fetchSecurityData()
        })(),
        {
          loading: "Registering passkey...",
          success: "Passkey registered successfully!",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to register passkey",
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsAddingPasskey(false)
    }
  }

  const handleDeletePasskey = async (id: string) => {
    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.passkey.deletePasskey({ id })
          if (error) {
            throw new Error(error.message || "Failed to remove passkey")
          }
          await fetchSecurityData()
        })(),
        {
          loading: "Removing passkey...",
          success: "Passkey deleted",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to remove passkey",
        }
      )
    } catch {
      // Handled by toast.promise
    }
  }

  // Session Handlers
  const handleRevokeSession = async (token: string) => {
    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.revokeSession({ token })
          if (error) {
            throw new Error(error.message || "Failed to revoke session")
          }
          await fetchSecurityData()
        })(),
        {
          loading: "Revoking session...",
          success: "Session revoked",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to revoke session",
        }
      )
    } catch {
      // Handled by toast.promise
    }
  }

  const handleRevokeOtherSessions = async () => {
    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.revokeOtherSessions()
          if (error) {
            throw new Error(error.message || "Failed to revoke other sessions")
          }
          await fetchSecurityData()
        })(),
        {
          loading: "Revoking other sessions...",
          success: "All other sessions revoked successfully",
          error: (err: unknown) =>
            err instanceof Error ? err.message : "Failed to revoke other sessions",
        }
      )
    } catch {
      // Handled by toast.promise
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await toast.promise(
        (async () => {
          const { error } = await authClient.deleteUser({
            callbackURL: "/sign-in",
          })

          if (error) {
            throw new Error(error.message || "Failed to delete account")
          }

          router.push("/sign-in")
        })(),
        {
          loading: "Deleting account...",
          success: "Account deleted successfully",
          error: (err: unknown) => (err instanceof Error ? err.message : String(err)) || "Failed to delete account",
        }
      )
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 @container/main">
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full" ref={contentRef}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings className="size-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                Settings
              </h1>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl font-medium">
              Manage your personal identity, security credentials, passkeys, and active sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="w-full"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
              {/* Navigation Tabs List */}
              <TabsList>
                <TabsTrigger value="profile">
                  <User />
                  Profile Details
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock />
                  Security & Access
                </TabsTrigger>
                <TabsTrigger value="danger">
                  <ShieldAlert />
                  Danger Zone
                </TabsTrigger>
              </TabsList>

              {/* Tabs Contents Panel */}
              <div className="flex-1 w-full space-y-6">
                {/* PROFILE DETAILS */}
                <TabsContent value="profile">
                  <div className="space-y-6">
                    <form onSubmit={handleUpdateProfile}>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Public Profile</CardTitle>
                              <CardDescription>Update your personal information and verified email address.</CardDescription>
                            </div>
                            <Badge variant="secondary">
                              {user?.role || "user"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="Your Name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                placeholder="your@email.com"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button type="submit" disabled={isUpdatingProfile || !isProfileDirty}>
                            {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>
                  </div>
                </TabsContent>

                {/* SECURITY & LOGIN */}
                <TabsContent value="security">
                  <div className="space-y-6">
                    {/* Two-Factor Authentication Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                              <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                                {is2FAEnabled ? "ACTIVE" : "DISABLED"}
                              </Badge>
                            </div>
                            <CardDescription>
                              Protect your account by requiring an authenticator code on login.
                            </CardDescription>
                          </div>
                          {is2FAEnabled ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDisable2FA(true)}
                              >
                                Disable 2FA
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setTotpURI("")
                                setTotpCode("")
                                setEnable2FAPassword("")
                                setShowEnable2FA(true)
                              }}
                            >
                              Enable 2FA
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Passkeys Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>Passkeys</CardTitle>
                              <Badge variant="secondary">
                                {passkeys.length} REGISTERED
                              </Badge>
                            </div>
                            <CardDescription>
                              Sign in securely with biometric verification or security keys without entering passwords.
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddPasskey(true)}
                          >
                            <Plus className="size-4" />
                            Add Passkey
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {securityLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="size-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : passkeys.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              No passkeys registered yet. Add a passkey to enable biometric login.
                            </p>
                          ) : (
                            <div className="divide-y divide-border/40 rounded-xl border border-border/40 overflow-hidden">
                              {passkeys.map((pk) => (
                                <div key={pk.id} className="flex items-center justify-between p-3.5 bg-background/40">
                                  <div className="flex items-center gap-3">
                                    <Key className="size-4 text-primary" />
                                    <div>
                                      <p className="text-sm font-semibold">{pk.name || "Unnamed Passkey"}</p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        ID: {pk.id.slice(0, 12)}...
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleDeletePasskey(pk.id)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Update Password Card */}
                    <form onSubmit={handleUpdatePassword}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Change Password</CardTitle>
                          <CardDescription>Update your existing account password and revoke other open sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button type="submit" disabled={isUpdatingPassword || !isPasswordValid}>
                            {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    {/* Active Sessions Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>Active Sessions</CardTitle>
                              <Badge variant="secondary">
                                {sessions.length} ACTIVE
                              </Badge>
                            </div>
                            <CardDescription>
                              Review and revoke devices that currently hold active authentication tokens.
                            </CardDescription>
                          </div>
                          {sessions.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRevokeOtherSessions}
                            >
                              <LogOut className="size-4" />
                              Revoke Other Sessions
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {securityLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="size-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="divide-y divide-border/40 rounded-xl border border-border/40 overflow-hidden">
                              {sessions.map((s) => {
                                const isCurrent = s.token === session.session.token
                                return (
                                  <div key={s.id} className="flex items-center justify-between p-3.5 bg-background/40">
                                    <div className="flex items-center gap-3">
                                      {s.userAgent?.toLowerCase().includes("mobile") ? (
                                        <Smartphone className="size-5 text-primary" />
                                      ) : (
                                        <Laptop className="size-5 text-primary" />
                                      )}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-semibold truncate max-w-xs md:max-w-md">
                                            {s.userAgent || "Unknown Browser / Client"}
                                          </p>
                                          {isCurrent && (
                                            <Badge variant="default">
                                              CURRENT
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">
                                          IP: {s.ipAddress || "Localhost / Proxy"} • Started:{" "}
                                          {new Date(s.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    {!isCurrent && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRevokeSession(s.token)}
                                      >
                                        Revoke
                                      </Button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* DANGER ZONE */}
                <TabsContent value="danger">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delete Account</CardTitle>
                      <CardDescription>
                        Once deleted, your account and associated records cannot be recovered.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold">
                        <ShieldAlert className="size-5 shrink-0" />
                        <p>Deleting your account is permanent and will remove all access to your resources, collections, and configurations.</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="destructive" className="min-w-35" />
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogMedia>
                              <ShieldAlert className="text-destructive" />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you absolutely sure you want to delete your account? This action is irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Enable 2FA Dialog */}
      <Dialog open={showEnable2FA} onOpenChange={setShowEnable2FA}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {totpURI
                ? "Scan the TOTP URI in your authenticator app (Google Authenticator, 1Password) and enter the 6-digit code."
                : "Enter your account password to generate your two-factor authenticator setup."}
            </DialogDescription>
          </DialogHeader>

          {!totpURI ? (
            <>
              <form id="enable-2fa-start-form" onSubmit={handleStartEnable2FA}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="twofa-password">Account Password</FieldLabel>
                    <Input
                      id="twofa-password"
                      type="password"
                      value={enable2FAPassword}
                      onChange={(e) => setEnable2FAPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                    />
                  </Field>
                </FieldGroup>
              </form>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" form="enable-2fa-start-form" disabled={isEnrolling2FA || !enable2FAPassword}>
                  {isEnrolling2FA && <Loader2 className="animate-spin" data-icon="inline-start" />}
                  Continue
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <form id="enable-2fa-verify-form" onSubmit={handleVerify2FAEnrollment} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Authenticator Setup Key</span>
                  <div className="p-3 bg-muted/60 rounded-lg text-xs font-mono break-all select-all border border-border/40">
                    {totpURI}
                  </div>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="twofa-code">Verification Code</FieldLabel>
                    <Input
                      id="twofa-code"
                      type="text"
                      placeholder="e.g. 123456"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      required
                      autoFocus
                      className="text-center"
                    />
                  </Field>
                </FieldGroup>
              </form>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" form="enable-2fa-verify-form" disabled={isEnrolling2FA || totpCode.trim().length < 6}>
                  {isEnrolling2FA && <Loader2 className="animate-spin" data-icon="inline-start" />}
                  Verify & Activate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Please enter your password to confirm turning off 2FA protection.
            </DialogDescription>
          </DialogHeader>
          <form id="disable-2fa-form" onSubmit={handleDisable2FA}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="disable-twofa-password">Account Password</FieldLabel>
                <Input
                  id="disable-twofa-password"
                  type="password"
                  value={disable2FAPassword}
                  onChange={(e) => setDisable2FAPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                />
              </Field>
            </FieldGroup>
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" form="disable-2fa-form" variant="destructive" disabled={isEnrolling2FA || !disable2FAPassword}>
              {isEnrolling2FA && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                <span>2FA Active: Save Your Backup Codes</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Save these one-time recovery codes in a secure password manager. If you lose your authenticator device, each code can be used once to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/50 rounded-xl border border-border/40 grid grid-cols-2 gap-2 font-mono text-xs">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="p-1.5 bg-background/80 rounded border border-border/20 text-center">
                {code}
              </div>
            ))}
          </div>
          <DialogFooter className="flex sm:justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(backupCodes.join("\n"))
                toast.add({
                  title: "Backup codes copied to clipboard!",
                  type: "success",
                })
              }}
            >
              <Copy className="size-4" />
              Copy Codes
            </Button>
            <Button type="button" size="sm" onClick={() => setShowBackupCodes(false)}>
              I Have Saved These
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Passkey Dialog */}
      <Dialog
        open={showAddPasskey}
        onOpenChange={(open) => {
          setShowAddPasskey(open)
          if (!open) setPasskeyName("")
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register New Passkey</DialogTitle>
            <DialogDescription>
              Provide a label for this device or security key (e.g. &ldquo;MacBook Touch ID&rdquo; or &ldquo;YubiKey&rdquo;).
            </DialogDescription>
          </DialogHeader>
          <form id="add-passkey-form" onSubmit={handleRegisterPasskey}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="passkey-name">Passkey Label</FieldLabel>
                <Input
                  id="passkey-name"
                  placeholder="e.g. MacBook Touch ID"
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  autoFocus
                />
              </Field>
            </FieldGroup>
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" form="add-passkey-form" disabled={isAddingPasskey}>
              {isAddingPasskey && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Register Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
