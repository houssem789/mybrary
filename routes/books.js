const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
//Manage file creatng on the server
var multer = require("multer");
var fs = require("fs");

//require the library that give us possiblity to work with path
const path = require("path");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});

//All books route + filter
router.get("/", async (req, res) => {
  //Check params sent in post
  let query = Book.find({});
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    console.log(books);
    res.render("books/index", {
      books: books,
      searchOptions: req.query
    });
  } catch (error) {
    res.redirect("/");
  }
});

//New book display form
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//Post book + making our route acept a file and this file has a name called cover
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImageName: fileName
  });

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`);
  } catch (error) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }

  //Use muter library to actually create the file on the server
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) params.errorMessage = "Error Creating Book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

//this function will removeBook cover f there is a problem when file
//beiing uploaded

function removeBookCover(fileName) {
  console.log(path);
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}

module.exports = router;
