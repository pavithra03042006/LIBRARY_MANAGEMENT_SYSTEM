'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/dashboard/header'
import {
  getTransactions,
  getBooks,
  getMembers,
  issueBook,
  returnBook,
  findBookByBarcode,
  findMemberByBarcode,
  searchBooks,
  searchMembers,
} from '@/lib/store'
import type { Transaction, Book, Member } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ArrowLeftRight, Scan, Check, AlertCircle, BookOpen, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'issued' | 'overdue' | 'returned'>('all')
  
  // Issue dialog state
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [bookSuggestions, setBookSuggestions] = useState<Book[]>([])
  const [memberSuggestions, setMemberSuggestions] = useState<Member[]>([])
  const [issueError, setIssueError] = useState<string | null>(null)
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null)
  
  // Barcode scanning state
  const [isScanMode, setIsScanMode] = useState(false)
  const [scanType, setScanType] = useState<'book' | 'member'>('book')
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Return dialog state
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [returnTransaction, setReturnTransaction] = useState<Transaction | null>(null)
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    // Default due date: 14 days from now
    const defaultDue = new Date()
    defaultDue.setDate(defaultDue.getDate() + 14)
    setDueDate(defaultDue.toISOString().split('T')[0])
  }, [])

  const loadData = () => {
    setTransactions(getTransactions())
    setBooks(getBooks())
    setMembers(getMembers())
  }

  const getBookTitle = (id: string) => books.find(b => b.id === id)?.title || 'Unknown'
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown'
  const getBook = (id: string) => books.find(b => b.id === id)
  const getMember = (id: string) => members.find(m => m.id === id)

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'issued') return t.status === 'issued'
    if (activeTab === 'overdue') return t.status === 'overdue'
    if (activeTab === 'returned') return t.status === 'returned'
    return true
  }).filter(t => {
    if (!searchQuery) return true
    const book = getBook(t.bookId)
    const member = getMember(t.memberId)
    const q = searchQuery.toLowerCase()
    return (
      book?.title.toLowerCase().includes(q) ||
      member?.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    )
  })

  const handleBookSearch = (query: string) => {
    setBookSearch(query)
    if (query.trim().length >= 2) {
      setBookSuggestions(searchBooks(query).filter(b => b.availableCopies > 0).slice(0, 5))
    } else {
      setBookSuggestions([])
    }
  }

  const handleMemberSearch = (query: string) => {
    setMemberSearch(query)
    if (query.trim().length >= 2) {
      setMemberSuggestions(searchMembers(query).filter(m => m.status === 'active').slice(0, 5))
    } else {
      setMemberSuggestions([])
    }
  }

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
    setBookSearch(book.title)
    setBookSuggestions([])
  }

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member)
    setMemberSearch(member.name)
    setMemberSuggestions([])
  }

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const barcode = barcodeInputRef.current?.value.trim()
    if (!barcode) return

    if (scanType === 'book') {
      const book = findBookByBarcode(barcode)
      if (book) {
        if (book.availableCopies > 0) {
          handleSelectBook(book)
          setIsScanMode(false)
        } else {
          setIssueError('This book is not available for issue.')
        }
      } else {
        setIssueError('Book not found with this barcode/ISBN.')
      }
    } else {
      const member = findMemberByBarcode(barcode)
      if (member) {
        if (member.status === 'active') {
          handleSelectMember(member)
          setIsScanMode(false)
        } else {
          setIssueError('This member is not active.')
        }
      } else {
        setIssueError('Member not found with this ID.')
      }
    }
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = ''
    }
  }

  const handleIssueBook = () => {
    if (!selectedBook || !selectedMember || !dueDate) {
      setIssueError('Please select a book, member, and due date.')
      return
    }

    const result = issueBook(selectedBook.id, selectedMember.id, dueDate)
    if (result) {
      setIssueSuccess(`Successfully issued "${selectedBook.title}" to ${selectedMember.name}`)
      setSelectedBook(null)
      setSelectedMember(null)
      setBookSearch('')
      setMemberSearch('')
      loadData()
      
      setTimeout(() => {
        setIssueSuccess(null)
      }, 3000)
    } else {
      setIssueError('Failed to issue book. Please try again.')
    }
  }

  const handleReturnClick = (transaction: Transaction) => {
    setReturnTransaction(transaction)
    setIsReturnDialogOpen(true)
  }

  const handleReturnConfirm = () => {
    if (!returnTransaction) return

    const result = returnBook(returnTransaction.id)
    if (result) {
      const book = getBook(returnTransaction.bookId)
      setReturnSuccess(`"${book?.title}" has been returned. ${result.fine > 0 ? `Fine: ₹${result.fine.toFixed(2)}` : ''}`)
      setIsReturnDialogOpen(false)
      setReturnTransaction(null)
      loadData()
      
      setTimeout(() => {
        setReturnSuccess(null)
      }, 3000)
    }
  }

  const openIssueDialog = () => {
    setIsIssueDialogOpen(true)
    setSelectedBook(null)
    setSelectedMember(null)
    setBookSearch('')
    setMemberSearch('')
    setIssueError(null)
    setIssueSuccess(null)
  }

  return (
    <div className="flex flex-col">
      <Header title="Issue / Return" subtitle="Manage book transactions" />

      <div className="p-6">
        {returnSuccess && (
          <Alert className="mb-4 border-success bg-success/10">
            <Check className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">{returnSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input pl-9"
            />
          </div>

          <Button onClick={openIssueDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-4 bg-secondary">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="issued">Issued</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="returned">Returned</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                        <TableHead className="text-muted-foreground">Book</TableHead>
                        <TableHead className="text-muted-foreground">Member</TableHead>
                        <TableHead className="text-muted-foreground">Issue Date</TableHead>
                        <TableHead className="text-muted-foreground">Due Date</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-right text-muted-foreground">Fine</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-12 text-center">
                            <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-muted-foreground">No transactions found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="border-border">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {transaction.id}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-card-foreground">
                                {getBookTitle(transaction.bookId)}
                              </p>
                            </TableCell>
                            <TableCell className="text-card-foreground">
                              {getMemberName(transaction.memberId)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {transaction.issueDate}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {transaction.dueDate}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === 'returned'
                                    ? 'outline'
                                    : transaction.status === 'overdue'
                                    ? 'destructive'
                                    : 'default'
                                }
                                className="capitalize"
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {transaction.fine > 0 ? (
                                <span className={transaction.finePaid ? 'text-muted-foreground' : 'text-destructive'}>
                                  ₹{transaction.fine.toFixed(2)}
                                  {transaction.finePaid && ' (Paid)'}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {transaction.status !== 'returned' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReturnClick(transaction)}
                                >
                                  Return
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Issue Book Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
            <DialogDescription>
              Search for a book and member, or use barcode scanning.
            </DialogDescription>
          </DialogHeader>

          {issueError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{issueError}</AlertDescription>
            </Alert>
          )}

          {issueSuccess && (
            <Alert className="border-success bg-success/10">
              <Check className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">{issueSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Barcode Scanning Mode */}
            {isScanMode && (
              <Card className="border-primary bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scan className="h-4 w-4" />
                    Barcode Scanning Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2">
                    <Button
                      variant={scanType === 'book' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScanType('book')}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Scan Book ISBN
                    </Button>
                    <Button
                      variant={scanType === 'member' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScanType('member')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Scan Member ID
                    </Button>
                  </div>
                  <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                    <Input
                      ref={barcodeInputRef}
                      placeholder={scanType === 'book' ? 'Scan or enter ISBN...' : 'Scan or enter Member ID...'}
                      className="bg-input"
                      autoFocus
                    />
                    <Button type="submit">Submit</Button>
                    <Button type="button" variant="outline" onClick={() => setIsScanMode(false)}>
                      Cancel
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!isScanMode && (
              <Button variant="outline" onClick={() => setIsScanMode(true)} className="w-full">
                <Scan className="mr-2 h-4 w-4" />
                Use Barcode Scanner
              </Button>
            )}

            {/* Book Selection */}
            <div className="space-y-2">
              <Label>Select Book</Label>
              {selectedBook ? (
                <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/10 p-3">
                  <div>
                    <p className="font-medium text-card-foreground">{selectedBook.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedBook.author} | ISBN: {selectedBook.isbn}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedBook(null); setBookSearch(''); }}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={bookSearch}
                    onChange={(e) => handleBookSearch(e.target.value)}
                    className="bg-input pl-9"
                  />
                  {bookSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                      {bookSuggestions.map((book) => (
                        <button
                          key={book.id}
                          className="w-full px-4 py-2 text-left hover:bg-accent"
                          onClick={() => handleSelectBook(book)}
                        >
                          <p className="font-medium text-popover-foreground">{book.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {book.author} | Available: {book.availableCopies}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Member Selection */}
            <div className="space-y-2">
              <Label>Select Member</Label>
              {selectedMember ? (
                <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/10 p-3">
                  <div>
                    <p className="font-medium text-card-foreground">{selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.email} | ID: {selectedMember.id}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedMember(null); setMemberSearch(''); }}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    value={memberSearch}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                    className="bg-input pl-9"
                  />
                  {memberSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                      {memberSuggestions.map((member) => (
                        <button
                          key={member.id}
                          className="w-full px-4 py-2 text-left hover:bg-accent"
                          onClick={() => handleSelectMember(member)}
                        >
                          <p className="font-medium text-popover-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email} | {member.membershipType}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-input"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleIssueBook}
                disabled={!selectedBook || !selectedMember || !dueDate}
              >
                Issue Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Confirm the book return. Any applicable fine will be calculated automatically.
            </DialogDescription>
          </DialogHeader>

          {returnTransaction && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book:</span>
                    <span className="font-medium text-card-foreground">
                      {getBookTitle(returnTransaction.bookId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member:</span>
                    <span className="text-card-foreground">
                      {getMemberName(returnTransaction.memberId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span className="text-card-foreground">{returnTransaction.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className={returnTransaction.status === 'overdue' ? 'text-destructive' : 'text-card-foreground'}>
                      {returnTransaction.dueDate}
                    </span>
                  </div>
                  {returnTransaction.status === 'overdue' && (
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="font-medium text-destructive">Status:</span>
                      <span className="font-medium text-destructive">Overdue</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReturnConfirm}>
                  Confirm Return
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
