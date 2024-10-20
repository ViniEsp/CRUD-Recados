import express, { request, response } from 'express';

import bcrypt from 'bcrypt'
import { validaEmail, validaIdRecado } from './middleeware/middleware.js';
import { users } from './db/index.js';

const cors = require('cors');

const app = express();

app.use(express.json());
// Habilitando o CORS para todas as origens
app.use(cors());

let contador = 1;
let contadorRecados = 2;


//Rota principal da API: OK
app.get('/', (request, response) => {
    return response.status(200).json('Bem vindo a API de recados do Vinicius!');
});

// Rota para exibir usuários e seus recados: OK
app.get('/users', (request, response) => {
  // Implemente a lógica de paginação aqui, se necessário
    return response.json(users);
});

// Criar newUser: OK
app.post('/signup',validaEmail, async (request, response) => {
    const { name, email, password } = request.body;

    // Verificar se todos os dados foram fornecidos
    if (!name) {
        return response.status(400).json({ message: "Por favor, verifique se passou o nome ." });
    }
    
    if (!email) {
        return response.status(400).json({ message: "Por favor, verifique se passou o email ." });
    }
    if (!password) {
        return response.status(400).json({ message: "Por favor, verifique se passou a senha" });
    }
    

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(password, salt);
    
    let newUser = {
        id: users.length+1,
        name,
        email,
        password: senhaCriptografada,
        recados:[]
    }
    users.push(newUser)

    return response.status(201).json({message: `Seja bem vindo ${ newUser.name}! Pessoa usuária registrada com sucesso!`});

});

// Rota de login: OK
app.post('/login', (request, response) => {
    const { email, password } = request.body;

    if (!email) {
        return response.status(400).json({ error: 'Insira um e-mail válido' });
    }
    if (!password) {
        return response.status(400).json({ error: 'Insira uma senha válida' });
    }

    const newUser = users.find((user) => user.email === email);
    if (!newUser) {
        return response.status(401).json({ error: 'Email não encontrado no sistema, verifique ou crie uma conta'});
    }

    return response.status(200).json({ message: `Seja bem vindo ${ newUser.name} ! Pessoa usuária logada com sucesso!`});
});


// Criar recados: OK
app.post('/massage', (request, response) => {
    // Obter o corpo da requisição e o parâmetro de ID da URL
    const { title, description, email} = request.body;

    // Validar se o corpo da requisição contém as propriedades necessárias
    if (!title) {
        return response.status(400).json({ error: "Certifique-se de fornecer 'title'." });
    }
    if (!description) {
        return response.status(400).json({ error: "Certifique-se de fornecer 'description'." });
    }
    if (!email) {
        return response.status(400).json({ error: "Certifique-se de fornecer 'email'." });
    }


    const user = users.find(user => user.email === email);
    if (!user) {
        return response.status(404).json({ error: 'Usuário não encontrado. Verifique o email e tente novamente.' });
    }

    // Criar um novo recado com base nos dados fornecidos no corpo da requisição
    const newMassage = {
        id: contadorRecados++,
        title,
        description
    };


    // Adicionar o novo recado ao array de recados do usuário
    user.recados.push(newMassage);

    // Responder com sucesso e o recado criado
    return response.status(201).json({ message: `Mensagem criada com sucesso! (${newMassage.description})`});
});


// Listar recados pelo Email do Usuário:  OK
app.get('/messages/:email', (request, response) => {
    const email = request.params.email;

    // Validação básica do email
    if (!email) {
        return response.status(400).json({ error: 'O campo email é obrigatório.' });
    }

    // Busca do usuário
    const user = users.find(user => user.email === email);

    if (!user) {
        return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return response.status(200).json({
        message: 'Mensagens do usuário:',
        messages: user.recados,
    });
});


// Atualizar recados: OK
app.put('/messages/:id/:idRecado',validaIdRecado, (req, res) => {
    const { id,idRecado } = req.params;
    const { title, description } = req.body;


    const indexUser = users.findIndex(user => user.id === Number(id))

    const indexRecado = users[indexUser].recados.findIndex(r => r.id === Number(idRecado))
    users[indexUser].recados[indexRecado] = {
        description,
        title,
        id: Number(idRecado)
    }
    
    return res.status(201).json({success:true, message:"Mensagem atualizada"})
});

//Excluir recados: OK
app.delete('/users/recados/:id/:idRecado', (request, response) => {
    const { id,idRecado } = request.params;

    const userId = users.find(u => u.id === Number(id));
    if (!userId) {
        return response.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const indexRecado = userId.recados.findIndex((recado) => recado.id === Number(idRecado));
    if (indexRecado === -1) {
        return response.status(404).json({ error: 'Recado não encontrado.' });
    }

    userId.recados.splice(indexRecado, 1);

    return response.json({ message: 'Recado apagado com sucesso.' });
});

app.listen(3000, () => console.log("Servidor iniciado")); 