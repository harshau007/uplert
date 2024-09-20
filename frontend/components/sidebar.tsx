"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Globe, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Websites", href: "/", icon: Globe },
  { name: "Who's on-call?", href: "/on-call", icon: Users },
  { name: "Incidents", href: "/incidents", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background border-r">
      <div className="p-4">
        <h1 className="flex text-2xl font-bold m-4">
          <img src="/uplert.svg" className="w-10 h-10 mr-2" />
          <span className="mt-1.5">Uplert</span>
        </h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mt-1",
                  pathname === item.href && "bg-muted/50",
                  "hover:bg-muted/50"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
