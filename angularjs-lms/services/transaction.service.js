/**
 * TransactionService — AngularJS equivalent of transaction/fine functions in lib/store.ts
 *
 * Provides: getTransactions, issueBook, returnBook, payFine,
 *           updateOverdueTransactions, getDashboardStats
 */
angular.module('lmsApp')
  .service('TransactionService', ['StorageService', 'BookService', 'MemberService',
    function (StorageService, BookService, MemberService) {

    var self = this;
    var TX_KEY = StorageService.KEYS.TRANSACTIONS;

    // ── Read ─────────────────────────────────────────────────────────

    /**
     * Return all transactions from localStorage.
     * Mirrors getTransactions() in store.ts.
     * @returns {Transaction[]}
     */
    self.getTransactions = function () {
      return StorageService.get(TX_KEY, []);
    };

    /**
     * Find a single transaction by ID.
     * Mirrors getTransactionById() in store.ts.
     * @param {string} id
     * @returns {Transaction|undefined}
     */
    self.getTransactionById = function (id) {
      return self.getTransactions().find(function (t) { return t.id === id; });
    };

    /**
     * Get all transactions for a specific member.
     * Mirrors getMemberTransactions() in store.ts.
     * @param {string} memberId
     * @returns {Transaction[]}
     */
    self.getMemberTransactions = function (memberId) {
      return self.getTransactions().filter(function (t) { return t.memberId === memberId; });
    };

    // ── Overdue auto-update ───────────────────────────────────────────

    /**
     * Mark all issued-but-past-due transactions as overdue.
     * Mirrors updateOverdueTransactions() in store.ts.
     */
    self.updateOverdueTransactions = function () {
      var transactions = self.getTransactions();
      var today = new Date().toISOString().split('T')[0];
      var updated = false;

      transactions.forEach(function (t, i) {
        if (t.status === 'issued' && t.dueDate < today) {
          transactions[i].status = 'overdue';
          updated = true;
        }
      });

      if (updated) {
        StorageService.set(TX_KEY, transactions);
      }
    };

    // ── Issue / Return ────────────────────────────────────────────────

    /**
     * Issue a book to a member, decrementing availableCopies.
     * Mirrors issueBook() in store.ts.
     * @param {string} bookId
     * @param {string} memberId
     * @param {string} dueDate  — 'YYYY-MM-DD'
     * @returns {Transaction|null} null if book not available
     */
    self.issueBook = function (bookId, memberId, dueDate) {
      var book = BookService.getBookById(bookId);
      if (!book || book.availableCopies <= 0) return null;

      // Decrement available copies
      BookService.updateBook(bookId, { availableCopies: book.availableCopies - 1 });

      var transactions = self.getTransactions();
      var newTx = {
        id:         StorageService.generateId('trans'),
        bookId:     bookId,
        memberId:   memberId,
        issueDate:  new Date().toISOString().split('T')[0],
        dueDate:    dueDate,
        returnDate: null,
        status:     'issued',
        fine:       0,
        finePaid:   false
      };
      transactions.push(newTx);
      StorageService.set(TX_KEY, transactions);
      return newTx;
    };

    /**
     * Return a book, compute any overdue fine ($1/day), update member total.
     * Mirrors returnBook() in store.ts.
     * @param {string} transactionId
     * @returns {Transaction|null}
     */
    self.returnBook = function (transactionId) {
      var transactions = self.getTransactions();
      var idx = transactions.findIndex(function (t) { return t.id === transactionId; });
      if (idx === -1) return null;

      var tx = transactions[idx];
      var returnDate = new Date().toISOString().split('T')[0];

      // Calculate fine — $1 per day overdue
      var dueMs    = new Date(tx.dueDate).getTime();
      var retMs    = new Date(returnDate).getTime();
      var daysOver = Math.max(0, Math.floor((retMs - dueMs) / 86400000));
      var fine     = daysOver * 1.00;

      transactions[idx] = angular.extend({}, tx, {
        returnDate: returnDate,
        status:     'returned',
        fine:       fine
      });
      StorageService.set(TX_KEY, transactions);

      // Restore book availability
      var book = BookService.getBookById(tx.bookId);
      if (book) {
        BookService.updateBook(tx.bookId, { availableCopies: book.availableCopies + 1 });
      }

      // Add fine to member's totalFines
      if (fine > 0) {
        var member = MemberService.getMemberById(tx.memberId);
        if (member) {
          MemberService.updateMember(tx.memberId, { totalFines: member.totalFines + fine });
        }
      }

      return transactions[idx];
    };

    // ── Fines ─────────────────────────────────────────────────────────

    /**
     * Mark a transaction fine as paid, updating member paidFines.
     * Mirrors payFine() in store.ts.
     * @param {string} transactionId
     * @returns {boolean}
     */
    self.payFine = function (transactionId) {
      var transactions = self.getTransactions();
      var idx = transactions.findIndex(function (t) { return t.id === transactionId; });
      if (idx === -1) return false;

      var tx = transactions[idx];
      transactions[idx].finePaid = true;
      StorageService.set(TX_KEY, transactions);

      // Update member's paidFines
      var member = MemberService.getMemberById(tx.memberId);
      if (member) {
        MemberService.updateMember(tx.memberId, { paidFines: member.paidFines + tx.fine });
      }

      return true;
    };

    // ── Dashboard stats ───────────────────────────────────────────────

    /**
     * Aggregate statistics for the dashboard.
     * Mirrors getDashboardStats() in store.ts.
     * @returns {DashboardStats}
     */
    self.getDashboardStats = function () {
      self.updateOverdueTransactions();

      var books        = BookService.getBooks();
      var members      = MemberService.getMembers();
      var transactions = self.getTransactions();

      var issuedBooks  = transactions.filter(function (t) { return t.status === 'issued'  || t.status === 'overdue'; }).length;
      var overdueBooks = transactions.filter(function (t) { return t.status === 'overdue'; }).length;
      var totalFinesCollected = transactions
        .filter(function (t) { return t.finePaid; })
        .reduce(function (sum, t) { return sum + t.fine; }, 0);
      var pendingFines = transactions
        .filter(function (t) { return !t.finePaid && t.fine > 0; })
        .reduce(function (sum, t) { return sum + t.fine; }, 0);

      return {
        totalBooks:           books.reduce(function (sum, b) { return sum + b.totalCopies; }, 0),
        totalMembers:         members.length,
        issuedBooks:          issuedBooks,
        overdueBooks:         overdueBooks,
        totalFinesCollected:  totalFinesCollected,
        pendingFines:         pendingFines
      };
    };
  }]);
