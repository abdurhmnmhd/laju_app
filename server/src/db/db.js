import { DatabaseSync} from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_FILE = path.join(__dirname, 'katalogwa.sqlite');

class SqliteDatabase {
    constructor() {
        this.db = new DatabaseSync(SQLITE_FILE);
        this.initTables();
        this.seedInitialData();
    }

    initTables() {
        //enable foreign key
        this.db.exec('PRAGMA foreign_key = ON;');

        // 1. Categories Table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2.Products Table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
            price INTEGER NOT NULL,
            stock_status TEXT NOT NULL DEFAULT 'Teresdia',
            description TEXT,
            image TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            `);

            //3. Setting Key-Value table
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            `);

            //4. admin authntication
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS admins (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
                `);

                //Indexes
                this.db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
                    CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_status);
                    `);
    };

     seedInitialData() {
        // Seed Settings
        const existingSettings = this.db.prepare('SELECT COUNT(*) AS count FROM settings').get();
        if (existingSettings.count === 0) {
          const insertSetting = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
          insertSetting.run('storeName', 'Laju Running Store');
          insertSetting.run('tagline', 'Outfit running nyaman untuk setiap langkah');
          insertSetting.run('phone', '6285793677363');
          insertSetting.run('address', 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan');
          insertSetting.run('currency', 'Rp');
        }
    
        // Seed Admin — password HANYA dari env (wajib >=8 karakter), tanpa password default
        const existingAdmin = this.db.prepare('SELECT COUNT(*) AS count FROM admins').get();
        if (existingAdmin.count === 0) {
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@katalogwa.com';
          const adminPassword = process.env.ADMIN_PASSWORD;
          if (!adminPassword || adminPassword.length < 8) {
            console.warn('[db] ADMIN_PASSWORD belum diset / terlalu pendek. Admin tidak dibuat. Set env ADMIN_PASSWORD lalu restart server.');
          } else {
            const hashedPassword = bcrypt.hashSync(adminPassword, 10);
            this.db.prepare(
              'INSERT INTO admins (id, name, email, password) VALUES (?, ?, ?, ?)'
            ).run('admin-1', process.env.ADMIN_NAME || 'Owner Laju ', adminEmail, hashedPassword);
          }
        }
    
        // Seed Categories
        const existingCategories = this.db.prepare('SELECT COUNT(*) AS count FROM categories').get();
        if (existingCategories.count === 0) {
          const insertCat = this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)');
          insertCat.run('cat-1', 'Kaos & Jersey Running', 'kaos-jersey-running');
          insertCat.run('cat-2', 'Celana Running', 'celana-running');
          insertCat.run('cat-3', 'Jaket & Setelan Running', 'jaket-setelan-running');
        }
    
        // Seed Products
        const existingProducts = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
        if (existingProducts.count === 0) {
          const insertProduct = this.db.prepare(`
            INSERT INTO products (id, name, category_id, price, stock_status, description, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
    
          const initialProducts = [
            {
              id: 'prod-1',
              name: 'Kaos Running Dry-Fit Pria',
              categoryId: 'cat-1',
              price: 129000,
              stockStatus: 'Tersedia',
              description: 'Kaos lari ringan berbahan dry-fit yang cepat menyerap keringat dan nyaman untuk latihan harian.',
              image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-2',
              name: 'Jersey Running Wanita',
              categoryId: 'cat-1',
              price: 145000,
              stockStatus: 'Tersedia',
              description: 'Jersey lari wanita dengan potongan ergonomis dan bahan breathable agar tetap sejuk saat berlari.',
              image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-3',
              name: 'Kaos Lengan Panjang UV Running',
              categoryId: 'cat-1',
              price: 169000,
              stockStatus: 'Tersedia',
              description: 'Atasan lari lengan panjang yang ringan dengan perlindungan UV untuk sesi outdoor.',
              image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-4',
              name: 'Celana Pendek Running 2-in-1',
              categoryId: 'cat-2',
              price: 159000,
              stockStatus: 'Tersedia',
              description: 'Celana pendek lari dengan inner support, bahan ringan, dan saku praktis untuk menyimpan barang kecil.',
              image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-5',
              name: 'Legging Running High-Waist',
              categoryId: 'cat-2',
              price: 189000,
              stockStatus: 'Tersedia',
              description: 'Legging elastis berpinggang tinggi dengan fit nyaman dan saku samping untuk latihan lari.',
              image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-6',
              name: 'Celana Jogger Training',
              categoryId: 'cat-2',
              price: 199000,
              stockStatus: 'Tersedia',
              description: 'Jogger training ringan dengan potongan fleksibel, cocok untuk pemanasan dan lari santai.',
              image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-7',
              name: 'Jaket Windbreaker Running',
              categoryId: 'cat-3',
              price: 279000,
              stockStatus: 'Tersedia',
              description: 'Jaket windbreaker ringan untuk melindungi tubuh dari angin saat berlari pagi atau latihan outdoor.',
              image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-8',
              name: 'Setelan Running Pria',
              categoryId: 'cat-3',
              price: 249000,
              stockStatus: 'Tersedia',
              description: 'Paket atasan dry-fit dan celana pendek running yang serasi untuk latihan dan lomba.',
              image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'prod-9',
              name: 'Setelan Running Wanita',
              categoryId: 'cat-3',
              price: 289000,
              stockStatus: 'Tersedia',
              description: 'Setelan olahraga wanita berbahan stretch dan breathable untuk bergerak leluasa saat berlari.',
              image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80'
            }
          ];
    
          for (const p of initialProducts) {
            insertProduct.run(p.id, p.name, p.categoryId, p.price, p.stockStatus, p.description, p.image);
          }
        }
      }
    
      // --- Settings SQL Operations ---
      getSettings() {
        const rows = this.db.prepare('SELECT key, value FROM settings').all();
        const settings = {};
        for (const row of rows) {
          settings[row.key] = row.value;
        }
        return settings;
      }
    
      updateSettings(newSettings) {
        const upsert = this.db.prepare(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);
    
        for (const [key, val] of Object.entries(newSettings)) {
          upsert.run(key, String(val));
        }
        return this.getSettings();
      }
    
      // --- Admin SQL Operations ---
      getAdmin() {
        return this.db.prepare('SELECT id, name, email, password FROM admins LIMIT 1').get();
      }

      updateAdminEmail(id, newEmail) {
        const res = this.db.prepare('UPDATE admins SET email = ? WHERE id = ?').run(newEmail, id);
        if (res.changes === 0) return null;
        return this.getAdmin();
      }

      updateAdminPassword(id, hashedPassword) {
        const res = this.db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, id);
        if (res.changes === 0) return null;
        return this.getAdmin();
      }
    
      // --- Category SQL Operations ---
      getCategories() {
        // Relational SQL query with LEFT JOIN and COUNT
        return this.db.prepare(`
          SELECT 
            c.id, 
            c.name, 
            c.slug, 
            c.created_at AS createdAt,
            COUNT(p.id) AS productCount
          FROM categories c
          LEFT JOIN products p ON c.id = p.category_id
          GROUP BY c.id
          ORDER BY c.created_at ASC
        `).all();
      }
    
      getCategoryById(id) {
        return this.db.prepare('SELECT id, name, slug FROM categories WHERE id = ?').get(id);
      }
    
      addCategory(name) {
        const id = `cat-${Date.now()}`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug);
        return { id, name, slug, productCount: 0 };
      }
    
      updateCategory(id, name) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const res = this.db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id);
        if (res.changes === 0) return null;
        return { id, name, slug };
      }
    
      deleteCategory(id) {
        const res = this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
        return res.changes > 0;
      }
    
      // --- Product SQL Operations ---
      getProducts(filters = {}) {
        let sql = `
          SELECT 
            p.id, 
            p.name, 
            p.category_id AS categoryId, 
            c.name AS categoryName, 
            p.price, 
            p.stock_status AS stockStatus, 
            p.description, 
            p.image, 
            p.created_at AS createdAt,
            p.updated_at AS updatedAt
          FROM products p
          JOIN categories c ON p.category_id = c.id
          WHERE 1=1
        `;
        const params = [];
    
        if (filters.categoryId) {
          sql += ' AND p.category_id = ?';
          params.push(filters.categoryId);
        }
    
        if (filters.stockStatus) {
          sql += ' AND p.stock_status = ?';
          params.push(filters.stockStatus);
        }
    
        if (filters.search) {
          sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)';
          const queryPattern = `%${filters.search.toLowerCase()}%`;
          params.push(queryPattern, queryPattern);
        }
    
        sql += ' ORDER BY p.created_at DESC';
    
        return this.db.prepare(sql).all(...params);
      }
    
      getProductById(id) {
        return this.db.prepare(`
          SELECT 
            p.id, 
            p.name, 
            p.category_id AS categoryId, 
            c.name AS categoryName, 
            p.price, 
            p.stock_status AS stockStatus, 
            p.description, 
            p.image, 
            p.created_at AS createdAt,
            p.updated_at AS updatedAt
          FROM products p
          JOIN categories c ON p.category_id = c.id
          WHERE p.id = ?
        `).get(id);
      }
    
      addProduct(productData) {
        const id = `prod-${Date.now()}`;
        const price = Number(productData.price) || 0;
        const stockStatus = productData.stockStatus || 'Tersedia';
        const description = productData.description || '';
        const image = productData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
    
        this.db.prepare(`
          INSERT INTO products (id, name, category_id, price, stock_status, description, image)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, productData.name, productData.categoryId, price, stockStatus, description, image);
    
        return this.getProductById(id);
      }
    
      updateProduct(id, productData) {
        const current = this.getProductById(id);
        if (!current) return null;
    
        const name = productData.name !== undefined ? productData.name : current.name;
        const categoryId = productData.categoryId !== undefined ? productData.categoryId : current.categoryId;
        const price = productData.price !== undefined ? Number(productData.price) : current.price;
        const stockStatus = productData.stockStatus !== undefined ? productData.stockStatus : current.stockStatus;
        const description = productData.description !== undefined ? productData.description : current.description;
        const image = productData.image !== undefined ? productData.image : current.image;
    
        this.db.prepare(`
          UPDATE products 
          SET name = ?, category_id = ?, price = ?, stock_status = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(name, categoryId, price, stockStatus, description, image, id);
    
        return this.getProductById(id);
      }
    
      toggleStock(id) {
        const product = this.getProductById(id);
        if (!product) return null;
    
        const newStock = product.stockStatus === 'Tersedia' ? 'Habis' : 'Tersedia';
        this.db.prepare(`
          UPDATE products 
          SET stock_status = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(newStock, id);
    
        return this.getProductById(id);
      }
    
      deleteProduct(id) {
        const res = this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
        return res.changes > 0;
      }

}
export const db = new SqliteDatabase();