const { Client } = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store"
);

async function createTables() {
  const SQL = `
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS products;

  CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) UNIQUE NOT NULL
  );

  CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
    
  );

  CREATE TABLE favorites (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    CONSTRAINT favorite UNIQUE(product_id, user_id)
  );


    
    `;
  await client.query(SQL);
}

async function createUser(username, password) {
  const SQL = ` 
  INSERT INTO users(id, username, password)
  VALUES ($1, $2, $3)
  returning *;
    `;
  const hash = await bcrypt.hash(password, 5);
  const response = await client.query(SQL, [uuid.v4(), username, hash]);
  return response.rows[0];
}
async function createProduct(name) {
  const SQL = `
  INSERT INTO products(id, name)
  VALUES($1, $2)
  returning *;
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
}

async function fetchUsers() {
  const SQL = `
    SELECT id, username FROM users;
    `;
  const response = await client.query(SQL);
  return response.rows;
}
async function fetchProducts() {
  const SQL = `
      SELECT * FROM products;
      `;
  const response = await client.query(SQL);
  return response.rows;
}

async function createFavorite(user_id, product_id) {
  const SQL = `
    INSERT INTO favorites(id, user_id, product_id)
    VALUES ($1, $2, $3);
    `;
  await client.query(SQL, [uuid.v4(), user_id, product_id]);
}

async function fetchFavorites(id) {
  const SQL = `
    SELECT products.name
    FROM favorites
    JOIN products ON favorites.product_id = products.id
    WHERE favorites.user_id = $1;
    `;
  const response = await client.query(SQL, [id]);
  return response.rows;
}

async function destroyProduct(id) {
  const SQL = `
    DELETE FROM products
    WHERE id = $1;
    `;
  await client.query(SQL, [id]);
}
async function destroyFavorite(product_id, user_id) {
  const SQL = `
      DELETE FROM favorites
      WHERE product_id = $1 AND user_id = $2;
      `;
  await client.query(SQL, [product_id, user_id]);
}
module.exports = {
  client,
  createProduct,
  createFavorite,
  createTables,
  createUser,
  destroyProduct,
  destroyFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
};
