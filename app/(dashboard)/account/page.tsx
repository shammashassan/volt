"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Loader2, User, Lock, Trash2, ShieldAlert, UserCircle } from "lucide-react"


// Register the useGSAP plugin
gsap.registerPlugin(useGSAP)

export default function AccountPage() {
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

  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  // GSAP animation on tab change
  useGSAP(
    () => {
      if (contentRef.current) {
        const targets = contentRef.current.querySelectorAll('[data-slot="tabs-content"]')
        if (targets && targets.length > 0) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 }
          )
        }
      }
    },
    { dependencies: [activeTab], scope: contentRef }
  )

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
    } catch (error) {
      const err = error as Error
      toast.error(err.message || "Failed to update profile")
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
    <div className="flex flex-1 flex-col gap-6 pb-12 @container/main">
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full" ref={contentRef}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
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
        </div>
      </section>

      <section className="px-4 lg:px-6">
        <div className="max-w-5xl mx-auto w-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="flex flex-col lg:flex-row gap-6 items-start w-full"
          >
            {/* Navigation Tabs List */}
            <TabsList className="flex flex-col w-full lg:w-60 lg:shrink-0  bg-card p-1.5 shadow-md space-y-0.5 overflow-visible">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2.5 text-xs lg:text-sm font-semibold cursor-pointer"
              >
                <User className="size-4" />
                Profile Details
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2.5 text-xs lg:text-sm font-semibold cursor-pointer"
              >
                <Lock className="size-4" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center gap-2 justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2.5 text-xs lg:text-sm font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <ShieldAlert className="size-4" />
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* Tabs Contents Panel */}
            <div className="flex-1 w-full">
              {/* PROFILE DETAILS */}
              <TabsContent value="profile" className="outline-none">
                <Card className="border-none shadow-2xl bg-background/40 backdrop-blur-xl overflow-hidden">
                  <form onSubmit={handleUpdateProfile}>
                    <CardHeader className="pb-4">
                      <CardTitle>Public Profile</CardTitle>
                      <CardDescription>How others see you on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2 pb-6">
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
                    <CardFooter className="px-6 py-4 flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile || !isProfileDirty} className="min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer">
                        {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* SECURITY & LOGIN */}
              <TabsContent value="security" className="outline-none">
                <Card className="border-none shadow-2xl bg-background/40 backdrop-blur-xl overflow-hidden">
                  <form onSubmit={handleUpdatePassword}>
                    <CardHeader className="pb-4">
                      <CardTitle>Update Password</CardTitle>
                      <CardDescription>Choose a secure password to protect your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2 pb-6">
                      <div className="grid gap-3">
                        <Label htmlFor="currentPassword" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="h-12 bg-background/50"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="newPassword" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="h-12 bg-background/50"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="confirmPassword" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="h-12 bg-background/50"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 flex justify-end">
                      <Button type="submit" disabled={isUpdatingPassword || !isPasswordValid} className="min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer">
                        {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* DANGER ZONE */}
              <TabsContent value="danger" className="outline-none">
                <Card className="border-2 border-destructive/20 shadow-2xl bg-destructive/5 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-destructive">Delete Account</CardTitle>
                    <CardDescription>
                      Once deleted, your account cannot be recovered.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold">
                      <ShieldAlert className="size-5 shrink-0" />
                      <p>Deleting your account is permanent and will remove all access to your resources, collections, and configurations.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="min-w-[140px] shadow-lg shadow-destructive/20 transition-all active:scale-95 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive">
                            <ShieldAlert />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be permanently wiped.
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
          </Tabs>
        </div>
      </section>
    </div>
  )
}

