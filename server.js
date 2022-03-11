const express = require('express');
const routes = require('./vandy_bc_2022_eCommerce_chlng-13/Develop/routes');
const sequelize = require('./config/connection');

// import sequelize connection
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// sync sequelize models to the database, then turn on the server
sequelize.sync({ force: false }).then(() => { 
  app.listen(PORT, () => 
  console.log(`App listening on port ${PORT}!`));
});
