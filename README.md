# The Optom Archive ⌖

> *The digital resource hub for optometry students.*

The Optom Archive is a dedicated, open-access academic library and study repository built for **Bachelor of Optometry (B.Optom)** students, aligned with the **The Tamil Nadu Dr. M.G.R. Medical University (TNMGRMU)** curriculum.

---

## 🏛️ Brand & Visual Direction

- **Editorial Library Aesthetic**: Dignified serif headlines (`Newsreader`), crisp interface typography (`Plus Jakarta Sans`), and clean monospace metadata accents (`JetBrains Mono`).
- **Restrained Palette (80/15/5 Rule)**:
  - **80%**: Deep Navy (`#011C40`), Navy (`#023859`), and Off-White (`#E5F9F8` / `#F3FAFA`).
  - **15%**: Steel Blue (`#26658C`) and Teal (`#23717B`).
  - **5%**: Cyan glow (`#12B2C1` and `#A7EBF2`).

---

## 🧭 V1 Navigation

| Section | Route | Purpose |
| :--- | :--- | :--- |
| **Home** | `#home` | Editorial hero, search bar, archive metrics, 6 curated collection portals, and recent additions. |
| **Resources** | `#resources` | The core search engine with multi-faceted filtering by Type, Year (1–4), Subject, and Sort. |
| **Subjects** | `#subjects` | University library classification catalog (`01 Basic Sciences` to `05 Specialised Areas`). |
| **Search** | `#search` | Dedicated metadata-aware live search engine grouping results by resource type. |

---

## 📁 Repository & PDF Storage Structure

To add new PDFs directly to the Git repository, place them in the corresponding year/subject folder inside `docs/`:

```text
the-optom-archive/
├── index.html                     # Main application interface
├── style.css                      # Library editorial design system
├── script.js                      # Client router, search engine & filter controller
├── .nojekyll                      # Ensures proper static serving on GitHub Pages
├── data/
│   └── resources.json             # Academic catalog metadata
└── docs/                          # PDF and document storage
    ├── year-1/
    │   ├── general-anatomy-physiology/
    │   ├── ocular-anatomy-physiology/
    │   ├── physical-geometrical-optics/
    │   └── biochemistry-nutrition/
    ├── year-2/
    │   ├── optometric-optics/
    │   ├── visual-optics/
    │   ├── ocular-diseases/
    │   ├── ocular-pharmacology/
    │   └── pathology-microbiology/
    ├── year-3/
    │   ├── binocular-vision/
    │   ├── contact-lens/
    │   ├── low-vision-aids/
    │   ├── glaucoma-investigative-optometry/
    │   ├── dispensing-optics/
    │   ├── paediatric-geriatric-optometry/
    │   └── occupational-public-health-optometry/
    └── year-4/
        ├── clinical-protocols/
        ├── internship-case-records/
        └── research-projects/
```

### Adding a Resource to `data/resources.json`

When you add a PDF to a folder (e.g. `docs/year-2/visual-optics/my-notes.pdf`), register its metadata entry in `data/resources.json`:

```json
{
  "id": "optom-026",
  "title": "Streak Retinoscopy Guide",
  "type": "notes",
  "subject": "Visual Optics",
  "classificationCode": "02",
  "classification": "Optics",
  "year": 2,
  "description": "Comprehensive notes covering the neutralization of refractive errors.",
  "fileType": "PDF",
  "filePath": "docs/year-2/visual-optics/my-notes.pdf",
  "fileSize": "3.2 MB",
  "pages": 16,
  "author": "Clinical Optometry Dept.",
  "tags": ["Retinoscopy", "Refraction", "Visual Optics"],
  "featured": true,
  "dateAdded": "2026-10-05"
}
```

---

## 🚀 Running Locally & Deploying to GitHub Pages

### Run Locally (No build tools required)
Open `index.html` in any modern web browser or serve via any static HTTP server:
```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```
Then open `http://localhost:8000`.

### Deploy to GitHub Pages
1. Push this repository to GitHub.
2. Go to repository **Settings** → **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.
