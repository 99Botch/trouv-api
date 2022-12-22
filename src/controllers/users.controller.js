const User = require("../models/user.model");
const Session = require("../models/session.model");
//voir plus bas
const bcrypt = require("bcrypt");
//j'explique en détails jwt dans le fichier validation.rules
const jwt = require("jsonwebtoken");

//  REGISTER
module.exports.register = register = async (req, res, next) => {
  /**
   * 'uniqueness' check l'unicité des identifiants envoyés via la requête et de renvoyer une erreur si ça n'est pas le cas.
   *
   * findOne() est une fonction moongose qui va scanner la collection users et retourner le premier élèments qui matche
   * les paramètres envoyés dans la fonction, ici le mail et l'username
   */
  const uniqueness = await User.findOne({
    $or: [{ mail: req.body.mail }, { username: req.body.username }],
  });
  if (uniqueness)
    return res.status(400).json("Error | Username or Mail already taken");

  /**
   * j'utilise regex afin de m'assurer que les mots de passes respectent un certain format:
   * minimum 8 characters avec une majuscule, une minuscule, un chiffre et un charactère spécial (!@_#\$%\^&\*) au minimum.
   * Si le format n'est pas respecté, alors une erreur 400 est renvoyée.
   *
   * bcrypt est une librarie js pour hasher les mots de passe de manière irréversible. Dès lors, les mdps seront stockés dans
   * la BDD sous une forme cachées qui les rendents plus sécurisés.
   *
   * J'utilise un salt de 12, et non de 10, c'est plus long qu'à 10, mais pas assez pour que l'utilisateur le remarque, tout en
   * étant plus sécurisé que 10, chiffre reccomandé par bcrypt
   */
  let password_rules = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@_#$%^&*])(?=.{8,})"
  );
  let format = password_rules.exec(req.body.password);
  if (!format)
    return res
      .status(400)
      .json(
        "Error | Password must contain at least one lowercase, one uppercase, one number and one special character (!@_#$%^&*)"
      );
  req.body.password = await bcrypt.hash(req.body.password, 12);

  /**
   * 'user' est un objet dont les attributs ce calques sur le model USER. Rajouter des attributs dans la requête ne servirait
   * à rien car le model n'accepte que trois attributs (voir le model).
   *
   * 'session' est utilisé de la même façon. Les JWT ont une durée de vie de 3h heures, durées de temps arbitraire.
   * Je ne souhaitais pas faire plus long afin qu'il n'y est pas d'accès permanent de possible.
   *
   * Mes tokens on quatres informations essentielles: la date d'émition et d'expiration. L'username et l'user_id, ces
   * deux derniers servant à l'identification des utilisateurs par la suite (voir validation.rules).
   *
   * Pour chaque attributs dans l'objet req.body, une loop est créée.
   * la clef liée à l'attibut va ensuite être ajouté à l'objet que l'on
   * désire créer et dont le nom est le même que celui de l'objet sur lequel on loop
   *
   * Une fois la for loop terminée, l'objet est créé et envoyé dans la collection objects
   */

  const user = await new User({});
  for (const key in await req.body) {
    user[key] = req.body[key];
  }

  const session = await new Session({
    user_id: user._id,
    token: jwt.sign(
      {
        _id: user.id,
        s: user.username,
      },
      process.env.API_KEY,
      { expiresIn: "3h" }
    ),
  });

  /**
   * Afin de gagner du temps, la promesse suivante envoie deux requêtes simultanées, l'une pour la création de l'utilisateur,
   * l'autre pour la création de la session utilisateur.
   *
   * Si les deux objets ont bien été sauvegardé (save()) dans leurs collections respectives, alors l'api renvoie une réponse avec
   * le token de l'utilisateur qui sera conservé côté client.
   */
  try {
    Promise.all([await user.save(), await session.save()]).then(
      async ([user, session]) => {
        const profile = {
          token: session.token,
        };
        if (user && session) return res.status(200).json(profile);
        else return res.status(401).json("Error | Could not create user");
      }
    );
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

//  LOGIN
/**
 * Se réfèrer plus haut pour plus d'explication
 */
module.exports.login = login = async (req, res, next) => {
  try {
    const user = await User.findOne({ mail: req.body.mail }, { __v: 0 });
    if (!user) return res.status(404).json("Error | User not in db");

    /**
     * bcrypt.compare sert ici à comparer le mdp en plain text reçus depuis le client contre le hash qui se trouve
     * dans la BDD.
     */
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).json(`Error | Wrong password`);

    /**
     * Si une première session utilisateur éxiste, alors celle-ci est détruite avant d'être remplacée par une
     * nouvelle session. J'utilise ça plutôt pour la phase de dév, afin d'éviter d'avoir des sessions qui ne correspondent plus à
     * rien. Le client lui ne triggera pas 'login' à moins que son token ne soit plus valide car il sera automatiquement
     * redirigé vers la partie back-office de l'app.
     */
    const token = await Session.findOne(
      { user_id: user._id },
      { _id: 0, token: 1 }
    );
    if (token) await Session.deleteOne({ user_id: user._id });

    const session = await new Session({
      user_id: user._id,
      token: jwt.sign(
        {
          _id: user.id,
          s: user.username,
        },
        process.env.API_KEY,
        { expiresIn: "3h" }
      ),
    });
    await session.save();

    let profile = {
      token: await session.token,
    };

    if (!profile) return res.status(404).json("Error | Could not login");
    else return res.status(200).json(profile);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

//  LOGOUT
module.exports.logout = logout = async (req, res, next) => {
  try {
    //le premier token matchant les prérequis de findOneAndRemove() est détruits. La requête prend fin à ce moment là
    const token = await Session.findOneAndRemove(
      { user_id: req.params.id },
      { _id: 1, user_id: 1 }
    );

    if (token) res.status(200).json("You logged out");
    else return res.status(404).json("Error | Not logged in");
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
