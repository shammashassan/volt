"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  CheckCircle2, 
  UsersIcon
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
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
import { UserTable } from "./user/user-table"
import { CreateUserDialog } from "./user/create-user-dialog"

export function UserManagement({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  // Synchronize state with props when Server Component re-renders
  React.useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const pendingUsers = users.filter((u) => !u.isApproved)
  const activeUsers = users.filter((u) => u.isApproved)

  const handleApprove = async (userId: string) => {
    startTransition(async () => {
      const { error } = await authClient.admin.updateUser({
        userId,
        data: { isApproved: true }
      })

      if (error) {
        toast.error(error.message || "Failed to approve user")
      } else {
        toast.success("User approved successfully")
        setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u))
        router.refresh()
      }
    })
  }

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    startTransition(async () => {
      const { error } = await authClient.admin.setRole({ userId, role })
      if (error) {
        toast.error(error.message || "Failed to set role")
      } else {
        toast.success(`Role updated to ${role}`)
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
        router.refresh()
      }
    })
  }

  const handleBan = async (userId: string, isBanned: boolean) => {
    startTransition(async () => {
        let result;
        if (isBanned) {
            result = await authClient.admin.unbanUser({ userId })
        } else {
            result = await authClient.admin.banUser({ userId })
        }
        
        if (result.error) {
            toast.error(result.error.message)
        } else {
            toast.success(isBanned ? "User unbanned" : "User banned")
            setUsers(users.map(u => u.id === userId ? { ...u, banned: !isBanned } : u))
            router.refresh()
        }
    })
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    startTransition(async () => {
      const { error } = await authClient.admin.removeUser({ userId: userToDelete })
      
      if (error) {
        toast.error(error.message || "Failed to delete user")
      } else {
        toast.success("User deleted successfully")
        setUsers(users.filter(u => u.id !== userToDelete))
        router.refresh()
      }
      setUserToDelete(null)
    })
  }

  return (
    <div className="flex flex-1 flex-col @container/main">
      <div className="flex flex-col gap-4 px-4 py-8 md:gap-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              Manage user roles, approvals, and account statuses.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Separator className="opacity-40" />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="active" className="gap-2">
            Active Users
            <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">
              {activeUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Signup Requests
            <Badge variant={pendingUsers.length > 0 ? "secondary" : "outline"} className="h-5 px-1.5 min-w-[20px] justify-center">
              {pendingUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
          <UserTable 
            users={activeUsers} 
            onApprove={handleApprove} 
            onSetRole={handleSetRole} 
            onBan={handleBan}
            onDelete={handleDelete}
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="pending" className="border rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden">
          {pendingUsers.length > 0 ? (
            <UserTable 
                users={pendingUsers} 
                onApprove={handleApprove} 
                onSetRole={handleSetRole} 
                onBan={handleBan}
                onDelete={handleDelete}
                currentUserId={currentUserId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle2 className="size-12 text-muted-foreground/20 mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground/60 mt-1">All signup requests have been processed.</p>
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
    </div>
  )
}
