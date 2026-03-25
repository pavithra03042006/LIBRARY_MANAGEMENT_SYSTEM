'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/dashboard/header'
import { getMembers, createMember, updateMember, deleteMember, searchMembers } from '@/lib/store'
import type { Member, MembershipType, MemberStatus } from '@/lib/types'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, Users, Upload, FileSpreadsheet, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import * as XLSX from 'xlsx'

interface MemberFormData {
  name: string
  email: string
  phone: string
  address: string
  membershipType: MembershipType
  status: MemberStatus
  joinDate: string
  expiryDate: string
  totalFines: number
  paidFines: number
}

const defaultFormData: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  membershipType: 'standard',
  status: 'active',
  joinDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  totalFines: 0,
  paidFines: 0,
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState<MemberFormData>(defaultFormData)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [importedData, setImportedData] = useState<Partial<MemberFormData>[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = () => {
    setMembers(getMembers())
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setMembers(searchMembers(query))
    } else {
      loadMembers()
    }
  }

  const handleOpenDialog = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        address: member.address,
        membershipType: member.membershipType,
        status: member.status,
        joinDate: member.joinDate,
        expiryDate: member.expiryDate,
        totalFines: member.totalFines,
        paidFines: member.paidFines,
      })
    } else {
      setEditingMember(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingMember) {
      updateMember(editingMember.id, formData)
    } else {
      createMember(formData)
    }
    
    setIsDialogOpen(false)
    loadMembers()
  }

  const handleDelete = (id: string) => {
    deleteMember(id)
    setDeleteConfirmId(null)
    loadMembers()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const mappedData: Partial<MemberFormData>[] = jsonData.map((row: Record<string, unknown>) => ({
          name: String(row['Name'] || row['name'] || ''),
          email: String(row['Email'] || row['email'] || ''),
          phone: String(row['Phone'] || row['phone'] || row['Contact'] || ''),
          address: String(row['Address'] || row['address'] || ''),
          membershipType: (String(row['Membership Type'] || row['membershipType'] || 'standard').toLowerCase() as MembershipType) || 'standard',
          status: 'active' as MemberStatus,
          joinDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalFines: 0,
          paidFines: 0,
        }))

        setImportedData(mappedData.filter(m => m.name && m.email))
        setIsImportDialogOpen(true)
      } catch {
        setImportError('Failed to parse file. Please ensure it is a valid Excel or CSV file.')
      }
    }

    reader.readAsBinaryString(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImportConfirm = () => {
    importedData.forEach((member) => {
      if (member.name && member.email) {
        createMember({
          name: member.name,
          email: member.email,
          phone: member.phone || '',
          address: member.address || '',
          membershipType: member.membershipType || 'standard',
          status: member.status || 'active',
          joinDate: member.joinDate || new Date().toISOString().split('T')[0],
          expiryDate: member.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalFines: 0,
          paidFines: 0,
        })
      }
    })
    setIsImportDialogOpen(false)
    setImportedData([])
    loadMembers()
  }

  const getStatusBadgeVariant = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'suspended':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Member Management" subtitle="Manage library members and memberships" />

      <div className="p-6">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-input pl-9"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card">
                    <DialogHeader>
                      <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                      <DialogDescription>
                        {editingMember ? 'Update member details below.' : 'Enter member details below.'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
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
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="bg-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="membershipType">Membership Type</Label>
                          <Select
                            value={formData.membershipType}
                            onValueChange={(value: MembershipType) => setFormData({ ...formData, membershipType: value })}
                          >
                            <SelectTrigger className="bg-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: MemberStatus) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger className="bg-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            required
                            className="bg-input"
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                            className="bg-input"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingMember ? 'Update Member' : 'Add Member'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {importError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-destructive">
                <X className="h-4 w-4" />
                <p className="text-sm">{importError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Member</TableHead>
                    <TableHead className="text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-muted-foreground">Membership</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Expiry</TableHead>
                    <TableHead className="text-right text-muted-foreground">Fines</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">No members found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-card-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {member.membershipType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)} className="capitalize">
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.expiryDate}</TableCell>
                        <TableCell className="text-right">
                          {member.totalFines - member.paidFines > 0 ? (
                            <span className="font-medium text-destructive">
                              ₹{(member.totalFines - member.paidFines).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">₹0.00</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Members from Excel
            </DialogTitle>
            <DialogDescription>
              Review the data below before importing. {importedData.length} members will be added.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Phone</TableHead>
                  <TableHead className="text-muted-foreground">Membership</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedData.map((member, index) => (
                  <TableRow key={index} className="border-border">
                    <TableCell className="text-card-foreground">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell className="text-muted-foreground">{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {member.membershipType}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportConfirm}>
              Import {importedData.length} Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
