"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavSubItem {
  title: string
  url: string
  isActive?: boolean
}

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavSubItem[]
}

export function NavMain({
  items,
  label,
  className,
}: {
  items: NavItem[]
  label?: string
  className?: string
}) {
  const { state, setOpen, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

  const handleLinkClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        {items.map((item) => {
          if (item.items?.length) {
            const isGroupActive = item.isActive || item.items.some((subItem) => subItem.isActive)
            const isOpen = isCollapsed
              ? false
              : (openGroups[item.title] ?? isGroupActive ?? false)

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenGroups((prev) => ({ ...prev, [item.title]: open }))
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isGroupActive}
                        className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden"
                        onClick={() => {
                          if (isCollapsed) {
                            setOpen(true)
                            setOpenGroups((prev) => ({
                              ...prev,
                              [item.title]: true,
                            }))
                          }
                        }}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90 group-data-[open]/collapsible:rotate-90 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={subItem.isActive}
                            render={
                              <Link href={subItem.url} onClick={handleLinkClick}>
                                <span>{subItem.title}</span>
                              </Link>
                            }
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden"
                render={
                  <Link href={item.url} onClick={handleLinkClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
