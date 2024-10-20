import { users } from "../db";

export const validaEmail = (request, response, next) => {
    const {email} = request.body;
    
    const emailValid = users.find(u => u.email === email);

    if (!emailValid) {
        next()
    }else{
        response.status(404).json({success:false,message: "Email já cadastrado"});
    }
}

export const validaIdRecado = (request, response, next) => {
    const {id, idRecado} = request.params;
    
    const indexUser = users.findIndex(u => u.id  === Number(id))
    if (indexUser === -1) {
        return response.status(404).json({success:false, message:"Usuario não encontrado"})
    }else{
        next()
    }


    const message = users[indexUser].recados.findIndex(m => m.id === Number(idRecado))
    if (message === -1) {
        return response.status(404).json({success:false, message:"Email não encontrado"})
    }else{
        next()
    }
}

