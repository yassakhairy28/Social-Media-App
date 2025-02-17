import express from "express";
import bootstrap from "./src/app.controller.js";
const app = express();
const port = process.env.PORT;

await bootstrap(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
