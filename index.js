const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
//dotenv permet à l'api de cherches des info confidentielles comme la clef de l'api 
//dans un fichier contenant des variables d'environements
const dotenv = require('dotenv');
//helmet est une librarie pour sécuriser les headers http des app express (voir plus bas)
const helmet = require("helmet");
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const { urlencoded, json } = require('body-parser')

const Users = require("./src/routes/user.routes.js");

const app = express();
const timeLimit = 60 * 60 * 24 * 10;

dotenv.config();

app.use(cors())
//parmis les utilisation de helmets, il y a celle de hidePoweredBy() qui cache quelle framework (dans notre cas express) fait tourner l'api
	.use(helmet.hidePoweredBy())
	.use(helmet.xssFilter())
	.use(helmet.frameguard({ action: 'deny' }))
	.use(helmet.ieNoOpen())
	.use(
		helmet.hsts({
			maxAge: timeLimit,
		})
	)
	.use(helmet.dnsPrefetchControl())
	.use(helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'"]
		}
	}));

const URI = process.env.DB_CONNECTION;

app.use(urlencoded({ extended: false, limit: '500kb' }));
app.use('/', json({ limit: '500kb' }));

app.use(bodyParserErrorHandler());

mongoose.set("strictQuery", false);

try {
	mongoose
		.connect(URI)
		.then(() => {
			app.use(express.json());
			app.use(express.urlencoded({ extended: true }));

			///toutes les URI concernants les utilisateurs decont commencer par /trouv/users
			app.use(`/trouv/users`, Users);

			const port = process.env.PORT || 5555;
			app.listen(port, () => {
				console.log(`Server connection up in Port ${port}`);
			});
		})
} catch (err) { console.log(err) }
