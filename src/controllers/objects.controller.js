//Se référer en priorité au fichier user.controller pour les commentaires

const Object = require("../models/object.model");

//  RETRIEVE OBJECT -- findById() va prendre le premier élément matchant l'object_id
module.exports.getObject = getObject = async (req, res, _f) => {
  try {
    const object = await Object.findById({_id: req.params.object_id }, { __v: 0 });

    if (!object) return res.status(404).json("Error | No object in db");
    else return res.status(200).json(object);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
};


//  RETRIEVE OBJECTS -- find() va prendre tout les éléments object et les envoyer au client
module.exports.getObjects = getObjects = async (req, res, _f) => {
  try {
    const objects = await Object.find({}, { __v: 0 });

    if (!objects) return res.status(404).json("Error | No objects in db");
    else return res.status(200).json(objects);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
};

//  ADD OBJECT -- son rôle consiste en l'ajout d'un objet
module.exports.addObject = addObject = async (req, res, next) => {
  try {
    const object = await new Object({});
    for (const key in await req.body) {
      object[key] = req.body[key];
    }

    let item = await object.save();

    if (!item) return res.status(404).json("Error | Could not add object");
    else return res.status(200).json(item);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

//  UPD PROFILE -- la différence avec addObject et qu'on doit chercher l'objet à updater
module.exports.updObject = updObject = async (req, res, next) => {
  try {
    let object = await Object.findById(
      { _id: req.params.object_id },
      { __v: 0 }
    );
    if (!object) return res.status(404).json("Error | Could not find object");

    for (const key in await req.body) {
      object[key] = req.body[key];
    }
    let upd = await object.save();

    if (!upd) return res.status(404).json("Error | Could not update");
    else return res.status(200).json(upd);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

//  DELETE OBJECT -- le premier object dont l'_id matche celui des paramètres est détruit
module.exports.delObject = delObject = async (req, res, next) => {
  try {
    const object = await Object.findOneAndRemove(
      { _id: req.params.object_id },
      { _id: 1 }
    );

    if (object) res.status(204).json();
    else return res.status(404).json("Error | Object could not be deleted");
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
