/**
 * MemberService — AngularJS equivalent of the member CRUD functions in lib/store.ts
 *
 * Provides: getMembers, getMemberById, createMember, updateMember, deleteMember, searchMembers
 */
angular.module('lmsApp')
  .service('MemberService', ['StorageService', function (StorageService) {

    var self = this;
    var KEY = StorageService.KEYS.MEMBERS;

    // ── Read ─────────────────────────────────────────────────────────

    /**
     * Return all members from localStorage.
     * Mirrors getMembers() in store.ts.
     * @returns {Member[]}
     */
    self.getMembers = function () {
      return StorageService.get(KEY, []);
    };

    /**
     * Find a single member by ID.
     * Mirrors getMemberById() in store.ts.
     * @param {string} id
     * @returns {Member|undefined}
     */
    self.getMemberById = function (id) {
      return self.getMembers().find(function (m) { return m.id === id; });
    };

    /**
     * Find a member by barcode (member ID).
     * Mirrors findMemberByBarcode() in store.ts.
     * @param {string} barcode
     * @returns {Member|undefined}
     */
    self.findByBarcode = function (barcode) {
      return self.getMembers().find(function (m) { return m.id === barcode; });
    };

    // ── Write ─────────────────────────────────────────────────────────

    /**
     * Add a new member.
     * Mirrors createMember() in store.ts.
     * @param {Omit<Member, 'id'>} memberData
     * @returns {Member}
     */
    self.createMember = function (memberData) {
      var members = self.getMembers();
      var newMember = angular.extend({}, memberData, {
        id: StorageService.generateId('member')
      });
      members.push(newMember);
      StorageService.set(KEY, members);
      return newMember;
    };

    /**
     * Update an existing member by ID.
     * Mirrors updateMember() in store.ts.
     * @param {string} id
     * @param {Partial<Member>} updates
     * @returns {Member|null}
     */
    self.updateMember = function (id, updates) {
      var members = self.getMembers();
      var idx = members.findIndex(function (m) { return m.id === id; });
      if (idx === -1) return null;
      members[idx] = angular.extend({}, members[idx], updates);
      StorageService.set(KEY, members);
      return members[idx];
    };

    /**
     * Delete a member by ID.
     * Mirrors deleteMember() in store.ts.
     * @param {string} id
     * @returns {boolean}
     */
    self.deleteMember = function (id) {
      var members = self.getMembers();
      var filtered = members.filter(function (m) { return m.id !== id; });
      if (filtered.length === members.length) return false;
      StorageService.set(KEY, filtered);
      return true;
    };

    // ── Search ─────────────────────────────────────────────────────────

    /**
     * Full-text search on name, email, phone, id.
     * Mirrors searchMembers() in store.ts.
     * @param {string} query
     * @returns {Member[]}
     */
    self.searchMembers = function (query) {
      if (!query) return self.getMembers();
      var q = query.toLowerCase();
      return self.getMembers().filter(function (m) {
        return m.name.toLowerCase().includes(q)  ||
               m.email.toLowerCase().includes(q) ||
               m.phone.includes(q)               ||
               m.id.toLowerCase().includes(q);
      });
    };
  }]);
