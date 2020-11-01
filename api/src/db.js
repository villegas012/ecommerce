require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST,
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/development`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product } = sequelize.models;
const { Category } = sequelize.models;
const { User } = sequelize.models;
const { Order } = sequelize.models;
const { Review } = sequelize.models;
const { Adress } = sequelize.models;
const { UserDisabled } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Product.belongsToMany(Category, {
  through: 'productocategoria'
});

Category.belongsToMany(Product, {
  through: 'productocategoria'
});


const cart = sequelize.define('cart', {
  price: DataTypes.FLOAT,
  amount: DataTypes.INTEGER
}, { timestamps: false });
Order.belongsToMany(Product, { through: cart });

Product.belongsToMany(Order, { through: cart });


User.hasMany(Order, {
  foreignKey: 'userId'
});


Product.hasMany(Review, {
  foreignKey: 'productId'
});


User.hasMany(Adress, {
  foreignKey: 'userId'
});

Order.belongsTo(Adress, {
  foreignKey: 'adressId'
})

User.hasMany(UserDisabled,{
  foreignKey: "userId"
})

Product.belongsToMany(User, {
  through: 'favorite'
});

User.belongsToMany(Product, {
  through: 'favorite'
});


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
