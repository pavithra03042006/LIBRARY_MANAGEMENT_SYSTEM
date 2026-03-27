/**
 * BookService — AngularJS equivalent of the book CRUD functions in lib/store.ts
 *
 * Provides: getBooks, getBookById, createBook, updateBook, deleteBook, searchBooks
 */
angular.module('lmsApp')
  .service('BookService', ['StorageService', function (StorageService) {

    var self = this;
    var KEY = StorageService.KEYS.BOOKS;

    // ── Read ─────────────────────────────────────────────────────────

    /**
     * Return all books from localStorage.
     * Mirrors getBooks() in store.ts.
     * @returns {Book[]}
     */
    self.getBooks = function () {
      return StorageService.get(KEY, []);
    };

    /**
     * Find a single book by ID.
     * Mirrors getBookById() in store.ts.
     * @param {string} id
     * @returns {Book|undefined}
     */
    self.getBookById = function (id) {
      return self.getBooks().find(function (b) { return b.id === id; });
    };

    /**
     * Find a book by ISBN or book ID (used for barcode scanning).
     * Mirrors findBookByBarcode() in store.ts.
     * @param {string} barcode
     * @returns {Book|undefined}
     */
    self.findByBarcode = function (barcode) {
      return self.getBooks().find(function (b) {
        return b.isbn === barcode || b.id === barcode;
      });
    };

    // ── Write ─────────────────────────────────────────────────────────

    /**
     * Add a new book.
     * Mirrors createBook() in store.ts.
     * @param {Omit<Book, 'id'|'createdAt'>} bookData
     * @returns {Book}
     */
    self.createBook = function (bookData) {
      var books = self.getBooks();
      var newBook = angular.extend({}, bookData, {
        id:        StorageService.generateId('book'),
        createdAt: new Date().toISOString()
      });
      books.push(newBook);
      StorageService.set(KEY, books);
      return newBook;
    };

    /**
     * Update an existing book by ID.
     * Mirrors updateBook() in store.ts.
     * @param {string} id
     * @param {Partial<Book>} updates
     * @returns {Book|null}
     */
    self.updateBook = function (id, updates) {
      var books = self.getBooks();
      var idx = books.findIndex(function (b) { return b.id === id; });
      if (idx === -1) return null;
      books[idx] = angular.extend({}, books[idx], updates);
      StorageService.set(KEY, books);
      return books[idx];
    };

    /**
     * Delete a book by ID.
     * Mirrors deleteBook() in store.ts.
     * @param {string} id
     * @returns {boolean}
     */
    self.deleteBook = function (id) {
      var books = self.getBooks();
      var filtered = books.filter(function (b) { return b.id !== id; });
      if (filtered.length === books.length) return false;
      StorageService.set(KEY, filtered);
      return true;
    };

    // ── Search ─────────────────────────────────────────────────────────

    /**
     * Full-text search on title, author, isbn, category.
     * Mirrors searchBooks() in store.ts.
     * @param {string} query
     * @returns {Book[]}
     */
    self.searchBooks = function (query) {
      if (!query) return self.getBooks();
      var q = query.toLowerCase();
      return self.getBooks().filter(function (b) {
        return b.title.toLowerCase().includes(q)  ||
               b.author.toLowerCase().includes(q) ||
               b.isbn.includes(q)                 ||
               b.category.toLowerCase().includes(q);
      });
    };
  }]);
