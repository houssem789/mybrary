const express = require("express");
const router = express.Router();
const Author = require("../models/author");

//All othors route
router.get("/", async (req, res) => {
  let searchOption = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("authors/index", {
      authors: authors,
      searchOption: req.query
    });
  } catch {
    res.render("/");
  }
});

//New author display form
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

//Post author
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors`);
    //res.redirect(`authors/${newAuthor.id}`);
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "error when author creation"
    });
  }

  /*author.save((err, newAuthor) => {
    if (err) {
      res.render("authors/new", {
        author: author,
        errorMessage: "Error creating Author"
      });
    } else {
      res.redirect(`authors`);
    }
  });*/
});

module.exports = router;
