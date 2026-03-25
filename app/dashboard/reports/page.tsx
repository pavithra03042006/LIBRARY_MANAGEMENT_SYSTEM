'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { getTransactions, getBooks, getMembers, getDashboardStats } from '@/lib/store'
import type { Transaction, Book, Member } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Download, BookOpen, Users, TrendingUp, IndianRupee } from 'lucide-react'

const COLORS = ['oklch(0.72 0.12 175)', 'oklch(0.65 0.15 280)', 'oklch(0.75 0.15 85)', 'oklch(0.60 0.18 25)']

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setTransactions(getTransactions())
    setBooks(getBooks())
    setMembers(getMembers())
  }, [])

  const stats = getDashboardStats()

  // Book category distribution
  const categoryData = books.reduce((acc, book) => {
    const existing = acc.find(c => c.name === book.category)
    if (existing) {
      existing.value += book.totalCopies
    } else {
      acc.push({ name: book.category, value: book.totalCopies })
    }
    return acc
  }, [] as { name: string; value: number }[])

  // Transaction status distribution
  const statusData = [
    { name: 'Issued', value: transactions.filter(t => t.status === 'issued').length },
    { name: 'Overdue', value: transactions.filter(t => t.status === 'overdue').length },
    { name: 'Returned', value: transactions.filter(t => t.status === 'returned').length },
  ]

  // Membership type distribution
  const membershipData = [
    { name: 'Standard', value: members.filter(m => m.membershipType === 'standard').length },
    { name: 'Premium', value: members.filter(m => m.membershipType === 'premium').length },
    { name: 'Student', value: members.filter(m => m.membershipType === 'student').length },
  ]

  // Monthly transactions (mock data for visualization)
  const monthlyData = [
    { month: 'Jan', issues: 45, returns: 38, fines: 12 },
    { month: 'Feb', issues: 52, returns: 45, fines: 8 },
    { month: 'Mar', issues: 48, returns: 50, fines: 15 },
    { month: 'Apr', issues: 61, returns: 55, fines: 10 },
    { month: 'May', issues: 55, returns: 48, fines: 18 },
    { month: 'Jun', issues: 67, returns: 60, fines: 12 },
  ]

  // Top borrowed books
  const bookBorrowCount = transactions.reduce((acc, t) => {
    acc[t.bookId] = (acc[t.bookId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topBooks = Object.entries(bookBorrowCount)
    .map(([bookId, count]) => ({
      book: books.find(b => b.id === bookId),
      count,
    }))
    .filter(item => item.book)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Active members
  const memberBorrowCount = transactions.reduce((acc, t) => {
    acc[t.memberId] = (acc[t.memberId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeMembersData = Object.entries(memberBorrowCount)
    .map(([memberId, count]) => ({
      member: members.find(m => m.id === memberId),
      count,
    }))
    .filter(item => item.member)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const handleExportCSV = () => {
    let csvContent = ''
    
    if (activeTab === 'books') {
      csvContent = 'Title,Author,ISBN,Category,Total Copies,Available,Location\n'
      books.forEach(book => {
        csvContent += `"${book.title}","${book.author}","${book.isbn}","${book.category}",${book.totalCopies},${book.availableCopies},"${book.location}"\n`
      })
    } else if (activeTab === 'members') {
      csvContent = 'Name,Email,Phone,Membership,Status,Join Date,Expiry Date,Total Fines,Paid Fines\n'
      members.forEach(member => {
        csvContent += `"${member.name}","${member.email}","${member.phone}","${member.membershipType}","${member.status}","${member.joinDate}","${member.expiryDate}",${member.totalFines},${member.paidFines}\n`
      })
    } else if (activeTab === 'transactions') {
      csvContent = 'Transaction ID,Book,Member,Issue Date,Due Date,Return Date,Status,Fine,Paid\n'
      transactions.forEach(t => {
        const book = books.find(b => b.id === t.bookId)
        const member = members.find(m => m.id === t.memberId)
        csvContent += `"${t.id}","${book?.title || 'Unknown'}","${member?.name || 'Unknown'}","${t.issueDate}","${t.dueDate}","${t.returnDate || ''}","${t.status}",${t.fine},${t.finePaid}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `library_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="flex flex-col">
      <Header title="Reports & Analytics" subtitle="View library statistics and generate reports" />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 flex items-center justify-between">
            <TabsList className="bg-secondary">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {activeTab !== 'overview' && (
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>

          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Books
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-card-foreground">{stats.totalBooks}</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-card-foreground">{stats.totalMembers}</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Loans
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-card-foreground">{stats.issuedBooks}</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Fines
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-card-foreground">
                    ₹{(stats.totalFinesCollected + stats.pendingFines).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                      <XAxis dataKey="month" stroke="oklch(0.65 0.01 240)" />
                      <YAxis stroke="oklch(0.65 0.01 240)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.015 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="issues" stroke="oklch(0.72 0.12 175)" strokeWidth={2} />
                      <Line type="monotone" dataKey="returns" stroke="oklch(0.65 0.15 280)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Books by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.015 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Transaction Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
                      <XAxis dataKey="name" stroke="oklch(0.65 0.01 240)" />
                      <YAxis stroke="oklch(0.65 0.01 240)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.015 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="oklch(0.72 0.12 175)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Membership Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={membershipData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {membershipData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.015 240)',
                          border: '1px solid oklch(0.28 0.02 240)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Lists */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Most Borrowed Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topBooks.map((item, index) => (
                      <div key={item.book?.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-card-foreground">{item.book?.title}</p>
                            <p className="text-sm text-muted-foreground">{item.book?.author}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{item.count} times</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Most Active Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeMembersData.map((item, index) => (
                      <div key={item.member?.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-card-foreground">{item.member?.name}</p>
                            <p className="text-sm text-muted-foreground">{item.member?.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{item.count} loans</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books" className="mt-0">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Title</TableHead>
                      <TableHead className="text-muted-foreground">Author</TableHead>
                      <TableHead className="text-muted-foreground">ISBN</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-center text-muted-foreground">Total</TableHead>
                      <TableHead className="text-center text-muted-foreground">Available</TableHead>
                      <TableHead className="text-muted-foreground">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id} className="border-border">
                        <TableCell className="font-medium text-card-foreground">{book.title}</TableCell>
                        <TableCell className="text-muted-foreground">{book.author}</TableCell>
                        <TableCell className="text-muted-foreground">{book.isbn}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-card-foreground">{book.totalCopies}</TableCell>
                        <TableCell className="text-center">
                          <span className={book.availableCopies === 0 ? 'text-destructive' : 'text-success'}>
                            {book.availableCopies}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{book.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Membership</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Expiry</TableHead>
                      <TableHead className="text-right text-muted-foreground">Pending Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="border-border">
                        <TableCell className="font-medium text-card-foreground">{member.name}</TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{member.membershipType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.status === 'active' ? 'default' : member.status === 'suspended' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.expiryDate}</TableCell>
                        <TableCell className="text-right">
                          {member.totalFines - member.paidFines > 0 ? (
                            <span className="text-destructive">₹{(member.totalFines - member.paidFines).toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground">₹0.00</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Book</TableHead>
                      <TableHead className="text-muted-foreground">Member</TableHead>
                      <TableHead className="text-muted-foreground">Issue Date</TableHead>
                      <TableHead className="text-muted-foreground">Due Date</TableHead>
                      <TableHead className="text-muted-foreground">Return Date</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground">Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const book = books.find(b => b.id === transaction.bookId)
                      const member = members.find(m => m.id === transaction.memberId)
                      return (
                        <TableRow key={transaction.id} className="border-border">
                          <TableCell className="font-mono text-xs text-muted-foreground">{transaction.id}</TableCell>
                          <TableCell className="font-medium text-card-foreground">{book?.title || 'Unknown'}</TableCell>
                          <TableCell className="text-card-foreground">{member?.name || 'Unknown'}</TableCell>
                          <TableCell className="text-muted-foreground">{transaction.issueDate}</TableCell>
                          <TableCell className="text-muted-foreground">{transaction.dueDate}</TableCell>
                          <TableCell className="text-muted-foreground">{transaction.returnDate || '-'}</TableCell>
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
                                ${transaction.fine.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
