"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Briefcase,
  BarChart3,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    name: "Job Postings",
    href: "/admin/dashboard/jobs",
    icon: Briefcase,
  },
  {
    name: "Applications",
    href: "/admin/dashboard/applications",
    icon: FileText,
  },
  {
    name: "Companies",
    href: "/admin/dashboard/companies",
    icon: Users,
  },
  {
    name: "Profile",
    href: "/admin/dashboard/profile",
    icon: User,
  }
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">ALCRM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start cursor-pointer",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <span>© 2025 ALCRM</span>
          </div>
        </div>
      )}
    </div>
  );
} 