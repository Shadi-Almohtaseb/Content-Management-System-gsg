import "./config.js"
import "express-async-errors";
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import indexRouter from './src/routes/index.js'
import usersRouter from './src/routes/user.js'
import shopsRouter from './src/routes/shop.js'
import productsRouter from './src/routes/product.js'
import tagsRouter from './src/routes/tag.js'
import categoriesRouter from './src/routes/category.js'
import dataSource from './src/db/dataSource.js'
import { DefaultErrorHandler, customErrorHandler, notFoundHandler } from "./src/middleware/errorHandlers.js";
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shops', shopsRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/tags', tagsRouter);

// catch 404 and forward to error handler
app.use(notFoundHandler)

// Custom Error handler middleware
app.use(customErrorHandler)

// Default error handler
app.use(DefaultErrorHandler)

// Connect to DB
dataSource.initialize().then(() => {
  console.log("Connected to DB!");
}).catch(err => {
  console.error('Failed to connect to DB: ' + err);
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT} and host http://localhost:${PORT}`);
});


export default app;
