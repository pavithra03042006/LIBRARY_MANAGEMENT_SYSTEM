'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { getDashboardStats, getTransactions, getBooks, getMembers } from '@/lib/store'
import type { DashboardStats, Transaction, Book, Member } from '@/lib/types'
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, IndianRupee, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    setStats(getDashboardStats())
    setRecentTransactions(getTransactions().slice(-5).reverse())
    setBooks(getBooks())
    setMembers(getMembers())
  }, [])

  const getBookTitle = (id: string) => books.find(b => b.id === id)?.title || 'Unknown'
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown'

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" subtitle="Welcome back! Here's your library overview." />
      
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            subtitle="In collection"
            icon={BookOpen}
            variant="default"
          />
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            subtitle="Registered"
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Issued Books"
            value={stats.issuedBooks}
            subtitle="Currently out"
            icon={ArrowLeftRight}
            variant="success"
          />
          <StatsCard
            title="Overdue Books"
            value={stats.overdueBooks}
            subtitle="Require attention"
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatsCard
            title="Fines Collected"
            value={`₹${stats.totalFinesCollected.toFixed(2)}`}
            subtitle="Total collected"
            icon={IndianRupee}
            variant="success"
          />
          <StatsCard
            title="Pending Fines"
            value={`₹${stats.pendingFines.toFixed(2)}`}
            subtitle="To be collected"
            icon={Clock}
            variant="warning"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground">No transactions yet</p>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">
                          {getBookTitle(transaction.bookId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getMemberName(transaction.memberId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            transaction.status === 'returned'
                              ? 'outline'
                              : transaction.status === 'overdue'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {transaction.status}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Due: {transaction.dueDate}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Low Stock Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books
                  .filter(b => b.availableCopies <= 1)
                  .slice(0, 5)
                  .map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">{book.title}</p>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${book.availableCopies === 0 ? 'text-destructive' : 'text-warning'}`}>
                          {book.availableCopies}
                        </p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                    </div>
                  ))}
                {books.filter(b => b.availableCopies <= 1).length === 0 && (
                  <p className="text-center text-muted-foreground">All books well stocked</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Members with Pending Fines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Membership</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Pending Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members
                      .filter(m => m.totalFines - m.paidFines > 0)
                      .map((member) => (
                        <tr key={member.id} className="border-b border-border">
                          <td className="py-4 text-card-foreground">{member.name}</td>
                          <td className="py-4 text-muted-foreground">{member.email}</td>
                          <td className="py-4">
                            <Badge variant="outline" className="capitalize">
                              {member.membershipType}
                            </Badge>
                          </td>
                          <td className="py-4 text-right font-medium text-destructive">
                            ${(member.totalFines - member.paidFines).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    {members.filter(m => m.totalFines - m.paidFines > 0).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No pending fines
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
