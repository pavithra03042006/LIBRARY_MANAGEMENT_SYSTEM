'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { getTransactions, getBooks, getMembers, payFine } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import type { Transaction, Book, Member } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Receipt, IndianRupee, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function FinesPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPaidOnly, setShowPaidOnly] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState<Transaction | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTransactions(getTransactions())
    setBooks(getBooks())
    setMembers(getMembers())
  }

  const getBookTitle = (id: string) => books.find(b => b.id === id)?.title || 'Unknown'
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown'
  const getMember = (id: string) => members.find(m => m.id === id)

  // Filter transactions with fines
  const fineTransactions = transactions.filter(t => t.fine > 0)
  
  // For members, only show their own fines
  const filteredFines = fineTransactions.filter(t => {
    if (user?.role === 'member') {
      // Find the member associated with this user
      const member = members.find(m => m.email === user.email)
      if (member && t.memberId !== member.id) return false
    }
    
    if (showPaidOnly && !t.finePaid) return false
    if (!showPaidOnly && t.finePaid) return false
    
    if (searchQuery) {
      const book = books.find(b => b.id === t.bookId)
      const member = getMember(t.memberId)
      const q = searchQuery.toLowerCase()
      return (
        book?.title.toLowerCase().includes(q) ||
        member?.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPendingFines = fineTransactions
    .filter(t => !t.finePaid)
    .reduce((sum, t) => sum + t.fine, 0)
  
  const totalCollectedFines = fineTransactions
    .filter(t => t.finePaid)
    .reduce((sum, t) => sum + t.fine, 0)

  const handlePayFine = () => {
    if (!paymentDialog) return
    
    const success = payFine(paymentDialog.id)
    if (success) {
      setPaymentSuccess(`Fine of ₹${paymentDialog.fine.toFixed(2)} has been paid successfully.`)
      setPaymentDialog(null)
      loadData()
      
      setTimeout(() => {
        setPaymentSuccess(null)
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Fine Management" 
        subtitle={user?.role === 'member' ? 'View your fine history' : 'Track and collect fines'} 
      />

      <div className="p-6">
        {paymentSuccess && (
          <Alert className="mb-4 border-success bg-success/10">
            <Check className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">{paymentSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {user?.role !== 'member' && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Fines
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">
                  ₹{totalPendingFines.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fineTransactions.filter(t => !t.finePaid).length} unpaid fines
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Collected Fines
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  ₹{totalCollectedFines.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fineTransactions.filter(t => t.finePaid).length} paid fines
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search fines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={!showPaidOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPaidOnly(false)}
                >
                  Pending
                </Button>
                <Button
                  variant={showPaidOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPaidOnly(true)}
                >
                  Paid
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Transaction</TableHead>
                    <TableHead className="text-muted-foreground">Book</TableHead>
                    {user?.role !== 'member' && (
                      <TableHead className="text-muted-foreground">Member</TableHead>
                    )}
                    <TableHead className="text-muted-foreground">Due Date</TableHead>
                    <TableHead className="text-muted-foreground">Return Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Fine Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    {user?.role !== 'member' && (
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={user?.role === 'member' ? 6 : 8} className="py-12 text-center">
                        <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">
                          {showPaidOnly ? 'No paid fines found' : 'No pending fines found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFines.map((transaction) => (
                      <TableRow key={transaction.id} className="border-border">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {transaction.id}
                        </TableCell>
                        <TableCell className="font-medium text-card-foreground">
                          {getBookTitle(transaction.bookId)}
                        </TableCell>
                        {user?.role !== 'member' && (
                          <TableCell className="text-card-foreground">
                            {getMemberName(transaction.memberId)}
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">
                          {transaction.dueDate}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.returnDate || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          ₹{transaction.fine.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.finePaid ? 'outline' : 'destructive'}>
                            {transaction.finePaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        {user?.role !== 'member' && (
                          <TableCell className="text-right">
                            {!transaction.finePaid && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaymentDialog(transaction)}
                              >
                              <IndianRupee className="mr-1 h-3 w-3" />
                                Pay
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Confirm Fine Payment</DialogTitle>
            <DialogDescription>
              Record the fine payment for this transaction.
            </DialogDescription>
          </DialogHeader>

          {paymentDialog && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book:</span>
                    <span className="font-medium text-card-foreground">
                      {getBookTitle(paymentDialog.bookId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member:</span>
                    <span className="text-card-foreground">
                      {getMemberName(paymentDialog.memberId)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-medium text-card-foreground">Fine Amount:</span>
                    <span className="font-bold text-destructive">
                      ₹{paymentDialog.fine.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPaymentDialog(null)}>
                  Cancel
                </Button>
                <Button onClick={handlePayFine}>
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
