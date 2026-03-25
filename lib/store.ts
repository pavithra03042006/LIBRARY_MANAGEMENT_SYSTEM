'use client'

import type { Book, Member, Transaction, Fine, User, DashboardStats } from './types'

const STORAGE_VERSION = '3' // Set to 3 to clear old duplicate data
const VERSION_KEY = 'lms_storage_version'

const STORAGE_KEYS = {
  USERS: 'lms_users',
  BOOKS: 'lms_books',
  MEMBERS: 'lms_members',
  TRANSACTIONS: 'lms_transactions',
  FINES: 'lms_fines',
  CURRENT_USER: 'lms_current_user',
}

// Initialize with sample data
const sampleUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@library.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'librarian@library.com',
    password: 'librarian123',
    name: 'John Librarian',
    role: 'librarian',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'member@library.com',
    password: 'member123',
    name: 'Jane Member',
    role: 'member',
    createdAt: new Date().toISOString(),
  },
]

const sampleBooks: Book[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Fiction',
    publisher: 'Scribner',
    publishYear: 1925,
    totalCopies: 5,
    availableCopies: 3,
    location: 'A-1-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0446310789',
    category: 'Fiction',
    publisher: 'Grand Central Publishing',
    publishYear: 1960,
    totalCopies: 4,
    availableCopies: 2,
    location: 'A-1-02',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Technology',
    publisher: 'Prentice Hall',
    publishYear: 2008,
    totalCopies: 3,
    availableCopies: 1,
    location: 'B-2-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'book-4',
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0201633610',
    category: 'Technology',
    publisher: 'Addison-Wesley',
    publishYear: 1994,
    totalCopies: 2,
    availableCopies: 2,
    location: 'B-2-02',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'book-5',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    category: 'Fiction',
    publisher: 'Signet Classic',
    publishYear: 1949,
    totalCopies: 6,
    availableCopies: 4,
    location: 'A-1-03',
    createdAt: new Date().toISOString(),
  },
]

const sampleMembers: Member[] = [
  {
    id: 'member-1',
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '+1-555-0101',
    address: '123 Main St, City',
    membershipType: 'premium',
    status: 'active',
    joinDate: '2024-01-15',
    expiryDate: '2025-01-15',
    totalFines: 15.00,
    paidFines: 15.00,
  },
  {
    id: 'member-2',
    name: 'Bob Smith',
    email: 'bob@email.com',
    phone: '+1-555-0102',
    address: '456 Oak Ave, Town',
    membershipType: 'standard',
    status: 'active',
    joinDate: '2024-03-20',
    expiryDate: '2025-03-20',
    totalFines: 5.00,
    paidFines: 0,
  },
  {
    id: 'member-3',
    name: 'Carol Davis',
    email: 'carol@email.com',
    phone: '+1-555-0103',
    address: '789 Pine Rd, Village',
    membershipType: 'student',
    status: 'active',
    joinDate: '2024-06-01',
    expiryDate: '2025-06-01',
    totalFines: 0,
    paidFines: 0,
  },
]

const sampleTransactions: Transaction[] = [
  {
    id: 'trans-1',
    bookId: 'book-1',
    memberId: 'member-1',
    issueDate: '2024-12-01',
    dueDate: '2024-12-15',
    returnDate: '2024-12-20',
    status: 'returned',
    fine: 5.00,
    finePaid: true,
  },
  {
    id: 'trans-2',
    bookId: 'book-2',
    memberId: 'member-2',
    issueDate: '2024-12-10',
    dueDate: '2024-12-24',
    returnDate: null,
    status: 'overdue',
    fine: 5.00,
    finePaid: false,
  },
  {
    id: 'trans-3',
    bookId: 'book-3',
    memberId: 'member-1',
    issueDate: '2025-01-05',
    dueDate: '2025-01-19',
    returnDate: null,
    status: 'issued',
    fine: 0,
    finePaid: false,
  },
]

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  // Check storage version and reset if needed
  const storedVersion = localStorage.getItem(VERSION_KEY)
  if (storedVersion !== STORAGE_VERSION) {
    // Version mismatch - clear all storage
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
    return defaultValue
  }
  
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  // Ensure version is set
  if (!localStorage.getItem(VERSION_KEY)) {
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
  }
  
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeStore(): void {
  if (typeof window === 'undefined') return
  
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setToStorage(STORAGE_KEYS.USERS, sampleUsers)
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    setToStorage(STORAGE_KEYS.BOOKS, sampleBooks)
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    setToStorage(STORAGE_KEYS.MEMBERS, sampleMembers)
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    setToStorage(STORAGE_KEYS.TRANSACTIONS, sampleTransactions)
  }
  if (!localStorage.getItem(STORAGE_KEYS.FINES)) {
    setToStorage(STORAGE_KEYS.FINES, [])
  }
}

