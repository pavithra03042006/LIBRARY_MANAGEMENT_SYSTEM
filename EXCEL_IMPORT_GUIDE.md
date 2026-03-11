# Excel Import Guide

## Overview

The Library Management System allows you to bulk import books and members from Excel files. This guide walks you through the process step-by-step.

## Supported File Formats

- **Excel Files**: `.xlsx`, `.xls`
- **CSV Files**: `.csv`
- **Sheet Format**: First sheet will be used for import
- **Column Headers**: Must match the expected column names exactly

## Importing Books

### Step 1: Prepare Your Excel File

Create or open an Excel spreadsheet with the following columns:

| Column Name | Type | Required | Example |
|------------|------|----------|---------|
| Title | Text | ✓ Yes | The Great Gatsby |
| Author | Text | ✓ Yes | F. Scott Fitzgerald |
| ISBN | Text | ✓ Yes | 978-0743273565 |
| Category | Text | Optional | Fiction |
| Publisher | Text | Optional | Scribner |
| Publish Year | Number | Optional | 1925 |
| Total Copies | Number | Optional | 3 |
| Available Copies | Number | Optional | 2 |
| Location | Text | Optional | A-1-01 |

### Step 2: Format Your Data

1. **Title, Author, ISBN**: Must not be empty
2. **Category**: One of: Fiction, Non-Fiction, Technology, Science, History, Biography, Children, Other
3. **Numbers**: Use numeric values (not text) for year, copies
4. **Location Format**: Use shelf reference (e.g., A-1-01, B-2-03)

### Step 3: Use the Import Feature

1. Go to **Dashboard → Books**
2. Click the **Import Excel** button
3. Select your prepared Excel file
4. Review the preview of books to be imported
5. Click **Confirm Import** to add all books to the library

### Example Data Format

```
Title,Author,ISBN,Category,Publisher,Publish Year,Total Copies,Available Copies,Location
The Great Gatsby,F. Scott Fitzgerald,978-0743273565,Fiction,Scribner,1925,3,2,A-1-01
To Kill a Mockingbird,Harper Lee,978-0061120084,Fiction,J.B. Lippincott,1960,2,1,A-1-02
1984,George Orwell,978-0451524935,Fiction,Signet Classics,1949,4,3,A-1-03
```

## Importing Members

### Step 1: Prepare Your Excel File

Create or open an Excel spreadsheet with the following columns:

| Column Name | Type | Required | Example |
|------------|------|----------|---------|
| Name | Text | ✓ Yes | John Smith |
| Email | Text | ✓ Yes | john@example.com |
| Phone | Text | ✓ Yes | 555-123-4567 |
| Address | Text | ✓ Yes | 123 Main St |
| Membership Type | Text | Optional | standard |
| Status | Text | Optional | active |
| Join Date | Date | Optional | 2023-01-15 |
| Expiry Date | Date | Optional | 2026-01-15 |
| Total Fines | Number | Optional | 500 |
| Paid Fines | Number | Optional | 500 |

### Step 2: Format Your Data

1. **Name, Email, Phone**: Must not be empty
2. **Membership Type**: Either `standard` or `premium`
3. **Status**: One of: `active`, `inactive`, `suspended`
4. **Dates**: Use format YYYY-MM-DD (e.g., 2023-01-15)
5. **Fines**: Use numeric values in rupees (₹)

### Step 3: Use the Import Feature

1. Go to **Dashboard → Members**
2. Click the **Import Excel** button
3. Select your prepared Excel file
4. Review the preview of members to be imported
5. Click **Confirm Import** to add all members to the system

### Example Data Format

```
Name,Email,Phone,Address,Membership Type,Status,Join Date,Expiry Date,Total Fines,Paid Fines
Rajesh Kumar,rajesh@email.com,9876543210,123 Main St,standard,active,2023-01-15,2026-01-15,0,0
Priya Singh,priya@email.com,9876543211,456 Park Ave,premium,active,2023-02-20,2026-02-20,500,500
```

## Using Sample Files

Sample Excel files are provided for testing:

1. **Sample Books**: `/public/sample_books.csv`
   - Contains 10 sample books
   - Ready to import directly
   - Shows proper formatting

2. **Sample Members**: `/public/sample_members.csv`
   - Contains 10 sample members
   - Ready to import directly
   - Shows proper formatting

### How to Use Sample Files:

1. Download the sample CSV file from the `/public` folder
2. Open it in Excel or Google Sheets
3. Modify the data as needed
4. Save it as Excel or CSV format
5. Use the Import feature in the dashboard

## Troubleshooting

### Error: "Failed to parse Excel file"

**Causes:**
- File format not supported (use .xlsx, .xls, or .csv)
- Corrupted file

**Solution:**
- Save file in Excel format (.xlsx)
- Ensure file is not corrupted
- Try opening file in Excel first

### Error: "Title is required" or similar validation errors

**Causes:**
- Missing required columns
- Empty values in required fields
- Column headers don't match exactly

**Solution:**
- Check that all required columns are present
- Verify column names match exactly (case-sensitive)
- Remove empty rows
- Fill in all required fields

### Error: "Row X: Column not found"

**Causes:**
- Column header is misspelled
- Column is missing entirely

**Solution:**
- Use exact column names from the guide above
- Verify all required columns are present
- Use sample files as template

### Books/Members not appearing after import

**Causes:**
- Import was cancelled
- Browser cache not refreshed
- Storage quota exceeded

**Solution:**
- Try import again
- Refresh the page (Ctrl+R)
- Clear browser cache and try again
- Check browser console for errors

## Best Practices

### For Large Imports

1. **Split into batches**: Import 100-200 items at a time
2. **Validate first**: Check data in Excel before importing
3. **Backup data**: Export existing data before importing
4. **Test first**: Try with sample data first

### For Data Quality

1. **Use consistent formatting**:
   - All book titles in proper case
   - All ISBNs in one format (with or without hyphens)
   - Consistent phone number format

2. **Verify required fields**:
   - Title, Author, ISBN for books
   - Name, Email, Phone for members

3. **Double-check dates**:
   - Use YYYY-MM-DD format
   - Verify dates are in future for expiry

4. **Categories and statuses**:
   - Use predefined values
   - Check spelling carefully

## Data Mapping

### Column Name Variations

The system is flexible with column names. These variations are accepted:

**Books:**
- "Title" or "title"
- "Author" or "author"
- "ISBN" or "isbn"
- "Publish Year" or "publishYear"
- "Total Copies" or "totalCopies"
- "Available Copies" or "availableCopies"

**Members:**
- "Name" or "name"
- "Email" or "email"
- "Phone" or "phone"
- "Membership Type" or "membershipType"
- "Join Date" or "joinDate"

## Security Notes

- Uploaded files are processed in the browser
- No data is sent to external servers
- All data is stored locally in browser storage
- Import history is not logged
- Clear cache to remove imported data

## Export and Re-import

Currently, the system supports importing but not exporting. To backup data:

1. Export from the dashboard (if available)
2. Or manually create a CSV with current data
3. Keep Excel files in a safe backup location

## Additional Tips

1. **Use Excel formulas**: Calculate publish year or dates using formulas before export
2. **Remove duplicates**: Check for duplicate ISBNs or emails before import
3. **Validate with Excel**: Use data validation in Excel to catch errors before import
4. **Keep history**: Save original import files with date stamps
5. **Document changes**: Note what was imported and when for audit trail

## Contact Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify file format and content
3. Try with sample files first
4. Check browser console for detailed error messages
5. Contact system administrator

---

Last Updated: March 2026
For more information, see IMPLEMENTATION_SUMMARY.md
