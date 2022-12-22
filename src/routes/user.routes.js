/**
 * le router liste les différent URI qui permettront de consommer l'API.
 * Chaque URL dispose d'une requête liée à une URI. Par exemple, POST va crééer des objets,
 * tandis que delete en détruira.
 * 
 * Notons que logout est un peu différent dans sa structure comparé aux deux autre.
 * Premièrement, /:id implique que l'URI devra faire passer l'id unique à chaque utilisateur. 
 * Cet identifiant permettera de trouver et détruire l'objet session lié à l'utilisateur.
 * 
 * Enfin, avant de détruire la session, j'ai implémenté une fonction "tokenChk" dont j'explique le
 * rôle dans son fichier 'validation.rules.js'.
 *   
 */
const router = require("express").Router();
const { tokenChk } = require('../config/validation.rules');
const { register, login, logout } = require('../controllers/users.controller');

router.post("/register", async function(req,res){
    await register(req,res);
});
router.post("/login", async function(req,res){
    await login(req,res);
});
router.delete("/logout/:id", tokenChk, async (req, res) => {
    await logout(req,res);
})

module.exports = router;