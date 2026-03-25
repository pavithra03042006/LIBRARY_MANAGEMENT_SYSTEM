'use client'

import { useState } from 'react'
import { Bell, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-input pl-9"
          />
        </div>
        
        <div className="relative">
          <Bell 
            className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => setShowNotifications(!showNotifications)}
          />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-border p-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-96 space-y-1 overflow-y-auto p-2">
                <div className="rounded p-3 hover:bg-muted">
                  <p className="text-sm font-medium text-foreground">Pending Book Returns</p>
                  <p className="text-xs text-muted-foreground">3 members have overdue books</p>
                </div>
                <div className="rounded p-3 hover:bg-muted">
                  <p className="text-sm font-medium text-foreground">Outstanding Fines</p>
                  <p className="text-xs text-muted-foreground">₹5,420 in pending fines</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
