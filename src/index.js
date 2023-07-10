const cors = require('cors');
const express = require('express');
const {initDB} = require('./db');
const ToDosRequestHandler = require('./handlers/todos.js');

const Api = express();

Api.use(express.json());
Api.use(express.urlencoded({ extended: false }));

Api.use(cors());
Api.use("/v1", ToDosRequestHandler);

Api.listen(3000, () => {
  console.log("API IS RUNNING");
  initDB().then(() => {
    console.log("DB IS READY");
  });
});