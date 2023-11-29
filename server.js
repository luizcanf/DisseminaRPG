const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

let dadoAcao = [], d10_1 = [], d10_2 = []

function resetaDado(dado, lados) {
    for (let i=0; i<lados; i++) {
        dado[i] = 0
    }
}

app.get('/mestre', (req, res) => {
    resultado = ""
    res.render('index', { resultado })
})

app.post('/resetaDados', (req, res) => {
    resetaDado(dadoAcao, 6)
    resetaDado(d10_1, 10)
    resetaDado(d10_2, 10)
    res.redirect('/mestre')
})

app.listen(8080, () => {
    console.log('Rodando na porta 8080');
})