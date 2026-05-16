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
  MoreHorizontal, 
  CheckCircle2, 
  Ban, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert,
  Trash2,
  Mail
} from "lucide-react"

export function UserTable({ users, onApprove, onSetRole, onBan, onDelete, currentUserId }: any) {
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
