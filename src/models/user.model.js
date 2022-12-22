const mongoose = require("mongoose");

/**
 * Le modèle va être le blueprint pour la structure des données. C'est ce aui discute directement
 * avec la base de données.
 * Chaque élément doit être présent pour qu'un profil utilisateur puisse être créé
 *      -> required: true
 * De même que le type des attributs est précisé. Dans le cas des utilisteurs, uniquement des String.
 */
const schema = mongoose.Schema({
	username: {
        type: String,
        required: true,
    },
	mail: {
        type: String,
        required: true,
    },
	password: {
        type: String,
        required: true,
    },
});

//J'exporte de schema afin qu'il soit disponible pour le controller
module.exports = mongoose.model("User", schema);