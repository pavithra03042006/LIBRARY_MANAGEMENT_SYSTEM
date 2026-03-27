/**
 * StorageService — AngularJS equivalent of lib/store.ts localStorage helpers
 *
 * Handles versioned localStorage read/write and initial sample data seeding.
 */
angular.module('lmsApp')
  .service('StorageService', function () {

    var STORAGE_VERSION = '3';
    var VERSION_KEY = 'lms_storage_version';

    var KEYS = {
      USERS:        'lms_users',
      BOOKS:        'lms_books',
      MEMBERS:      'lms_members',
      TRANSACTIONS: 'lms_transactions',
      FINES:        'lms_fines',
      CURRENT_USER: 'lms_current_user'
    };

    // ── Sample seed data ────────────────────────────────────────────────

    var sampleUsers = [
      { id: 'user-1', email: 'admin@library.com',     password: 'admin123',     name: 'System Admin',   role: 'admin',     createdAt: new Date().toISOString() },
      { id: 'user-2', email: 'librarian@library.com', password: 'librarian123', name: 'John Librarian', role: 'librarian', createdAt: new Date().toISOString() },
      { id: 'user-3', email: 'member@library.com',    password: 'member123',    name: 'Jane Member',    role: 'member',    createdAt: new Date().toISOString() }
    ];

    var sampleBooks = [
      { id: 'book-1', title: 'The Great Gatsby',         author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction',    publisher: 'Scribner',              publishYear: 1925, totalCopies: 5, availableCopies: 3, location: 'A-1-01', createdAt: new Date().toISOString() },
      { id: 'book-2', title: 'To Kill a Mockingbird',    author: 'Harper Lee',          isbn: '978-0446310789', category: 'Fiction',    publisher: 'Grand Central Publishing', publishYear: 1960, totalCopies: 4, availableCopies: 2, location: 'A-1-02', createdAt: new Date().toISOString() },
      { id: 'book-3', title: 'Clean Code',               author: 'Robert C. Martin',    isbn: '978-0132350884', category: 'Technology', publisher: 'Prentice Hall',          publishYear: 2008, totalCopies: 3, availableCopies: 1, location: 'B-2-01', createdAt: new Date().toISOString() },
      { id: 'book-4', title: 'Design Patterns',          author: 'Gang of Four',        isbn: '978-0201633610', category: 'Technology', publisher: 'Addison-Wesley',         publishYear: 1994, totalCopies: 2, availableCopies: 2, location: 'B-2-02', createdAt: new Date().toISOString() },
      { id: 'book-5', title: '1984',                     author: 'George Orwell',       isbn: '978-0451524935', category: 'Fiction',    publisher: 'Signet Classic',         publishYear: 1949, totalCopies: 6, availableCopies: 4, location: 'A-1-03', createdAt: new Date().toISOString() }
    ];

    var sampleMembers = [
      { id: 'member-1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+1-555-0101', address: '123 Main St, City',    membershipType: 'premium',  status: 'active', joinDate: '2024-01-15', expiryDate: '2025-01-15', totalFines: 15.00, paidFines: 15.00 },
      { id: 'member-2', name: 'Bob Smith',     email: 'bob@email.com',   phone: '+1-555-0102', address: '456 Oak Ave, Town',    membershipType: 'standard', status: 'active', joinDate: '2024-03-20', expiryDate: '2025-03-20', totalFines:  5.00, paidFines:  0    },
      { id: 'member-3', name: 'Carol Davis',   email: 'carol@email.com', phone: '+1-555-0103', address: '789 Pine Rd, Village', membershipType: 'student',  status: 'active', joinDate: '2024-06-01', expiryDate: '2025-06-01', totalFines:  0,    paidFines:  0    }
    ];

    var sampleTransactions = [
      { id: 'trans-1', bookId: 'book-1', memberId: 'member-1', issueDate: '2024-12-01', dueDate: '2024-12-15', returnDate: '2024-12-20', status: 'returned', fine: 5.00, finePaid: true  },
      { id: 'trans-2', bookId: 'book-2', memberId: 'member-2', issueDate: '2024-12-10', dueDate: '2024-12-24', returnDate: null,         status: 'overdue',  fine: 5.00, finePaid: false },
      { id: 'trans-3', bookId: 'book-3', memberId: 'member-1', issueDate: '2025-01-05', dueDate: '2025-01-19', returnDate: null,         status: 'issued',   fine: 0,    finePaid: false }
    ];

    // ── Private helpers ─────────────────────────────────────────────────

    /**
     * Get an item from localStorage with version-aware fallback.
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    this.get = function (key, defaultValue) {
      var storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion !== STORAGE_VERSION) {
        // Version mismatch — wipe stale data
        Object.values(KEYS).forEach(function (k) { localStorage.removeItem(k); });
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
        return defaultValue;
      }
      var raw = localStorage.getItem(key);
      if (raw) {
        try { return JSON.parse(raw); } catch (e) { return defaultValue; }
      }
      return defaultValue;
    };

    /**
     * Persist an item to localStorage, setting version if missing.
     * @param {string} key
     * @param {*} value
     */
    this.set = function (key, value) {
      if (!localStorage.getItem(VERSION_KEY)) {
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      }
      localStorage.setItem(key, JSON.stringify(value));
    };

    /** Expose storage key constants to other services */
    this.KEYS = KEYS;

    // ── Public: seed initial data ───────────────────────────────────────

    /**
     * Seed localStorage with sample data if not already present.
     * Mirrors initializeStore() in lib/store.ts.
     */
    this.initializeStore = function () {
      var self = this;
      if (!localStorage.getItem(KEYS.USERS))        self.set(KEYS.USERS,        sampleUsers);
      if (!localStorage.getItem(KEYS.BOOKS))        self.set(KEYS.BOOKS,        sampleBooks);
      if (!localStorage.getItem(KEYS.MEMBERS))      self.set(KEYS.MEMBERS,      sampleMembers);
      if (!localStorage.getItem(KEYS.TRANSACTIONS)) self.set(KEYS.TRANSACTIONS, sampleTransactions);
      if (!localStorage.getItem(KEYS.FINES))        self.set(KEYS.FINES,        []);
    };

    /** Generate a unique ID string */
    this.generateId = function (prefix) {
      return (prefix || 'id') + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    };
  });
