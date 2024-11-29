const express = require('express')
const PORT = process.env.PORT || 3000
const app = express()
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(express.static('public'))
let d6 = [], d10_1 = [], d10_2 = []
let rolagensD6 = 0, rolagensD10_1 = 0, rolagensD10_2 = 0
let rolagemAberta = false, votacaoAberta = false
let votosItem = 0, votosFugir = 0, votosRanged = 0, votosMeele = 0
let passoAtual = -1, votacaoAtual = 0
resetaDado(d6, 6)
resetaDado(d10_1, 10)
resetaDado(d10_2, 10)

function maior() {
    const maior = Math.max(votosItem, votosFugir, votosMeele, votosRanged)
    if (maior === votosItem) { 
        return 'O mais votado foi usar item com: ' + votosItem + 'votos'
    } else if (maior === votosFugir) { 
        return 'O mais votado foi fugir com: ' + votosFugir + 'votos'
    } else if(maior === votosRanged) { 
        return 'O mais votado foi ataque a distância com: ' + votosRanged + 'votos'
    } else {
        return 'O mais votado foi ataque corpo-a-corpo com: ' + votosMeele + 'votos'
    }
}

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

function resolucaoIronsworn(total, desafio1, desafio2) {
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
    return resolucao
}

app.get('/', (req, res) => {
    res.redirect('completa')
})

app.get('/mestre', (req, res) => {
    res.render('senha')
})

TSH=s=>{for(var i=0,h=9;i<s.length;)h=Math.imul(h^s.charCodeAt(i++),9**9);return h^h>>>9}
app.post('/inicio', (req, res) => {
    if(TSH(req.body.senha)==1438420344) {
        res.render('index')
    } else {
        res.redirect('completa')
    }
})

app.post('/voltar', (req, res) => {
    res.render('index')
})

app.post('/resetaDados', (req, res) => {
    resetaDado(d6, 6)
    rolagensD6 = 0
    resetaDado(d10_1, 10)
    rolagensD10_1 = 0
    resetaDado(d10_2, 10)
    rolagensD10_2 = 0
    rolagemAberta = true
    res.render('esperaRolagens')
})

app.post('/exibeRolagem', (req, res) => {
    rolagemAberta = false
    const acao = moda(d6, 6)
    const desafio1 = moda(d10_1, 10)
    const desafio2 = moda(d10_2, 10)
    const bonus = parseInt(req.body.bonus)
    let total = acao + bonus
    let resolucao = resolucaoIronsworn(total, desafio1, desafio2)
    total = `${acao} + ${bonus} = ${total}`
    res.render('resultado', {total, desafio1, desafio2, resolucao})
})

app.get('/rolagensEstado', (req, res) => {
    res.json({ rolagens: rolagensD6 })
})

app.post('/proximoPasso', (req, res) => {
    if (!votacaoAberta) {
        votacaoAberta = true
        passoAtual++
        res.send('Votação iniciada')
    } else {
        res.send('Votação já está em andamento')
    }
})

app.post('/fecharVotacao', (req, res) => {
    if (votacaoAberta) {
        votacaoAberta = false
        res.send('Votação encerrada')
    } else {
        res.send('Votação já encerrada')
    }
})

app.get('/votacaoEstado', (req, res) => {
    res.json({ votacao: votacaoAberta, passoServer: passoAtual })
})

app.get('/escolha', (req, res) => {
        res.render('escolha' , { passoServer: passoAtual})
})

app.post('/votoRanged', (req, res) => {
    votosRanged++
    votacaoAtual++
    console.log(`${votacaoAtual} votos no total, ${votosRanged} votos pra ataque a distância`)
    res.redirect('completa')
})

app.post('/votoMeele', (req, res) => {
    votosMeele++
    votacaoAtual++
    console.log(`${votacaoAtual} votos no total, ${votosMeele} votos pra ataque corpo-a-corpo`)
    res.redirect('completa')
})

app.post('/votoFugir', (req, res) => {
    votosFugir++
    votacaoAtual++
    console.log(`${votacaoAtual} votos no total, ${votosFugir} votos pra fugir`)
    res.redirect('completa')
})

app.post('/votoItem', (req, res) => {
    votosItem++
    votacaoAtual++
    console.log(`${votacaoAtual} votos no total, ${votosItem} votos pra usar item`)
    res.redirect('completa')
})

app.get('/resultadoVotacao', (req, res) => {
    resultado = maior()
    votosFugir = 0
    votosItem = 0
    votosLutar = 0
    votacaoAtual = 0
    res.render('resultadoVotacao', { resultado })
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

app.get('/completa', (req, res) => {
    res.render('rolagem', {dado:'full', nomeDado: 'Dados', passoAtual: passoAtual, votacaoAberta: votacaoAberta})
})

app.post('/full', (req, res) => {
    if (rolagemAberta) {
        rollD6 = Math.floor(Math.random()*6)
        d6[rollD6] = d6[rollD6] + 1
        rollD6 = rollD6+1
        rolagensD6++
        rollD10_1 = Math.floor(Math.random()*10)
        d10_1[rollD10_1] = d10_1[rollD10_1] + 1
        rollD10_1 = rollD10_1+1
        rolagensD10_1++
        rollD10_2 = Math.floor(Math.random()*10)
        d10_2[rollD10_2] = d10_2[rollD10_2] + 1
        rollD10_2 = rollD10_2+1
        rolagensD10_2++
        resultado = `Dado de ação (D6): ${rollD6} <br> Dado de desafio 1 (D10): ${rollD10_1} <br> Dado de desafio 2 (D10): ${rollD10_2}`
        resolucao = `Desconsiderando bônus/penalidade sua rolagem seria um: ${resolucaoIronsworn(rollD6, rollD10_1, rollD10_2)}`
        console.log(`${rolagensD10_2} rolagens no total, Dado de ação (D6): ${rollD6}`)
        res.render('rolagem', {dado:'full', nomeDado: 'Dados', resultado, rolagem: rolagensD6, resolucao: resolucao, passoAtual: passoAtual, votacaoAberta: votacaoAberta})
    } else {
        res.render('rolagem', {dado:'full', nomeDado: 'Dados', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.', passoAtual: passoAtual, votacaoAberta: votacaoAberta})
    }
})

app.listen(PORT, () => {
    console.log(`Rodando na porta ${PORT}`);
})