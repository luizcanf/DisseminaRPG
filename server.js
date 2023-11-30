const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

let d6 = [], d10_1 = [], d10_2 = []
let rolagensD6 = 0, rolagensD10_1 = 0, rolagensD10_2 = 0
let rolagemAberta = true
resetaDado(d6, 6)
resetaDado(d10_1, 10)
resetaDado(d10_2, 10)

function resetaDado(dado, lados) {
    for (let i=0; i<lados; i++) {
        dado[i] = 0
    }
}

function moda(dado, lados) {
    let resultado = 0, check = 0
    for (let i=0; i<lados; i++) {
        if (lados==6 && dado[i] >= check) {
            check = dado[i]
            resultado = i
        }
        if (lados==10 && dado[i] > check) {
            check = dado[i]
            resultado = i
        }
    }
    resultado++
    return resultado
}

app.get('/mestre', (req, res) => {
    resultado = ""
    res.render('index', { resultado })
})

app.post('/resetaDados', (req, res) => {
    resetaDado(d6, 6)
    rolagensD6 = 0
    resetaDado(d10_1, 10)
    rolagensD10_1 = 0
    resetaDado(d10_2, 10)
    rolagensD10_2 = 0
    rolagemAberta = true
    res.redirect('/mestre')
})

app.post('/exibeRolagem', (req, res) => {
    rolagemAberta = false
    const acao = moda(d6, 6)
    const desafio1 = moda(d10_1, 10)
    const desafio2 = moda(d10_2, 10)
    const bonus = parseInt(req.body.bonus)
    let total = acao + bonus
    let resolucao
    if (total > desafio1 && total > desafio2 && desafio1 == desafio2)
        resolucao = 'Acerto Crítico!' 
    else if (total > desafio1 && total > desafio2)
        resolucao = 'Acerto Forte!'
    else if (total <= desafio1 && total <= desafio2 && desafio1 == desafio2)
        resolucao = 'Erro Crítico!'
    else if (total <= desafio1 && total <= desafio2)
        resolucao = 'Erro!'
    else
        resolucao = 'Acerto Fraco.'

    total = `${acao} + ${bonus} = ${total}`
    res.render('resultado', {total, desafio1, desafio2, resolucao})
})

app.get('/acao', (req, res) => {
    res.render('rolagem', {dado:'d6', nomeDado: 'Dado de Ação'})
})

app.post('/d6', (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*6)
        d6[roll] = d6[roll] + 1
        rolagensD6++
        res.render('rolagem', {dado:'d6', nomeDado: 'Dado de Ação', resultado: roll+1, rolagem: rolagensD6})
    } else {
        res.render('rolagem', {dado:'d6', nomeDado: 'Dado de Ação', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
})

app.get('/desafio1', (req, res) => {
    res.render('rolagem', {dado:'d10_1', nomeDado: 'Dado de Desafio 1'})
})

app.post('/d10_1', (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*10)
        d10_1[roll] = d10_1[roll] + 1
        rolagensD10_1++
        roll3 = Math.floor(Math.random()*10)
        d10_2[roll3] = d10_2[roll3] + 1
        rolagensD10_2++
        res.render('rolagem', {dado:'d10_1', nomeDado: 'Dado de Desafio 1', resultado: roll+1, rolagem: rolagensD10_1})
    } else {
        res.render('rolagem', {dado:'d10_1', nomeDado: 'Dado de Desafio 1', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
})

app.get('/desafio2', (req, res) => {
    res.render('rolagem', {dado:'d10_2', nomeDado: 'Dado de Desafio 2'})
})

app.post('/d10_2', (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*10)
        d10_2[roll] = d10_2[roll] + 1
        rolagensD10_2++
        res.render('rolagem', {dado:'d10_2', nomeDado: 'Dado de Desafio 2', resultado: roll+1, rolagem: rolagensD10_2})
    } else {
        res.render('rolagem', {dado:'d10_2', nomeDado: 'Dado de Desafio 2', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
})

app.listen(8080, () => {
    console.log('Rodando na porta 8080');
})