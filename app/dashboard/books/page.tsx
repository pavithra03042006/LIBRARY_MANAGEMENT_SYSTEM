'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/dashboard/header'
import { getBooks, createBook, updateBook, deleteBook, searchBooks } from '@/lib/store'
import type { Book } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, BookOpen, Upload, FileSpreadsheet, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import * as XLSX from 'xlsx'

const categories = ['Fiction', 'Non-Fiction', 'Technology', 'Science', 'History', 'Biography', 'Children', 'Other']

interface BookFormData {
  title: string
  author: string
  isbn: string
  category: string
  publisher: string
  publishYear: number
  totalCopies: number
  availableCopies: number
  location: string
}

const defaultFormData: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  category: 'Fiction',
  publisher: '',
  publishYear: new Date().getFullYear(),
  totalCopies: 1,
  availableCopies: 1,
  location: '',
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<BookFormData>(defaultFormData)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [importedData, setImportedData] = useState<Partial<BookFormData>[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = () => {
    setBooks(getBooks())
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setBooks(searchBooks(query))
    } else {
      loadBooks()
    }
  }

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book)
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        publishYear: book.publishYear,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        location: book.location,
      })
    } else {
      setEditingBook(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBook) {
      updateBook(editingBook.id, formData)
    } else {
      createBook(formData)
    }
    
    setIsDialogOpen(false)
    loadBooks()
  }

  const handleDelete = (id: string) => {
    deleteBook(id)
    setDeleteConfirmId(null)
    loadBooks()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const mappedData: Partial<BookFormData>[] = jsonData.map((row: Record<string, unknown>) => ({
          title: String(row['Title'] || row['title'] || ''),
          author: String(row['Author'] || row['author'] || ''),
          isbn: String(row['ISBN'] || row['isbn'] || ''),
          category: String(row['Category'] || row['category'] || 'Fiction'),
          publisher: String(row['Publisher'] || row['publisher'] || ''),
          publishYear: parseInt(String(row['Publish Year'] || row['publishYear'] || new Date().getFullYear())),
          totalCopies: parseInt(String(row['Total Copies'] || row['totalCopies'] || '1')),
          availableCopies: parseInt(String(row['Available Copies'] || row['availableCopies'] || '1')),
          location: String(row['Location'] || row['location'] || ''),
        }))

        // Validate data
        const errors: string[] = []
        mappedData.forEach((row, index) => {
          if (!row.title?.trim()) errors.push(`Row ${index + 2}: Title is required`)
          if (!row.author?.trim()) errors.push(`Row ${index + 2}: Author is required`)
          if (!row.isbn?.trim()) errors.push(`Row ${index + 2}: ISBN is required`)
        })

        if (errors.length > 0) {
          setImportError(errors.join('\n'))
          return
        }

        setImportedData(mappedData.filter(b => b.title && b.author && b.isbn))
        setIsImportDialogOpen(true)
      } catch {
        setImportError('Failed to parse file. Please ensure it is a valid Excel or CSV file.')
      }
    }

    reader.readAsBinaryString(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImportConfirm = () => {
    importedData.forEach((bookData) => {
      createBook({
        title: bookData.title || '',
        author: bookData.author || '',
        isbn: bookData.isbn || '',
        category: bookData.category || 'Fiction',
        publisher: bookData.publisher || '',
        publishYear: bookData.publishYear || new Date().getFullYear(),
        totalCopies: bookData.totalCopies || 1,
        availableCopies: bookData.availableCopies || 1,
        location: bookData.location || '',
      })
    })

    setIsImportDialogOpen(false)
    setImportedData([])
    setImportError(null)
    loadBooks()
  }

  return (
    <div className="flex flex-col">
      <Header title="Book Management" subtitle="Manage your library collection" />

      <div className="p-6">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-input pl-9"
                />
              </div>

              <div className="flex gap-2 sm:items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card">
                  <DialogHeader>
                    <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                    <DialogDescription>
                      {editingBook ? 'Update the book details below.' : 'Enter the book details below.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="bg-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publisher">Publisher</Label>
                        <Input
                          id="publisher"
                          value={formData.publisher}
                          onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publishYear">Publish Year</Label>
                        <Input
                          id="publishYear"
                          type="number"
                          value={formData.publishYear}
                          onChange={(e) => setFormData({ ...formData, publishYear: parseInt(e.target.value) })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalCopies">Total Copies</Label>
                        <Input
                          id="totalCopies"
                          type="number"
                          min="1"
                          value={formData.totalCopies}
                          onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value), availableCopies: Math.min(formData.availableCopies, parseInt(e.target.value)) })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availableCopies">Available Copies</Label>
                        <Input
                          id="availableCopies"
                          type="number"
                          min="0"
                          max={formData.totalCopies}
                          value={formData.availableCopies}
                          onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="location">Location (Shelf)</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., A-1-01"
                          required
                          className="bg-input"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingBook ? 'Update Book' : 'Add Book'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Book</TableHead>
                    <TableHead className="text-muted-foreground">ISBN</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Location</TableHead>
                    <TableHead className="text-center text-muted-foreground">Availability</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">No books found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.map((book) => (
                      <TableRow key={book.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="font-medium text-card-foreground">{book.title}</p>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{book.isbn}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{book.location}</TableCell>
                        <TableCell className="text-center">
                          <span className={book.availableCopies === 0 ? 'text-destructive' : 'text-success'}>
                            {book.availableCopies}
                          </span>
                          <span className="text-muted-foreground"> / {book.totalCopies}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(book)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(book.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Books from Excel
            </DialogTitle>
            <DialogDescription>
              Review the data below before importing. {importedData.length} books will be added.
            </DialogDescription>
          </DialogHeader>

          {importError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-wrap">
              {importError}
            </div>
          )}

          {!importError && importedData.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p>No valid books found in the file.</p>
            </div>
          )}

          {importedData.length > 0 && (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Author</TableHead>
                    <TableHead className="text-muted-foreground">ISBN</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-muted-foreground">Copies</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((book, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="font-medium text-card-foreground">{book.title}</TableCell>
                      <TableCell className="text-muted-foreground">{book.author}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{book.isbn}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{book.totalCopies}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false)
                setImportedData([])
                setImportError(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportConfirm} disabled={importedData.length === 0}>
              Import {importedData.length} Books
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
