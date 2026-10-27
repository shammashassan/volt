"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  UsersIcon,
  Ban,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserTable } from "./user-table"
import { CreateUserDialog } from "./create-user-dialog"

export interface UserData {
  id: string
  name: string
  email: string
  role: string
  banned?: boolean
}

export function UserManagement({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active")
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const [mounted, setMounted] = useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Synchronize state with props when Server Component re-renders
  React.useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const activeUsers = users.filter((u) => !u.banned)
  const bannedUsers = users.filter((u) => !!u.banned)

  const handleSetRole = async (userId: string, role: string) => {
    if (role !== "user" && role !== "admin") return;
    startTransition(async () => {
      const promise = authClient.admin.setRole({ userId, role: role as "user" | "admin" }).then(({ error }) => {
        if (error) {
          throw new Error(error.message || "Failed to set role");
        }
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
        router.refresh();
      });

      toast.promise(promise, {
        loading: "Updating role...",
        success: `Role updated to ${role}`,
        error: (err: any) => err?.message || "Failed to set role",
      });
    });
  }

  const handleBan = async (userId: string, isBanned: boolean) => {
    startTransition(async () => {
      const promise = (isBanned
        ? authClient.admin.unbanUser({ userId })
        : authClient.admin.banUser({ userId })
      ).then((result) => {
        if (result.error) {
          throw new Error(result.error.message || "Failed to update ban status");
        }
        setUsers(users.map(u => u.id === userId ? { ...u, banned: !isBanned } : u));
        router.refresh();
      });

      toast.promise(promise, {
        loading: isBanned ? "Unbanning user..." : "Banning user...",
        success: isBanned ? "User unbanned" : "User banned",
        error: (err: any) => err?.message || "Failed to update ban status",
      });
    });
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const targetUserId = userToDelete;
    setUserToDelete(null);

    startTransition(async () => {
      const promise = authClient.admin.removeUser({ userId: targetUserId }).then(({ error }) => {
        if (error) {
          throw new Error(error.message || "Failed to delete user");
        }
        setUsers(users.filter(u => u.id !== targetUserId));
        router.refresh();
      });

      toast.promise(promise, {
        loading: "Deleting user...",
        success: "User deleted successfully",
        error: (err: any) => err?.message || "Failed to delete user",
      });
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UsersIcon className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  User Management
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {users.length} <span className="hidden sm:inline ml-1">Total Users</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Manage user roles, bans, and account permissions.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus />
            Create User
          </Button>
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="active">
                <UsersIcon />
                Active Users
                <Badge variant="secondary" size="sm">
                  {activeUsers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="banned">
                <Ban />
                Banned Users
                <Badge variant={bannedUsers.length > 0 ? "destructive" : "outline"} size="sm">
                  {bannedUsers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <UserTable
                users={activeUsers}
                onSetRole={handleSetRole}
                onBan={handleBan}
                onDelete={handleDelete}
                currentUserId={mounted ? currentUserId : undefined}
              />
            </TabsContent>

            <TabsContent value="banned">
              {bannedUsers.length > 0 ? (
                <UserTable
                  users={bannedUsers}
                  onSetRole={handleSetRole}
                  onBan={handleBan}
                  onDelete={handleDelete}
                  currentUserId={mounted ? currentUserId : undefined}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Ban className="size-12 text-muted-foreground/20 mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground">No banned users</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">There are currently no suspended or banned accounts.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CreateUserDialog
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            onSuccess={() => {
              router.refresh()
            }}
          />

          <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account
                  and all associated data from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    confirmDeleteUser()
                  }}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? "Deleting..." : "Delete User"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  )
}
