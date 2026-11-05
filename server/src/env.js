// Dimuat .env SEBELUM module lain (middleware/routes) dievaluasi.
// ESM mengevaluasi import sesuai urutan, jadi file ini harus import pertama.
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env'), quiet: true });
