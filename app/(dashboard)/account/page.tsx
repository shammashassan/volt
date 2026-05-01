"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, User, Lock, Trash2, ShieldAlert, Mail, UserCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Profile state for dirty check
  const [profileData, setProfileData] = useState({ name: "", email: "" })
  const [initialProfileData, setInitialProfileData] = useState({ name: "", email: "" })
  
  // Password state
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      const data = { name: session.user.name || "", email: session.user.email || "" }
      setProfileData(data)
      setInitialProfileData(data)
    }
  }, [session])

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  const isProfileDirty = profileData.name !== initialProfileData.name || profileData.email !== initialProfileData.email
  const isPasswordValid = passwordData.currentPassword && passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      // Update Name if changed
      if (profileData.name !== initialProfileData.name) {
        const { error: nameError } = await authClient.updateUser({
          name: profileData.name,
        })
        if (nameError) throw nameError
      }

      // Update Email if changed
      if (profileData.email !== initialProfileData.email) {
        const { error: emailError } = await authClient.changeEmail({
          newEmail: profileData.email,
          callbackURL: "/account"
        })
        if (emailError) throw emailError
        toast.info("A verification email has been sent to your new address.")
      } else {
        toast.success("Profile updated successfully")
      }

      setInitialProfileData(profileData)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)

    const { error } = await authClient.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      revokeOtherSessions: true,
    })

    if (error) {
      toast.error(error.message || "Failed to update password")
    } else {
      toast.success("Password updated successfully")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
    setIsUpdatingPassword(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await authClient.deleteUser({
        callbackURL: "/login"
    })

    if (error) {
      toast.error(error.message || "Failed to delete account")
      setIsDeleting(false)
    } else {
      toast.success("Account deleted successfully")
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCircle className="size-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
              Account Settings
            </h1>
          </div>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
            Manage your personal information, security preferences, and account status.
          </p>
        </div>

        <Separator className="opacity-40" />

        <div className="grid gap-10 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="size-5 text-primary" />
              Profile
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">
              Update your public name and email address. Changing your email will require re-verification.
            </p>
          </div>
          <Card className="border-none shadow-2xl bg-background/40 backdrop-blur-xl overflow-hidden">
            <form onSubmit={handleUpdateProfile}>
              <CardHeader className="bg-muted/30 pb-8">
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>How others see you on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Your Name"
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email} 
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-4 flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile || !isProfileDirty} className="min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Separator className="opacity-40" />

        <div className="grid gap-10 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              Security
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">
              Keep your account secure by using a strong password. We recommend revoking other sessions when changing it.
            </p>
          </div>
          <Card className="border-none shadow-2xl bg-background/40 backdrop-blur-xl overflow-hidden">
            <form onSubmit={handleUpdatePassword}>
              <CardHeader className="bg-muted/30 pb-8">
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Choose a secure password to protect your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="grid gap-3">
                  <Label htmlFor="currentPassword text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="newPassword text-sm font-bold uppercase tracking-wider text-muted-foreground/60">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="h-12 bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-4 flex justify-end">
                <Button type="submit" disabled={isUpdatingPassword || !isPasswordValid} className="min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Separator className="opacity-40" />

        <div className="grid gap-10 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">
              Permanently delete your account. This action will immediately log you out and delete all your data.
            </p>
          </div>
          <Card className="border-2 border-destructive/20 shadow-2xl bg-destructive/5 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-8">
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Once deleted, your account cannot be recovered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold">
                <ShieldAlert className="size-5 shrink-0" />
                <p>Deleting your account is permanent and will remove all access to your resources, collections, and configurations.</p>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="min-w-[140px] shadow-lg shadow-destructive/20 transition-all active:scale-95">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-destructive/30 bg-background/95 backdrop-blur-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2 text-2xl font-black">
                      <ShieldAlert className="size-6" />
                      Final Confirmation
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-medium pt-2">
                      Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be permanently wiped.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-6">
                    <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 px-8 font-bold"
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
        </div>
      </div>
    </div>
  )
}
