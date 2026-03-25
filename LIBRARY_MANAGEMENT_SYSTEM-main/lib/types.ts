export type UserRole = 'admin' | 'librarian' | 'member'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  publisher: string
  publishYear: number
  totalCopies: number
  availableCopies: number
  location: string
  createdAt: string
}

export type MembershipType = 'standard' | 'premium' | 'student'
export type MemberStatus = 'active' | 'inactive' | 'suspended'

export interface Member {
  id: string
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

export type TransactionStatus = 'issued' | 'returned' | 'overdue'

export interface Transaction {
  id: string
  bookId: string
  memberId: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  status: TransactionStatus
  fine: number
  finePaid: boolean
}

export interface Fine {
  id: string
  memberId: string
  transactionId: string
  amount: number
  reason: string
  createdAt: string
  paidAt: string | null
}

export interface DashboardStats {
  totalBooks: number
  totalMembers: number
  issuedBooks: number
  overdueBooks: number
  totalFinesCollected: number
  pendingFines: number
}
