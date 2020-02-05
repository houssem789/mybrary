const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

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
//Route for author show
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    console.log(author);
    const books = await Book.find({ author: author.id })
      .limit(6)
      .exec();
    console.log(books);

    res.render("authors/show", {
      author: author,
      booksByAuthor: books
    });
  } catch {
    res.redirect("/");
  }
});
//Route for edit author
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

//From the browser there is now whey to say
// ===> put or Delete
//==> install overrride
//Route for edit author
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author"
      });
    }
  }
});

//Route for delete author
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