// User functions
export function getUsers(): User[] {
  return getFromStorage(STORAGE_KEYS.USERS, sampleUsers)
}

export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null)
}

export function setCurrentUser(user: User | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user)
}

export function authenticateUser(email: string, password: string): User | null {
  const users = getUsers()
  return users.find(u => u.email === email && u.password === password) || null
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  setToStorage(STORAGE_KEYS.USERS, users)
  return newUser
}

// Book functions
export function getBooks(): Book[] {
  return getFromStorage(STORAGE_KEYS.BOOKS, sampleBooks)
}

export function getBookById(id: string): Book | undefined {
  return getBooks().find(b => b.id === id)
}

export function createBook(book: Omit<Book, 'id' | 'createdAt'>): Book {
  const books = getBooks()
  const newBook: Book = {
    ...book,
    id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  books.push(newBook)
  setToStorage(STORAGE_KEYS.BOOKS, books)
  return newBook
}

export function updateBook(id: string, updates: Partial<Book>): Book | null {
  const books = getBooks()
  const index = books.findIndex(b => b.id === id)
  if (index === -1) return null
  books[index] = { ...books[index], ...updates }
  setToStorage(STORAGE_KEYS.BOOKS, books)
  return books[index]
}

export function deleteBook(id: string): boolean {
  const books = getBooks()
  const filtered = books.filter(b => b.id !== id)
  if (filtered.length === books.length) return false
  setToStorage(STORAGE_KEYS.BOOKS, filtered)
  return true
}

// Member functions
export function getMembers(): Member[] {
  return getFromStorage(STORAGE_KEYS.MEMBERS, sampleMembers)
}

export function getMemberById(id: string): Member | undefined {
  return getMembers().find(m => m.id === id)
}

export function createMember(member: Omit<Member, 'id'>): Member {
  const members = getMembers()
  const newMember: Member = {
    ...member,
    id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
  members.push(newMember)
  setToStorage(STORAGE_KEYS.MEMBERS, members)
  return newMember
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  const members = getMembers()
  const index = members.findIndex(m => m.id === id)
  if (index === -1) return null
  members[index] = { ...members[index], ...updates }
  setToStorage(STORAGE_KEYS.MEMBERS, members)
  return members[index]
}

export function deleteMember(id: string): boolean {
  const members = getMembers()
  const filtered = members.filter(m => m.id !== id)
  if (filtered.length === members.length) return false
  setToStorage(STORAGE_KEYS.MEMBERS, filtered)
  return true
}

// Transaction functions
export function getTransactions(): Transaction[] {
  return getFromStorage(STORAGE_KEYS.TRANSACTIONS, sampleTransactions)
}

export function getTransactionById(id: string): Transaction | undefined {
  return getTransactions().find(t => t.id === id)
}

export function getMemberTransactions(memberId: string): Transaction[] {
  return getTransactions().filter(t => t.memberId === memberId)
}

export function issueBook(bookId: string, memberId: string, dueDate: string): Transaction | null {
  const books = getBooks()
  const bookIndex = books.findIndex(b => b.id === bookId)
  if (bookIndex === -1 || books[bookIndex].availableCopies <= 0) return null
  
  books[bookIndex].availableCopies -= 1
  setToStorage(STORAGE_KEYS.BOOKS, books)
  
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bookId,
    memberId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate,
    returnDate: null,
    status: 'issued',
    fine: 0,
    finePaid: false,
  }
  transactions.push(newTransaction)
  setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  return newTransaction
}

export function returnBook(transactionId: string): Transaction | null {
  const transactions = getTransactions()
  const index = transactions.findIndex(t => t.id === transactionId)
  if (index === -1) return null
  
  const transaction = transactions[index]
  const returnDate = new Date().toISOString().split('T')[0]
  
  // Calculate fine (1 dollar per day overdue)
  const dueDate = new Date(transaction.dueDate)
  const actualReturnDate = new Date(returnDate)
  const daysOverdue = Math.max(0, Math.floor((actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
  const fine = daysOverdue * 1.00
  
  transactions[index] = {
    ...transaction,
    returnDate,
    status: 'returned',
    fine,
  }
  setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  
  // Update book availability
  const books = getBooks()
  const bookIndex = books.findIndex(b => b.id === transaction.bookId)
  if (bookIndex !== -1) {
    books[bookIndex].availableCopies += 1
    setToStorage(STORAGE_KEYS.BOOKS, books)
  }
  
  // Update member fines
  if (fine > 0) {
    const members = getMembers()
    const memberIndex = members.findIndex(m => m.id === transaction.memberId)
    if (memberIndex !== -1) {
      members[memberIndex].totalFines += fine
      setToStorage(STORAGE_KEYS.MEMBERS, members)
    }
  }
  
  return transactions[index]
}

export function updateOverdueTransactions(): void {
  const transactions = getTransactions()
  const today = new Date().toISOString().split('T')[0]
  let updated = false
  
  transactions.forEach((t, i) => {
    if (t.status === 'issued' && t.dueDate < today) {
      transactions[i].status = 'overdue'
      updated = true
    }
  })
  
  if (updated) {
    setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  }
}

export function payFine(transactionId: string): boolean {
  const transactions = getTransactions()
  const index = transactions.findIndex(t => t.id === transactionId)
  if (index === -1) return false
  
  const transaction = transactions[index]
  transactions[index].finePaid = true
  setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  
  // Update member paid fines
  const members = getMembers()
  const memberIndex = members.findIndex(m => m.id === transaction.memberId)
  if (memberIndex !== -1) {
    members[memberIndex].paidFines += transaction.fine
    setToStorage(STORAGE_KEYS.MEMBERS, members)
  }
  
  return true
}

// Dashboard stats
export function getDashboardStats(): DashboardStats {
  const books = getBooks()
  const members = getMembers()
  const transactions = getTransactions()
  
  updateOverdueTransactions()
  
  const issuedBooks = transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length
  const overdueBooks = transactions.filter(t => t.status === 'overdue').length
  const totalFinesCollected = transactions.filter(t => t.finePaid).reduce((sum, t) => sum + t.fine, 0)
  const pendingFines = transactions.filter(t => !t.finePaid && t.fine > 0).reduce((sum, t) => sum + t.fine, 0)
  
  return {
    totalBooks: books.reduce((sum, b) => sum + b.totalCopies, 0),
    totalMembers: members.length,
    issuedBooks,
    overdueBooks,
    totalFinesCollected,
    pendingFines,
  }
}

// Search functions
export function searchBooks(query: string): Book[] {
  const books = getBooks()
  const q = query.toLowerCase()
  return books.filter(b => 
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.isbn.includes(q) ||
    b.category.toLowerCase().includes(q)
  )
}

export function searchMembers(query: string): Member[] {
  const members = getMembers()
  const q = query.toLowerCase()
  return members.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    m.phone.includes(q) ||
    m.id.toLowerCase().includes(q)
  )
}

// Barcode lookup
export function findBookByBarcode(barcode: string): Book | undefined {
  return getBooks().find(b => b.isbn === barcode || b.id === barcode)
}

export function findMemberByBarcode(barcode: string): Member | undefined {
  return getMembers().find(m => m.id === barcode)
}
