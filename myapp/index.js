//--------SQL INSTALL THIRD Party Command-------------
//let watch (Dependencies) in .json file and install
//npm install
//npm install sqlite --save
//npm install sqlite3 --save

//--server restart one by one manually then use third party (NODEMON) save data and restart automatically
//npm install -g nodemon
//nodemon index.js

//----------SQLite Database Initialization-------------
const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json()); //--request .json for [create and update] new Book its necessary

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//-------Get ==All== Books API---use db.all()----------
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//------Get ==Single== Book API---use db.get()--------
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const getBookQuery = `
    SELECT * FROM book
    WHERE book_id = ${bookId}`;

  let book = await db.get(getBookQuery);

  response.send(book);
});

//-----Add == Create New Book== API---use db.run()-----
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;

  //console.log(bookDetails);

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);

  //console.log(dbResponse);

  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

//-----Update == Book Detail Modify== API---use db.run()-----
app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;

  const bookDetails = request.body;

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//-----Delete == Book Remove== API---use db.run()-----
app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM book
    WHERE book_id = ${bookId};
    `;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully ");
});

//-----Get == Multiple Author Book == API ----use db.all()-----
app.get("/authors/:authorId/books", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBookQuery = `
    SELECT * FROM book
    WHERE author_id = ${authorId};
    `;
  const bookArray = await db.all(getAuthorBookQuery);
  response.send(bookArray);
});
