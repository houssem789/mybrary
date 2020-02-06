const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
//Manage file creatng on the server
//var multer = require("multer");
var fs = require("fs");

//require the library that give us possiblity to work with path
const path = require("path");
//const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
/*const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});*/

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

//Route for book show
// Show Book Route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

//Route for edit book
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
    /*const book = await Book.findById(req.params.id);
    res.render("authors/edit", { book: book });*/
  } catch {
    res.redirect("/authors");
  }
});

//Post book + making our route acept a file and this file has a name called cover
router.post("/", async (req, res) => {
  // router.post("/", upload.single("cover"), async (req, res) => {
  //const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
    //coverImageName: fileName
  });

  //Save cover in db , format base 64 => filePond
  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`);
  } catch (error) {
    /*if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }*/
    renderNewPage(res, book, true);
  }

  //Use muter library to actually create the file on the server
});

// Update Book Route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    //if value changes --> needs to update cover
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    // ona put recuperer le Book mais il y'a eu un probleme au moenet de l'enregistrement
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

// Delete Book Page
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book"
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

//this function will removeBook cover f there is a problem when file
//beiing uploaded

/*function removeBookCover(fileName) {
  console.log(path);
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}*/

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);

  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
