import loginM from '../../models/ModelLogin/login'
import cliente from '../../models/ModelCliente/cliente';
import {Request,Response} from 'express'
import bcrypt from "bcrypt";
import api from "../../config/api/api";
const url = process.env.APP_URL
class loginController {
    static cadastrarLogin = async (req:Request, res:Response) => {
        const { email, password, isAdmin } = req.body
        try {
            const usuarioExiste = await loginM.findOne({ email })
            if (!usuarioExiste) {
                bcrypt.hash(password, 10)
                    .then(hash => {
                        let encryptedPassowrd = hash

                        let newLogin = new loginM({
                            email: email,
                            password: encryptedPassowrd,
                            isAdmin: isAdmin
                        });
                        newLogin.save((err) => {
                            if (err) {
                                res.status(500).send(({ message: `${err.message} - falha ao cadastrar o login` }));
                            } else {
                                res.status(200).send(newLogin.toJSON())
                            };
                        })
                    }).catch(err => res.status(500).json({ message: `erro ao cadastrar login- ${err}` }))
            } else {
                res.status(200).send(({ message: "email ja cadastrado" }))
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao pesquisar email!" })
        }
    }
    static listarLogin = (req:Request, res:Response) => {
        loginM.find((err:Error, loginBody:Response) => {
            try {
                res.status(200).json(loginBody)
            } catch {
                res.status(400).json(`erro ao listar login- ${err}`)
            }
        })
    }
    static listarLoginID = (req:Request, res:Response) => {
        const id = req.params.id

        loginM.findById(id, (err:Error, loginBody:Response) => {
            if (err) {
                res.status(400).send({ menssage: `${err.message} - id do fornecedor não encotrado` });
            } else {
                res.status(200).send(loginBody);
            }
        })
    }
    static atualizarLogin = (req:Request, res:Response) => {
        const id = req.params.id;

        loginM.findByIdAndUpdate(id, { $set: req.body }, (err:Error) => {
            if (err) {
                res.status(400).send({ menssage: `${err.message} - id do login não encontrado` });
            } else {
                res.status(200).send({message: "login atualizado com sucesso"});
            }
        })
    }
    static excluirLogin = (req:Request, res:Response) => {
        const id = req.params.id;
        loginM.findByIdAndDelete(id, (err:Error) => {
            if (!err) {
                res.status(200).send({ message: `login deletado` });
            } else {
                res.status(500).send({ message: `${err.message} - erro ao deletar login` });
            }
        });
    }
    static realizarLogin = async (req:Request, res:Response) => {
        const { email, password } = req.body
        try {
            const usuarioExiste = await loginM.findOne({ email })
            if (!usuarioExiste) {
                return res.status(200).send({ message: "email não cadastrado" })
            } else {
                const comparaSenha = await bcrypt.compareSync(password, usuarioExiste.password)
                if (comparaSenha) {
                    return res.status(200).json({ result: usuarioExiste })
                } else {
                    return res.status(200).send({ message: "senha incorreta" })
                }
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao Tentar Login!" })
        }
    }
    static pesquisarEmail = async (req:Request, res:Response) => {
        const { email } = req.body;
        try {
            const pesquisaEmail = await loginM.findOne({ email });
            console.log(pesquisaEmail)
            if (!pesquisaEmail) {
                res.status(200).send({ emailExiste: false });
            } else {
                res.status(200).send({ emailExiste: true });
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao pesquisar o e-mail!" })
        }
    }
    static pesquisarEmail_RetornarCliente = async (req:Request, res:Response) => {
        const { email } = req.body;
        try {
            const pesquisaLogin = await loginM.findOne({email})
            console.log(pesquisaLogin?._id.toString())
            const login = pesquisaLogin
            console.log(login)
            const pesquisaCliente = await cliente.findOne({login})
            console.log(pesquisaCliente)
            const id = pesquisaCliente?._id.toString();
            api.get(`${url}/listar-cliente/${id}`).then(resposta => {
                console.log(resposta.data._id)
                res.status(200).json(resposta.data)
                
            }).catch((error) => {
                console.log(error)
                res.status(500).json({ message: "Erro ao pesquisar o e-mail!" })
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Erro ao pesquisar o e-mail!" })
        }
    }
}
export default loginController;