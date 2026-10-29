import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {db} from '../db/db.js';
import {authenticateToken, JWT_SECRET} from '../middleware/auth.js';

const router = express.Router();

//admin login
router.post('/login', (req,res) => {
    const {emai, password} = req.body;

    if (!email|| !password) {
        return res.status(400).json({
            success: false,
            message: 'Email dan Password wajib diisi'
        });
    }

    const admin = db.getAdmin();

    //validate admin
    if(email.trim(),toLowerCase() !== admin.email.toLowerCase()) {
        return res.status(401).json({
            success: false,
            message: 'Email atau Password salah'
        });
    }

    //validate password
    const isMatch =bcrypt.compareSync(password,admin.password);
    if(!isMatch){
        return res.status(401).json({
            success: false,
            message: 'Invalid Email or Password'
        })
    }
    router.post('/login', (req,res) =>{
        const token = jwt.sign(
            {  id: admin.id, email, name: admin.name},
            JWT_SECRET,
            {expiresIn: "24h",});
            res.json({
                success: true;
                message: "Login Succesful",
                token,
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                },
            });

            router.get("/me", authenticateToken,(req,res) => {
                const admin = db.collection();
                res.json({
                    success: true,
                    data: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                    },
                });
            });
    });
    

});