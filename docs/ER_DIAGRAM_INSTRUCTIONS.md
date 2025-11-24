# ER Diagram Generation Instructions

## How to Create the Visual ER Diagram (PNG/PDF)

Since you have the DBML code ready, follow these steps:

### Option 1: Using dbdiagram.io (Recommended - Free & Easy)

1. **Open dbdiagram.io**
   - Go to: https://dbdiagram.io/d

2. **Import Your Schema**
   - Click on the editor area
   - Delete any default content
   - Copy ALL contents from `/docs/er-diagram.dbml`
   - Paste into the editor

3. **Export as Image**
   - Click "Export" button (top right)
   - Choose "Export to PNG" or "Export to PDF"
   - Save as `er-diagram.png` or `er-diagram.pdf`
   - Move file to `/docs/` folder in your project

4. **Update README**
   - Add reference to the image:
   ```markdown
   ### Visual ER Diagram
   ![Database ER Diagram](./docs/er-diagram.png)
   ```

---

### Option 2: Using draw.io / diagrams.net

1. Go to: https://app.diagrams.net/
2. Create a new diagram
3. Use "Entity Relation" shapes from the left sidebar
4. Manually draw the 3 tables and relationships
5. Export as PNG/PDF

---

### Option 3: Screenshot from a Database Tool

If you have your database running:

1. Use **pgAdmin 4** or **DBeaver**
2. Connect to your `code_copilot` database
3. Go to "ER Diagram" or "Database Diagram" view
4. Take screenshot or export
5. Save to `/docs/er-diagram.png`

---

## What Your Diagram Should Show

```
┌─────────────────┐         ┌──────────────────────┐
│     users       │         │      languages       │
├─────────────────┤         ├──────────────────────┤
│ PK  id          │         │ PK  id               │
│     email (UQ)  │         │     name (UNIQUE)    │
│     username    │         │     file_extension   │
│     created_at  │         │     syntax_highlight │
│     updated_at  │         │     is_active        │
└─────────────────┘         └──────────────────────┘
         │                            │
         │ 1                      1   │
         │                            │
         └────────────┬───────────────┘
                      │ N
              ┌───────▼────────┐
              │   generations  │
              ├────────────────┤
              │ PK  id         │
              │ FK  user_id    │ → users(id)     ON DELETE SET NULL
              │ FK  language_id│ → languages(id) ON DELETE RESTRICT
              │     prompt     │
              │     generated_ │
              │     code       │
              │     created_at │
              └────────────────┘
```

**Key Elements:**
- ✅ Show all 3 tables
- ✅ Show Primary Keys (PK)
- ✅ Show Foreign Keys (FK)
- ✅ Show relationships (1:N lines with crow's foot notation)
- ✅ Show unique constraints
- ✅ Optional: Show indexes

---

## After Creating the Image

1. **Save to repository:**
   ```bash
   # Place file here:
   /docs/er-diagram.png
   ```

2. **Reference in README.md:**
   - Add image link in the "ER Diagram" section
   - Keep your text-based diagram as backup

3. **Commit and push:**
   ```bash
   git add docs/er-diagram.png
   git commit -m "Add visual ER diagram for submission"
   git push origin main
   ```

---

## Verification Checklist

Before submission, ensure your ER diagram shows:

- [ ] **users** table with all columns
- [ ] **languages** table with all columns
- [ ] **generations** table with all columns
- [ ] Relationship line from users → generations (1:N)
- [ ] Relationship line from languages → generations (1:N)
- [ ] Primary keys marked (PK)
- [ ] Foreign keys marked (FK)
- [ ] Clear, readable labels
- [ ] Professional appearance (not hand-drawn)

---

## Your Current Schema (for reference)

**From:** `/docs/er-diagram.dbml`

Tables:
1. users (id, email, username, created_at, updated_at)
2. languages (id, name, file_extension, syntax_highlighter, is_active, created_at)
3. generations (id, user_id, language_id, prompt, generated_code, created_at)

Relationships:
- generations.user_id → users.id (ON DELETE SET NULL)
- generations.language_id → languages.id (ON DELETE RESTRICT)
