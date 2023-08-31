const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();

  if(bookInstance==null) {
    const err = new Error("Book Copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_instance_detail", {
    title: "Book",
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).exec()

  if (bookInstance == null) {
    res.redirect("/catalog/bookinstances");
  }

  res.render("book_instance_delete", {
    title: "Book Instance Delete",
    book_instance: bookInstance,
  });
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).exec()

  await BookInstance.findByIdAndRemove(req.body.book_instanceid);
  res.redirect("/catalog/bookinstances");
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, allbooks] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().exec(),
  ]);

  if (bookInstance === null) {
    const errors = new Error("Book instance not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: allbooks,
    selected_books: bookInstance.book._id,
    bookinstance: bookInstance,
  });
});

exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      id: req.params.id,
    });

    if(!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
      res.redirect(updatedBookInstance.url);
    }
  }),
]
