# Family Tree Data Import Guide

This guide explains how to prepare your family data in Google Sheets and import it into the Family Tree application.

## CSV File Structure

You need two CSV files:

### 1. Persons CSV (`persons.csv`)

Contains all family members with their details.

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `id` | Yes | Unique identifier for each person | `person-001`, `dad`, `grandma-paternal` |
| `name` | Yes | Full name | `John Smith` |
| `aka` | No | Nicknames/aliases (comma-separated) | `Johnny, JD, Papa` |
| `gender` | Yes | Gender | `Male` or `Female` |
| `is_alive` | Yes | Living status | `TRUE` or `FALSE` |
| `birth_date` | Yes | Date of birth (YYYY-MM-DD) | `1950-05-15` |
| `death_date` | No | Date of death (YYYY-MM-DD), leave empty if alive | `1995-06-20` |
| `current_location` | No | Current/last known location | `New York USA` |
| `profession` | No | Occupation | `Engineer` |
| `photo_url` | No | URL to photo (optional) | `https://...` |

### 2. Relationships CSV (`relationships.csv`)

Defines how family members are connected.

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `type` | Yes | Relationship type | `SPOUSE`, `PARENT_CHILD`, or `SIBLING` |
| `person1_id` | Yes | ID of first person | `person-001` |
| `person2_id` | Yes | ID of second person | `person-002` |
| `start_date` | No | Marriage date (for SPOUSE only) | `1975-06-15` |

#### Relationship Types:

- **SPOUSE**: Marriage relationship. `person1_id` and `person2_id` are married.
- **PARENT_CHILD**: Parent to child. `person1_id` is the PARENT of `person2_id`.
- **SIBLING**: Brother/sister relationship. Direction doesn't matter.

## Google Sheets Setup

### Step 1: Create Persons Sheet

1. Open Google Sheets
2. Create a new spreadsheet named "Family Tree Data"
3. Rename the first sheet to "Persons"
4. Add headers in row 1:
   ```
   id | name | aka | gender | is_alive | birth_date | death_date | current_location | profession | photo_url
   ```
5. Enter your family members starting from row 2

### Step 2: Create Relationships Sheet

1. Add a new sheet named "Relationships"
2. Add headers in row 1:
   ```
   type | person1_id | person2_id | start_date
   ```
3. Enter all relationships starting from row 2

### Step 3: Export to CSV

1. Go to **File > Download > Comma Separated Values (.csv)**
2. Save Persons sheet as `persons.csv`
3. Switch to Relationships sheet
4. Go to **File > Download > Comma Separated Values (.csv)**
5. Save as `relationships.csv`

## ID Naming Convention (Recommended)

Use meaningful IDs that help you remember who's who:

```
# Great Grandparents
ggp-paternal-1    # Great grandfather (dad's side)
ggm-paternal-1    # Great grandmother (dad's side)
ggp-maternal-1    # Great grandfather (mom's side)

# Grandparents
gp-paternal       # Grandfather (dad's side)
gm-paternal       # Grandmother (dad's side)
gp-maternal       # Grandfather (mom's side)
gm-maternal       # Grandmother (mom's side)

# Parents
dad
mom

# Self & Siblings
me
sibling-1
sibling-2

# Spouse & Children
spouse
child-1
child-2

# Uncles/Aunts
uncle-paternal-1
aunt-paternal-1
uncle-maternal-1

# Cousins
cousin-paternal-1
cousin-maternal-1
```

## Import Process

### Using Python Script (Recommended)

```bash
# Navigate to project directory
cd family_tree

# Activate virtual environment
source .venv/bin/activate

# Clean existing data (optional)
./scripts/neo4j_clean.sh

# Import your CSV files
python scripts/csv_import.py /path/to/persons.csv /path/to/relationships.csv
```

### Using Default Example Data

```bash
# This imports the example data from data/example_persons.csv
source .venv/bin/activate
python scripts/csv_import.py
```

## Example Files

- `template_persons.csv` - Minimal template to get started
- `template_relationships.csv` - Minimal relationships template
- `example_persons.csv` - Full example with 35 family members
- `example_relationships.csv` - Full example with all relationships

## Tips

1. **Start with yourself** - Begin by adding yourself, then expand outward to parents, grandparents, siblings, etc.

2. **Use consistent IDs** - Once you assign an ID, don't change it. All relationships reference these IDs.

3. **Double-check relationships** - For PARENT_CHILD, make sure person1 is the PARENT and person2 is the CHILD.

4. **Dates format** - Always use YYYY-MM-DD format (e.g., 1990-05-15).

5. **Boolean values** - Use TRUE/FALSE (not Yes/No or 1/0) for is_alive.

6. **Empty values** - Leave cells empty (not "N/A" or "null") for missing data.

## Troubleshooting

### "Person not found" error
- Check that all IDs in relationships.csv exist in persons.csv
- IDs are case-sensitive

### Empty tree after import
- Make sure you're calling the API with a valid centerNodeId
- Example: `http://localhost:8080/api/tree?centerNodeId=me`

### Duplicate relationships
- The import script uses MERGE, so duplicates are automatically handled
