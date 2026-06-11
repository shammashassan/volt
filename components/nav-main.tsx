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
}: {
  items: NavItem[]
  label?: string
}) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Track which collapsible groups are open by title
  const [openItems, setOpenItems] = React.useState<string[]>(() =>
    items.filter((i) => i.isActive && i.items?.length).map((i) => i.title)
  )

  const handleTriggerClick = (item: NavItem) => {
    // When sidebar is collapsed and item has children:
    // expand the sidebar first, then open this group after animation
    if (isCollapsed && item.items?.length) {
      toggleSidebar()
      setTimeout(() => {
        setOpenItems((prev) =>
          prev.includes(item.title) ? prev : [...prev, item.title]
        )
      }, 150)
    }
  }

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <Collapsible
              key={item.title}
              asChild
              open={openItems.includes(item.title)}
              onOpenChange={(open) =>
                setOpenItems((prev) =>
                  open
                    ? [...prev, item.title]
                    : prev.filter((t) => t !== item.title)
                )
              }
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    onClick={() => handleTriggerClick(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}