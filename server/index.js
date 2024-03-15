const express = require("express");
const app = express();

const {
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
} = require("./db");

app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    res.send(await createFavorite(req.params.userId, req.params.id));
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});
// fix
app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite(req.params.id, req.params.userId);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});
const init = async () => {
  client.connect();
  await createTables();
  const [Jordan, Chris, Tony, xbox, playstation, pc, nintendo] =
    await Promise.all([
      createUser("Jordan", "codingiscool1"),
      createUser("Chris", "codingiscool12"),
      createUser("Tony", "codingiscool13"),
      createProduct("xbox"),
      createProduct("playstation"),
      createProduct("pc"),
      createProduct("nintendo"),
    ]);
  await Promise.all([
    createFavorite(Jordan.id, xbox.id),
    createFavorite(Jordan.id, playstation.id),
    createFavorite(Jordan.id, pc.id),
    createFavorite(Chris.id, xbox.id),
    createFavorite(Chris.id, pc.id),
    createFavorite(Tony.id, nintendo.id),
  ]);
  await destroyFavorite(nintendo.id);
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

init();
