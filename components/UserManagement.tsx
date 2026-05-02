"use client"

import * as React from "react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  UserPlus, 
  CheckCircle2, 
  Ban, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert,
  Trash2,
  Mail
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export function UserManagement({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const pendingUsers = users.filter((u) => !u.isApproved)
  const activeUsers = users.filter((u) => u.isApproved)

  const handleApprove = async (userId: string) => {
    setIsLoading(true)
    const { data, error } = await authClient.admin.updateUser({
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
    setIsLoading(false)
  }

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    const { error } = await authClient.admin.setRole({ userId, role })
    if (error) {
      toast.error(error.message || "Failed to set role")
    } else {
      toast.success(`Role updated to ${role}`)
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
    }
  }

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (isBanned) {
        const { error } = await authClient.admin.unbanUser({ userId })
        if (error) toast.error(error.message)
        else {
            toast.success("User unbanned")
            setUsers(users.map(u => u.id === userId ? { ...u, banned: false } : u))
        }
    } else {
        const { error } = await authClient.admin.banUser({ userId })
        if (error) toast.error(error.message)
        else {
            toast.success("User banned")
            setUsers(users.map(u => u.id === userId ? { ...u, banned: true } : u))
        }
    }
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    setIsLoading(true)
    const { error } = await authClient.admin.removeUser({ userId: userToDelete })
    
    if (error) {
      toast.error(error.message || "Failed to delete user")
    } else {
      toast.success("User deleted successfully")
      setUsers(users.filter(u => u.id !== userToDelete))
      router.refresh()
    }
    setIsLoading(false)
    setUserToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account directly. They will be automatically approved.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault()
            setIsLoading(true)
            const formData = new FormData(e.currentTarget)
            const email = formData.get("email") as string
            const name = formData.get("name") as string
            const password = formData.get("password") as string
            const role = formData.get("role") as "user" | "admin"

            const { data, error } = await authClient.admin.createUser({
                email,
                name,
                password,
                role,
                data: { isApproved: true }
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success("User created successfully")
                setIsCreateModalOpen(false)
                router.refresh()
                window.location.reload()
            }
            setIsLoading(false)
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="user">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDeleteUser()
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function UserTable({ users, onApprove, onSetRole, onBan, onDelete, currentUserId }: any) {
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="w-[250px]">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: any) => (
          <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-foreground/90">{user.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {user.email}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize font-bold tracking-tight">
                {user.role === "admin" && <ShieldCheck className="mr-1 size-3" />}
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {!user.isApproved && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                        Pending
                    </Badge>
                )}
                {user.isApproved && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Approved
                    </Badge>
                )}
                {user.banned && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Banned
                    </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {user.id !== currentUserId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {!user.isApproved && (
                      <DropdownMenuItem onClick={() => onApprove(user.id)} className="text-emerald-500 focus:text-emerald-500">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onSetRole(user.id, user.role === "admin" ? "user" : "admin")}>
                        {user.role === "admin" ? <ShieldAlert className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Make {user.role === "admin" ? "User" : "Admin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBan(user.id, !!user.banned)} className={user.banned ? "text-emerald-500" : "text-amber-500"}>
                        {user.banned ? <Unlock className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                        {user.banned ? "Unban User" : "Ban User"}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-500 focus:text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground/40">
                  You
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
