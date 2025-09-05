// Try to load better-sqlite3 native addon. If it fails (missing bindings),
// fall back to a tiny JSON-file-backed store that implements the minimal
// queries needed for sign-up / sign-in during development.
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

let BetterSqlite3: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BetterSqlite3 = require("better-sqlite3")
} catch (err: any) {
  console.warn("[v0] better-sqlite3 not available, using JSON fallback for development:", err && err.message)
}

type SqliteDb = any
let db: SqliteDb | null = null
let usingFallback = false

export function getDatabase(): SqliteDb | null {
  if (db) return db

  if (BetterSqlite3) {
    try {
      db = new BetterSqlite3("smart-student-hub.db")
      db.pragma("foreign_keys = ON")
      initializeDatabaseSqlite(db)
      usingFallback = false
      return db
    } catch (err: any) {
      console.error("[v0] Error opening better-sqlite3 database, falling back to JSON store:", err)
    }
  }

  // JSON fallback
  usingFallback = true
  db = null
  console.log("[v0] Using JSON fallback database for development")
  return null
}

function initializeDatabaseSqlite(dbInstance: SqliteDb) {
  try {
    const tables = dbInstance.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    if (tables.length === 0) {
      console.log("[v0] Initializing SQLite database...")
      const initScript = readFileSync(join(process.cwd(), "scripts", "01-init-database.sql"), "utf-8")
      dbInstance.exec(initScript)
      const seedScript = readFileSync(join(process.cwd(), "scripts", "02-seed-data.sql"), "utf-8")
      dbInstance.exec(seedScript)
      console.log("[v0] SQLite database initialized successfully")
    }
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
  }
}

// --- JSON fallback store (very small, only for auth flows) ---
const FALLBACK_DB_PATH = join(process.cwd(), "dev-fallback-db.json")
type FallbackDB = { users: any[]; nextId: number }

function readFallbackDB(): FallbackDB {
  if (!existsSync(FALLBACK_DB_PATH)) {
    const initial: FallbackDB = { users: [], nextId: 1 }
    writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initial, null, 2), "utf-8")
    return initial
  }
  try {
    const raw = readFileSync(FALLBACK_DB_PATH, "utf-8")
    return JSON.parse(raw) as FallbackDB
  } catch (err) {
    console.error("[v0] Failed to read fallback DB, resetting:", err)
    const initial: FallbackDB = { users: [], nextId: 1 }
    writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initial, null, 2), "utf-8")
    return initial
  }
}

function writeFallbackDB(dbObj: FallbackDB) {
  writeFileSync(FALLBACK_DB_PATH, JSON.stringify(dbObj, null, 2), "utf-8")
}

// Database query helpers
export const queries = {
  // User queries
  getUserByEmail: (email: string) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db?.prepare("SELECT * FROM users WHERE email = ?").get(email)
    }

    const f = readFallbackDB()
    return f.users.find((u) => u.email === email) || null
  },

  getUserById: (id: number) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db?.prepare("SELECT * FROM users WHERE id = ?").get(id)
    }

    const f = readFallbackDB()
    return f.users.find((u) => u.id === id) || null
  },

  createUser: (userData: {
    email: string
    password_hash: string
    first_name: string
    last_name: string
    role: string
    student_id?: string
    department?: string
  }) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db
        ?.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, student_id, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(
          userData.email,
          userData.password_hash,
          userData.first_name,
          userData.last_name,
          userData.role,
          userData.student_id || null,
          userData.department || null,
        )
    }

    const f = readFallbackDB()
    
    // Check for existing email (prevent duplicates)
    const existingUser = f.users.find((u) => u.email === userData.email)
    if (existingUser) {
      // Return an error result similar to SQLite constraint violation
      throw new Error(`UNIQUE constraint failed: users.email`)
    }
    
    const newUser = {
      id: f.nextId++,
      email: userData.email,
      password_hash: userData.password_hash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      student_id: userData.student_id || null,
      department: userData.department || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    f.users.push(newUser)
    writeFallbackDB(f)
    return { changes: 1, lastInsertRowid: newUser.id }
  },

  // Activity queries (minimal fallbacks)
  getActivitiesByStudent: (studentId: number) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db
        ?.prepare(`
      SELECT a.*, c.name as category_name, u.first_name || ' ' || u.last_name as approved_by_name
      FROM activities a
      LEFT JOIN activity_categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.approved_by = u.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `)
        .all(studentId)
    }
    
    // JSON fallback - return sample activities for demo
    const sampleActivities = [
      {
        id: 1,
        student_id: studentId,
        title: "AI Ethics Research Paper",
        category: "Academic",
        status: "approved",
        credits: 8.5,
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        student_id: studentId,
        title: "Student Leadership Workshop",
        category: "Leadership",
        status: "approved",
        credits: 6.0,
        created_at: "2024-01-10T10:00:00Z"
      },
      {
        id: 3,
        student_id: studentId,
        title: "Hackathon Participation",
        category: "Technical",
        status: "submitted",
        credits: 5.0,
        created_at: "2024-01-08T10:00:00Z"
      },
      {
        id: 4,
        student_id: studentId,
        title: "Community Volunteer Work",
        category: "Volunteer",
        status: "approved",
        credits: 4.0,
        created_at: "2024-01-05T10:00:00Z"
      }
    ]
    
    return sampleActivities
  },

  getActivitiesForApproval: (facultyId?: number) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db
        ?.prepare(`
      SELECT a.*, c.name as category_name, 
             s.first_name || ' ' || s.last_name as student_name,
             s.student_id, s.department
      FROM activities a
      JOIN activity_categories c ON a.category_id = c.id
      JOIN users s ON a.student_id = s.id
      WHERE a.status = 'submitted'
      ORDER BY a.submission_date ASC
    `)
        .all()
    }
    return []
  },

  getAllCategories: () => {
    if (!usingFallback) {
      const db = getDatabase()
      return db?.prepare("SELECT * FROM activity_categories ORDER BY name").all()
    }
    return []
  },

  getStudentStats: (studentId: number) => {
    if (!usingFallback) {
      const db = getDatabase()
      return db
        ?.prepare(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(CASE WHEN status = 'approved' THEN credits_earned ELSE 0 END) as total_credits,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_activities,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_activities
      FROM activities 
      WHERE student_id = ?
    `)
        .get(studentId)
    }
    
    // JSON fallback - calculate stats from sample activities
    const activities = queries.getActivitiesByStudent(studentId)
    const stats = {
      total_activities: activities.length,
      total_credits: activities.filter((a: any) => a.status === 'approved').reduce((sum: number, a: any) => sum + a.credits, 0),
      approved_activities: activities.filter((a: any) => a.status === 'approved').length,
      pending_activities: activities.filter((a: any) => a.status === 'submitted').length
    }
    
    return stats
  },
}

// Close database connection (SQLite only)
export function closeDatabase() {
  if (db && !usingFallback) {
    db.close()
    db = null
  }
}
