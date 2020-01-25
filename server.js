//Load envariement variable db user name .. parameters ..
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  //test
}

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
//Connexion a la base de donnees
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("Connected to mongoose"));

app.set("view engine", "ejs");

//ca va charger tous les fichier de views
app.set("views", __dirname + "/views");

// ca va s'occuper du header/footer qui ce repete
app.set("layout", "layouts/layout");

app.use(expressLayouts);
//specifiy public files , styles.css ...
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

app.use("/", indexRouter);
app.use("/authors", authorRouter);

//soit il va se basser sur fichier .env , soit il va regarder le port 3000
app.listen(process.env.PORT || 3000);
