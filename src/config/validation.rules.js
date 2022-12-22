/**
 * J'importe le schema session pour pouvoir accès à la structure session
 *
 * Le but de tokenChk est de checker la validité de la session utilisateur.
 *
 * La première étape (l.13) consiste à récupérér le token JWT.
 * Ceci fait, un requête est envoyé à la collection sessions. La requête cherchera la session
 * en fonction du string token et de l'id de l'utilisateur.
 * Enfin la reqûete renvoit uniquement l'user_id et le token, l'_id de la session étant inutile la requête ne le renvoit pas
 */
const Session = require("../models/session.model");
const jwt = require("jsonwebtoken");

module.exports.tokenChk = tokenChk = async function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const session = await Session.findOne(
    { user_id: req.params.id, token: token },
    { _id: 0, token: 1, user_id: 1 }
  );

  //Si la session ou le token n'existe pas, alors l'api renvoie une erreur 403.
  if (!token || !session)
    return res
      .status(403)
      .json({ message: "Error | No token or Session is not matching user" });

  jwt.verify(token, process.env.API_KEY, async (err, user) => {
    //Cette condition rendra une erreur notament si la validité du token à expiré.
    if (err) return res.status(403).json({ err: err.message });
    //j'ai rajouté une condition pour m'assurer de l'identité de l'utilisateur. Si l'id des paramètres et celui de la session
    //ne sont pas les même, alors l'api donne une erreur 403.
    if (req.params.id != user._id)
      return res.status(403).json({ message: "Error | Profile missmatch" });
    next();
  });
};

/**
 * La fonction si dessous fait pratiquement la même chose, à ceci prêt qu'elle ne prends pas de paramètre :id
 * et que l'username du token est sauvegardé dans req, ce qui servira à compléter automatiquement le nom lié à l'objet créer 
 * dans la fonction addObject
 */
module.exports.sessionChk = sessionChk = async function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Error | No token" });

  jwt.verify(token, process.env.API_KEY, async (err, user) => {
    if (err) return res.status(403).json({ err: err.message });
    const session = await Session.findOne(
      { user_id: user._id, token: token },
      { _id: 0, token: 1, user_id: 1 }
    );

    if (!session)
      return res.status(403).json({
        message: "Error | Session does not exist or profile missmatch",
      });

    req.body.addedBy = user.s;
    next();
  });
};
