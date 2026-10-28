const express = require ('express');
const app = express ();
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());
app.get('/', (req,res) => {
    res.send("Hello Man");
});

app.get('/api/product', (req,res) => {
    const produk = [
        {
            id: 1,
            nama: 'Kaos',
            harga: 30000
        },
        {id: 2,
            nama: 'Kaos',
            harga: 30000
        }
    ];
    res.json(produk)
})

app.listen(port,() => {
    console.log(`Server berjalan di http//localhost:${port}`)
});