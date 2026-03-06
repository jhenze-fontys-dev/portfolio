# 📁 {FolderName}

This folder contains all **{LayerType}** files of the backend architecture.

{LayerDescription}

{LayerType}s are responsible for:
- {Responsibility1}
- {Responsibility2}
- {Responsibility3}

---

**Related layers:**
{RelatedLayersList}

*(Adjust relative paths and layers according to folder depth and architecture relevance.)*

---

**Documentation:**  
See the detailed [{LayerName} Documentation]({DocFileName}.README.md) for conventions, examples, and integration details.

---

**Structure example:**
```
/backend/{FolderName}/
│
├── {ExampleFile1}.js
├── {ExampleFile2}.js
└── README.md
```

---

**Notes for CODEX:**
- `{FolderName}` → Folder name (e.g. controllers, routes, models, etc.)  
- `{LayerType}` → What this folder represents (e.g. controller, service)  
- `{DocFileName}` → The detailed README filename (e.g. `controller.README.md`)  
- `{RelatedLayersList}` → Replaced dynamically with relevant links such as:  
  - `[Controllers](../controllers/controller.README.md)`  
  - `[Models](../data/sql/models/models.README.md)`  
  - `[Services](../data/sql/services/services.README.md)`  
  - `[Schemas](../docs/backend/schemas/schemas.README.md)`  
  - `[Annotations](../docs/backend/annotations/annotations.README.md)`  

---

🧠 **Purpose:**  
This README provides quick context and navigation when browsing the project on GitHub.  
It complements the detailed CODEX-level documentation stored in each layer’s own `.README.md`.
