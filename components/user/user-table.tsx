"use client"

import * as React from "react"
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  MoreHorizontal,
  CheckCircle2,
  Ban,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Mail,
  User,
  Users,
} from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  banned?: boolean
}

interface UserTableProps {
  users: UserData[]
  onSetRole: (id: string, role: string) => Promise<void> | void
  onBan: (id: string, isBanned: boolean) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  currentUserId?: string
}

export function UserTable({ users, onSetRole, onBan, onDelete, currentUserId }: UserTableProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px] h-10">User</TableHead>
              <TableHead className="h-10">Role</TableHead>
              <TableHead className="h-10">Status</TableHead>
              <TableHead className="h-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-44 text-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Users className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle>No users found</EmptyTitle>
                      <EmptyDescription>
                        No user accounts matched the current filter criteria.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: UserData) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="size-3" />
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === "admin" ? (
                        <ShieldCheck className="size-3 text-primary" />
                      ) : (
                        <User className="size-3 text-muted-foreground" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {user.banned ? (
                        <Badge variant="destructive">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUserId ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <span className="sr-only">Open actions menu</span>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onSetRole(user.id, user.role === "admin" ? "user" : "admin")}
                            >
                              {user.role === "admin" ? (
                                <ShieldAlert className="size-4" />
                              ) : (
                                <ShieldCheck className="size-4" />
                              )}
                              <span>Make {user.role === "admin" ? "User" : "Admin"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onBan(user.id, !!user.banned)}
                            >
                              {user.banned ? <Unlock className="size-4" /> : <Ban className="size-4" />}
                              <span>{user.banned ? "Unban User" : "Ban User"}</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(user.id)}
                            >
                              <Trash2 className="size-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge variant="outline">
                        <span className="font-mono">You</span>
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
