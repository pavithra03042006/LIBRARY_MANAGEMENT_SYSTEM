'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { getUsers, createUser } from '@/lib/store'
import type { User, UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Shield, Settings as SettingsIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserFormData {
  name: string
  email: string
  password: string
  role: UserRole
}

const defaultFormData: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'librarian',
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(defaultFormData)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // System settings
  const [finePerDay, setFinePerDay] = useState('1.00')
  const [maxBooksPerMember, setMaxBooksPerMember] = useState('5')
  const [loanPeriodDays, setLoanPeriodDays] = useState('14')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers(getUsers())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === formData.email)
    if (existingUser) {
      setError('A user with this email already exists.')
      return
    }

    createUser(formData)
    setSuccess(`User "${formData.name}" has been created successfully.`)
    setIsDialogOpen(false)
    setFormData(defaultFormData)
    loadUsers()

    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'librarian':
        return 'default'
      case 'member':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Settings" subtitle="Manage system settings and users" />

      <div className="p-6 space-y-6">
        {success && (
          <Alert className="border-success bg-success/10">
            <AlertDescription className="text-success">{success}</AlertDescription>
          </Alert>
        )}

        {/* System Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <SettingsIcon className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure library system parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="finePerDay">Fine per Day ($)</Label>
                <Input
                  id="finePerDay"
                  type="number"
                  step="0.01"
                  min="0"
                  value={finePerDay}
                  onChange={(e) => setFinePerDay(e.target.value)}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">
                  Amount charged per day for overdue books
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBooks">Max Books per Member</Label>
                <Input
                  id="maxBooks"
                  type="number"
                  min="1"
                  value={maxBooksPerMember}
                  onChange={(e) => setMaxBooksPerMember(e.target.value)}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum books a member can borrow at once
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanPeriod">Default Loan Period (Days)</Label>
                <Input
                  id="loanPeriod"
                  type="number"
                  min="1"
                  value={loanPeriodDays}
                  onChange={(e) => setLoanPeriodDays(e.target.value)}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">
                  Default number of days for book loans
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage system users and their roles
              </CardDescription>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account for the library system.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create User</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-card-foreground">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Overview of role-based access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="destructive">Admin</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Full system access
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    User management
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    System settings
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    All reports
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge>Librarian</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Book management
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Member management
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Issue/Return books
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Fine collection
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Member</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    View dashboard
                  </li>
                  <li className="flex items-center gap-2 text-card-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    View own fines
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                    Limited access
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
