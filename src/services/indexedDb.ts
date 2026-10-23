import { CachedStudyMaterial, OfflineCacheStats, SavedItem } from '../types';

const DB_NAME = 'EduGeniusOfflineDB';
const DB_VERSION = 1;

const STORES = {
  MATERIALS: 'study_materials',
  SAVED: 'saved_content',
  DOCUMENTS: 'offline_documents',
  META: 'meta_store',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getIndexedDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // 1. Study Materials Store (auto-caches all generated notes, solutions, exam answers)
      if (!db.objectStoreNames.contains(STORES.MATERIALS)) {
        const materialStore = db.createObjectStore(STORES.MATERIALS, { keyPath: 'id' });
        materialStore.createIndex('type', 'type', { unique: false });
        materialStore.createIndex('subject', 'subject', { unique: false });
        materialStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        materialStore.createIndex('generatedAt', 'generatedAt', { unique: false });
      }

      // 2. Saved Items Store
      if (!db.objectStoreNames.contains(STORES.SAVED)) {
        const savedStore = db.createObjectStore(STORES.SAVED, { keyPath: 'id' });
        savedStore.createIndex('subject', 'subject', { unique: false });
        savedStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 3. Offline Document Text Cache
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        docStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // 4. Meta & Quota Store
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });

  return dbPromise;
}

/**
 * Cache a generated study material in IndexedDB
 */
