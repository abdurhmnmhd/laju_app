
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email dan password wajib diisi'
        });
    }

    const admin = db.getAdmin();

    if (!admin) {
        return res.status(500).json({
            success: false,
            message: 'Data admin tidak ditemukan'
        });
    }

    // Validate email
    if (email.trim().toLowerCase() !== admin.email.toLowerCase()) {
        return res.status(401).json({
            success: false,
            message: 'Email atau password salah'
        });
    }

    // Validate password
    const isMatch = bcrypt.compareSync(password, admin.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Email atau password salah'
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            name: admin.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: {
            id: admin.id,
            email: admin.email,
            name: admin.name
        }
    });
});

// Get current admin profile (selalu dari DB agar email terbaru terbaca)
router.get('/me', authenticateToken, (req, res) => {
    const admin = db.getAdmin();
    if (!admin) {
        return res.status(500).json({ success: false, message: 'Data admin tidak ditemukan' });
    }
    res.json({
        success: true,
        data: {
            id: admin.id,
            email: admin.email,
            name: admin.name
        }
    });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Ganti email admin (wajib login + konfirmasi password saat ini)
router.put('/me/email', authenticateToken, (req, res) => {
    const { newEmail, currentPassword } = req.body || {};
    const email = typeof newEmail === 'string' ? newEmail.trim().toLowerCase() : '';

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email baru wajib diisi' });
    }
    if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ success: false, message: 'Format email baru tidak valid' });
    }
    if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Password saat ini wajib diisi untuk mengganti email' });
    }

    const admin = db.getAdmin();
    if (!admin) {
        return res.status(500).json({ success: false, message: 'Data admin tidak ditemukan' });
    }
    if (email === admin.email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Email baru sama dengan email saat ini' });
    }
    if (!bcrypt.compareSync(String(currentPassword), admin.password)) {
        return res.status(401).json({ success: false, message: 'Password saat ini salah' });
    }

    try {
        const updated = db.updateAdminEmail(admin.id, email);
        if (!updated) {
            return res.status(500).json({ success: false, message: 'Gagal mengganti email' });
        }
        res.json({
            success: true,
            message: 'Email admin berhasil diganti. Silakan login ulang dengan email baru.',
            data: { id: updated.id, email: updated.email, name: updated.name }
        });
    } catch (err) {
        if (String(err.message || '').includes('UNIQUE')) {
            return res.status(409).json({ success: false, message: 'Email sudah digunakan akun lain' });
        }
        throw err;
    }
});

// Ganti password admin (wajib login + password saat ini, password baru min. 8 karakter)
router.put('/me/password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Password saat ini wajib diisi' });
    }
    if (!newPassword || String(newPassword).length < 8) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter' });
    }
    if (confirmPassword !== undefined && String(confirmPassword) !== String(newPassword)) {
        return res.status(400).json({ success: false, message: 'Konfirmasi password baru tidak sama' });
    }

    const admin = db.getAdmin();
    if (!admin) {
        return res.status(500).json({ success: false, message: 'Data admin tidak ditemukan' });
    }
    if (!bcrypt.compareSync(String(currentPassword), admin.password)) {
        return res.status(401).json({ success: false, message: 'Password saat ini salah' });
    }

    const hashed = bcrypt.hashSync(String(newPassword), 10);
    const updated = db.updateAdminPassword(admin.id, hashed);
    if (!updated) {
        return res.status(500).json({ success: false, message: 'Gagal mengganti password' });
    }
    res.json({
        success: true,
        message: 'Password admin berhasil diganti. Gunakan password baru untuk login berikutnya.'
    });
});

export default router;
