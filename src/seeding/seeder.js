/**
 * L'objectif du seeder est de peupler rapidement une base de données pour avoir de la data réaliste afin de travailler avec lors
 * du développement.
 * 
 * J'ai répliqué quelque peu index.js en ne gardant que le nécessaire pour crééer un connection avec la DDB.
 * Afin de m'aider, j'ai téléchargé la librarie faker.js qui peut générer du texte pour les attributs de nos objets.
 */
const mongoose = require("mongoose");
const Objects = require("../models/object.model");
const { faker } = require("@faker-js/faker");

mongoose.set("strictQuery", false);

try {
  mongoose
    .connect(
      LIEN_BDD,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(async () => {
      console.log("MONGO CONNECTION --> OPEN");
      /**
       * Une fois la collection établis, je nétoie la BBD des objets d'avant, j'évite comme celà d'avoir trop de données.
       * Ceci fait, j'insert l'array 'seedDB' avec tout les objets qui viennent vont être créés.
       */
      await Objects.deleteMany({});
      await Objects.insertMany(seedDB);
      mongoose.connection.close;
      console.log("MONGO CONNECTION --> CLOSE");
    })
    .catch((err) => {
      console.log(err);
    });
} catch (err) {
  console.log(err);
}

const seedDB = seedObjects();

function seedObjects() {
  const seedObjects = [];

  /**
   * je génère 50 objets, j'héstime ne pas avoir besoin de plus
   * 
   * la syntax de faker est simple: faker.valeurDeChoix.desReglesSupplementaires
   */
  for (let i = 0; i < 50; i++) {
    seedObjects.push({
      addedBy: faker.name.fullName(),
      object: faker.commerce.productAdjective(),
      details: faker.lorem.sentence(Math.floor(Math.random() * 100)),
      category: faker.random.word(),
      where: faker.address.city(),
      when: setDate(),
      pattern: faker.lorem.word(),
      size: setSize(),
      colours: setColours(),
    });
  }

  return seedObjects;
}

//Pour la date, je garde le format américain tout en enlevant les information inutiles avec substring
function setDate() {
  let date = faker.date.between("2022-01-01", "2022-12-26")
  date = JSON.stringify(date);

  return date.substring(1,11);
}


//Pour le choix des tailles, je limite à quatre chois de manière aléatoire
function setSize() {
  let sizes = ["petit", "moyen", "grand", "énorme"];
  let size = sizes[Math.floor(Math.random() * 4)];
  return size;
}

/**
 * Les utilisateurs pourront donner jusqu'à trois couleurs
 */
function setColours() {
  let arr = [
    "blanc",
    "noir",
    "rouge",
    "bleu",
    "vert",
    "jaune",
    "orange",
    "violet",
    "rose",
    "marron",
  ];

  //la première étape consiste à replacer aléatoirement les couleurs dans l'array grâce à l'algorithme de Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

/**
  * colours prendra alors jusqu'à trois couleurs différentes. slice() permet en effet de sélectionner les
  * n premier élèments de 'arr' où n est déterminé par random 
 */  
  let [colours, rand] = [[], Math.floor(Math.random() * 3)+1];
  colours = arr.slice(0, rand);

  return colours;
}