export async function cacheStudyMaterial(
  material: Omit<CachedStudyMaterial, 'cachedAt' | 'previewSnippet'> & {
    previewSnippet?: string;
  }
): Promise<void> {
  try {
    const db = await getIndexedDB();
    const cleanSnippet =
      material.previewSnippet ||
      material.content.slice(0, 160).replace(/[#*`$]/g, '').trim() + '...';

    const record: CachedStudyMaterial = {
      ...material,
      previewSnippet: cleanSnippet,
      cachedAt: new Date().toISOString(),
      offlineAccessCount: material.offlineAccessCount || 0,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.MATERIALS, STORES.META], 'readwrite');
      const store = tx.objectStore(STORES.MATERIALS);
      const metaStore = tx.objectStore(STORES.META);

      store.put(record);
      metaStore.put({ key: 'last_cached_at', value: new Date().toISOString() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to cache material in IndexedDB:', err);
  }
}

/**
 * Retrieve all cached materials sorted by most recent
 */
export async function getAllCachedMaterials(): Promise<CachedStudyMaterial[]> {
  try {
    const db = await getIndexedDB();
    return await new Promise<CachedStudyMaterial[]>((resolve, reject) => {
      const tx = db.transaction(STORES.MATERIALS, 'readonly');
      const store = tx.objectStore(STORES.MATERIALS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result as CachedStudyMaterial[]) || [];
        // Sort descending by cachedAt
        results.sort(
          (a, b) => new Date(b.cachedAt).getTime() - new Date(a.cachedAt).getTime()
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get cached materials:', err);
    return [];
  }
}

/**
 * Get cached material by ID and increment offline access counter
 */
export async function getCachedMaterialById(id: string): Promise<CachedStudyMaterial | null> {
  try {
    const db = await getIndexedDB();
    return await new Promise<CachedStudyMaterial | null>((resolve, reject) => {
      const tx = db.transaction(STORES.MATERIALS, 'readwrite');
      const store = tx.objectStore(STORES.MATERIALS);
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result as CachedStudyMaterial | undefined;
        if (item) {
          // Increment offline access count
          item.offlineAccessCount = (item.offlineAccessCount || 0) + 1;
          store.put(item);
          resolve(item);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get item by ID from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete single material from offline cache
 */
export async function deleteCachedMaterial(id: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.MATERIALS, 'readwrite');
      const store = tx.objectStore(STORES.MATERIALS);
      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete item from IndexedDB:', err);
  }
}

/**
 * Clear all cached materials in IndexedDB
 */
export async function clearOfflineMaterials(): Promise<void> {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORES.MATERIALS, STORES.META], 'readwrite');
      tx.objectStore(STORES.MATERIALS).clear();
      tx.objectStore(STORES.META).put({ key: 'last_cleared_at', value: new Date().toISOString() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear IndexedDB:', err);
  }
}

/**
 * Search offline cached materials by query string
 */
export async function searchOfflineMaterials(query: string): Promise<CachedStudyMaterial[]> {
  const all = await getAllCachedMaterials();
  if (!query || !query.trim()) return all;

  const q = query.toLowerCase().trim();
  return all.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      (item.module && item.module.toLowerCase().includes(q)) ||
      item.content.toLowerCase().includes(q)
    );
  });
}

/**
 * Sync Saved items into IndexedDB
 */
export async function syncSavedItemsToIndexedDB(items: SavedItem[]): Promise<void> {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.SAVED, 'readwrite');
      const store = tx.objectStore(STORES.SAVED);

      for (const item of items) {
        store.put(item);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to sync saved items to IndexedDB:', err);
  }
}

/**
 * Get offline cache statistics (count per type, storage estimate)
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  try {
    const all = await getAllCachedMaterials();
    let notesCount = 0;
    let examAnswersCount = 0;
    let photoSolutionsCount = 0;
    let pdfSummariesCount = 0;
    let chatsCount = 0;
    let totalChars = 0;

    for (const item of all) {
      totalChars += (item.title?.length || 0) + (item.content?.length || 0);
      switch (item.type) {
        case 'notes':
          notesCount++;
          break;
        case 'exam_answer':
          examAnswersCount++;
          break;
        case 'photo_solution':
          photoSolutionsCount++;
          break;
        case 'pdf_summary':
          pdfSummariesCount++;
          break;
        case 'chat':
          chatsCount++;
          break;
      }
    }

    // Rough byte estimation: 2 bytes per char + overhead
    let estimatedBytes = totalChars * 2 + all.length * 128;

    // Browser Storage estimate if available
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          estimatedBytes = Math.max(estimatedBytes, estimate.usage);
        }
      } catch {
        // Fallback to computed estimate
      }
    }

    return {
      totalItems: all.length,
      notesCount,
      examAnswersCount,
      photoSolutionsCount,
      pdfSummariesCount,
      chatsCount,
      estimatedBytes,
      lastSyncAt: all[0]?.cachedAt || null,
    };
  } catch (err) {
    return {
      totalItems: 0,
      notesCount: 0,
      examAnswersCount: 0,
      photoSolutionsCount: 0,
      pdfSummariesCount: 0,
      chatsCount: 0,
      estimatedBytes: 0,
      lastSyncAt: null,
    };
  }
}

/**
 * High-yield baseline academic materials pre-seeded in IndexedDB
 * so students and evaluators immediately have rich offline revision content.
 */
export const INITIAL_OFFLINE_SEEDS: Omit<CachedStudyMaterial, 'cachedAt'>[] = [
  {
    id: 'offline-seed-1',
    title: 'Fourier Transform & Frequency Response Analysis',
    subject: 'Digital Signal Processing',
    module: 'Module 1: CTFT & LTI Systems',
    type: 'notes',
    content: `# Digital Signal Processing: Module 1 - Continuous-Time Fourier Transform

## 1. Mathematical Formulation
The Continuous-Time Fourier Transform (CTFT) maps arbitrary finite-energy signals $x(t) \\in L^2(\\mathbb{R})$ into their continuous frequency representation:

$$X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} \\, dt$$

The Inverse Continuous-Time Fourier Transform reconstructs the time waveform:
$$x(t) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} X(\\omega) e^{j\\omega t} \\, d\\omega$$

## 2. Fundamental Properties
- **Linearity**: $\\mathcal{F}\\{a x_1(t) + b x_2(t)\\} = a X_1(\\omega) + b X_2(\\omega)$
- **Time Convolution to Frequency Product**:
  $$y(t) = x(t) * h(t) \\iff Y(\\omega) = X(\\omega) \\cdot H(\\omega)$$
- **Parseval's Energy Conservation Relation**:
  $$\\int_{-\\infty}^{\\infty} |x(t)|^2 \\, dt = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} |X(\\omega)|^2 \\, d\\omega$$

## 3. High-Yield Exam Takeaway
When deriving frequency domain outputs, evaluate $|H(\\omega)|$ at $\\omega = 0$ for DC gain and $|H(\\omega)| = \\frac{1}{\\sqrt{2}}$ for the $-3\\text{ dB}$ cutoff boundary.`,
    generatedAt: '2026-10-23T06:00:00.000Z',
    wordCount: 195,
    previewSnippet: 'Continuous-Time Fourier Transform, convolution property, Parseval relation, and frequency response analysis.',
    offlineAccessCount: 3,
  },
  {
    id: 'offline-seed-2',
    title: 'Second-Order RLC Transient Differential Equation',
    subject: 'Network Theory',
    module: 'Module 3: Transient Response',
    type: 'photo_solution',
    content: `### Step-by-Step Derivation of Series RLC Circuit Transient

#### 1. Governing Integro-Differential Formulation
Applying Kirchhoff's Voltage Law (KVL) around a closed series loop with step excitation $E(t) = V_0 u(t)$:
$$L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{-\\infty}^{t} i(\\tau) \\, d\\tau = V_0$$

Differentiating with respect to time $t$ yields the homogeneous auxiliary form:
$$\\frac{d^2 i(t)}{dt^2} + 2\\alpha \\frac{di(t)}{dt} + \\omega_0^2 i(t) = 0$$

Where:
- Neper attenuation frequency: $\\alpha = \\frac{R}{2L}$
- Undamped natural resonant frequency: $\\omega_0 = \\frac{1}{\\sqrt{LC}}$

#### 2. Characteristic Roots
$$s_{1,2} = -\\alpha \\pm \\sqrt{\\alpha^2 - \\omega_0^2}$$

- **Overdamped ($\\alpha > \\omega_0$)**: Distinct real roots.
- **Critically Damped ($\\alpha = \\omega_0$)**: Repeated real root $s = -\\alpha$; fastest rise without overshoot.
- **Underdamped ($\\alpha < \\omega_0$)**: Complex conjugate roots exhibiting damped sinusoidal oscillations with ringing frequency $\\omega_d = \\sqrt{\\omega_0^2 - \\alpha^2}$.

$$\\mathbf{Final \\, Solution \\, (Critically \\, Damped)}: \\quad i(t) = (A_1 + A_2 t) e^{-\\alpha t}$$`,
    generatedAt: '2026-10-23T06:15:00.000Z',
    wordCount: 220,
    previewSnippet: 'Step-by-step differential equation solution for RLC series transient circuit with damping conditions.',
    offlineAccessCount: 5,
  },
  {
    id: 'offline-seed-3',
    title: 'Explain Dijkstra Shortest Path Algorithm (5-mark)',
    subject: 'Algorithms & Data Structures',
    module: 'Graph Theory',
    markType: '5-mark',
    type: 'exam_answer',
    content: `### 1. Formal Definition
**Dijkstra's Algorithm** is a greedy graph search algorithm that calculates the minimum single-source shortest path weights from a source vertex $s$ to all remaining vertices $v \\in V$ in a directed or undirected graph with strictly non-negative edge weights ($w(u, v) \\ge 0$).

### 2. Core Execution Mechanism
1. Maintain a set of visited vertices $S$ where shortest paths are finalized.
2. Initialize source distance $d[s] = 0$ and $d[v] = \\infty$ for all $v \\neq s$.
3. Extract minimum distance vertex $u \\notin S$ using a Min-Heap priority queue.
4. **Relaxation Step**: For each adjacent edge $(u, v)$ with weight $w(u, v)$:
   $$\\text{If } d[u] + w(u, v) < d[v] \\implies d[v] = d[u] + w(u, v)$$
5. Repeat until all vertices have been visited or priority queue is empty.

### 3. Concrete Example
For a road routing graph where edge weights reflect highway travel minutes, Dijkstra's algorithm determines the fastest delivery path without traversing negative cycles.

### 4. Complexity & Conclusion
- Time Complexity with Min-Heap: $O((V + E) \\log V)$.
- Space Complexity: $O(V)$ for priority queue and distance arrays.

---
*AI-generated. Verify against your textbook before use.*`,
    generatedAt: '2026-10-23T06:30:00.000Z',
    wordCount: 215,
    previewSnippet: '5-mark exam answer for Dijkstra algorithm with relaxation step, min-heap complexity, and graph example.',
    offlineAccessCount: 2,
  },
  {
    id: 'offline-seed-4',
    title: 'Karnaugh Maps & Prime Implicants Summary',
    subject: 'Digital Electronics',
    module: 'Combinational Logic',
    type: 'pdf_summary',
    content: `### Chapter 4 Summary: Combinational Logic Minimization

- **Boolean Axiom Base**: Defined over $B = \\{0, 1\\}$ with standard operators AND, OR, NOT and De Morgan duality $(A + B)' = A'B'$.
- **Gray Code Alignment**: Karnaugh maps organize adjacent cells using Gray code sequence ($00, 01, 11, 10$) so that adjacent geometric cells differ by exactly 1 Hamming bit.
- **Prime vs Essential Prime Implicants**:
  - A *Prime Implicant* is a maximal rectangular grouping of $2^k$ minterms ($1, 2, 4, 8, 16$).
  - An *Essential Prime Implicant* contains at least one distinct minterm that cannot be covered by any rival prime implicant grouping.
- **Don't Care ($X$) Optimization**: Don't care conditions may be grouped as binary $1$ when expanding group dimensions to power-of-two sizes, or omitted as $0$ otherwise.`,
    generatedAt: '2026-10-23T07:00:00.000Z',
    wordCount: 165,
    previewSnippet: 'K-Map minimization rules, Gray code Hamming adjacency, and essential prime implicant classification.',
    offlineAccessCount: 4,
  },
];

/**
 * Initialize IndexedDB and seed default offline revision materials if empty
 */
export async function seedInitialOfflineCacheIfEmpty(): Promise<void> {
  try {
    const existing = await getAllCachedMaterials();
    if (existing.length === 0) {
      for (const item of INITIAL_OFFLINE_SEEDS) {
        await cacheStudyMaterial(item);
      }
    }
  } catch (err) {
    console.error('Failed to seed initial offline cache:', err);
  }
}
