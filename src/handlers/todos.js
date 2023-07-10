const Express = require('express');
const getDBHandler = require('../db/index.js').default;

const ToDosRequestHandler = Express.Router();

ToDosRequestHandler.post("/to-dos", async (request, response) => {
  try {
    const { title, description, isDone: is_done } = request.body;
    const dbHandler = await getDBHandler();

    const newTodo = await dbHandler.run(`
        INSERT INTO todos (title, description, is_done)
        VALUES (
            '${title}',
            '${description}',
            ${is_done}
        )
    `);

    await dbHandler.close();

    response.send({ newTodo: { title, description, is_done, ...newTodo } });
  } catch (error) {
    response.status(500).send({
      error: `Something went wrong when trying to create a new to do`,
      errorInfo: error.message,
    });
  }
});

ToDosRequestHandler.get("/to-dos", async (request, response) => {
  try {
    const dbHandler = await getDBHandler();

    const todos = await dbHandler.all("SELECT * FROM todos");
    await dbHandler.close();

    if (!todos || !todos.length) {
      return response.status(404).send({ message: "To Dos Not Found" });
    }

    response.send({ todos });
  } catch (error) {
    response.status(500).send({
      error: `Something went wrong when trying to get the to dos`,
      errorInfo: error.message,
    });
  }
});

ToDosRequestHandler.delete("/to-dos/:id", async (request, response) => { //la ponemos asíncrona para que retorne algo con el tiempo
  try {
    const todoId = request.params.id;
    const dbHandler = await getDBHandler();

    const deletedTodo = await dbHandler.run(
      "DELETE FROM todos WHERE id = ?",
      todoId
    );

    await dbHandler.close();

    response.send({ todoRemoved: { ...deletedTodo } });
  } catch (error) {
    response.status(500).send({
      error: `Something went wrong when trying to delete the to do`,
      errorInfo: error.message,
    });
  }
});

//Challenge: realizar el update
ToDosRequestHandler.patch("/to-dos/:id", async (request, response) => {
  //redacta el try - catch
  try { 
    const todoId = request.params.id; //el usuario hará cambios desde el body
    const { title, description, isDone: is_done } = request.body;
    const dbHandler = await getDBHandler();
    //estos son los inputs del usuario en la base de datos

    const todoToUpdate = await dbHandler.get( //hay que llamar un get
      `SELECT * FROM todos WHERE id = ?`,
      todoId
    );

    let isDone = is_done ? 1 : 0;
    
    //Aquí hay que definir lo que debe correr el API
    await dbHandler.run(
      `UPDATE todos SET title = ?, description = ?, is_done = ? 
      WHERE id = ?`,
      title || todoToUpdate.title, 
      description || todoToUpdate.description, 
      isDone, todoId || todoToUpdate.id
    );

    await dbHandler.close();

    //Aquí enviamos el dato para ver
    response.send({
      todoUpdated: { ...todoToUpdate, title, description, is_done }
    });
  } catch (error) {
    response.status(500).send({
      error: `Something went wrong when trying to update the to dos`,
      errorInfo: error.message,
    });
  }
});
    
module.exports = ToDosRequestHandler; 