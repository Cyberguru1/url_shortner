#!/bin/bash node

//************************************|
// Implementation of url shortner     |
//       @cyb3rguru                   |
//************************************|


const { nanoid } = require("nanoid");
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const app = express();
const genHash = require("./utils")

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

// reading env variables
require('dotenv').config();

// setting up db
const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');

urls.createIndex({ slug: 1 }, { unique: true });

app.use(session(
  {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: "none", httpOnly: false }
  }))

const corsOptions = {
  origin: 'http://localhost:8081',
  credentials: true,
};

app.use(cors(corsOptions));

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? "err" : error.stack,
  })
})


// schema handler
const schema = yup.object().shape({
  slug: yup.string().trim().matches(/[a-zA-Z0-9_-]/i),
  url: yup.string().trim().url().required(),
})


app.get('/:id', async (req, res) => {

  // redirect to url
  const { id: slug } = req.params;
  console.log(req.session);
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
      return;
    } else {
      res.json({
        message: `Link with id ${slug} expired`,
      });
      return;
    }
  } catch (error) {
    res.json({
      message: `Link with id ${slug} expired`,
    });
    return;
  }
})

app.get('/', async (req, res) => {

  // get the current id 
  iden = req.session.Identifier;

  try {
    const url = await urls.findOne({ iden });
    if (iden) {
      baseUrl = `${req.protocol}://${req.get('host')}`;
      res.json({
        "Current_Url": `${baseUrl}/${url.slug}`
      });
      return;
    } else {
      res.json({
        message: `Create new`,
      });
      return;
    }
  } catch (error) {
    res.json({
      message: `Create new`,
    });
    return;
  }
})

app.post('/url', async (req, res, next) => {

  let { slug, url } = req.body;
  // set session identifier
  iden = genHash(8);
  req.session.Identifier = iden;

  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      const exist2 = await urls.findOne({ url });
      if (exist2) {
        await urls.remove({ url })
      }
      slug = nanoid(9).toLowerCase();

    } else {
      const exist1 = await urls.findOne({ slug });
      if (exist1) {
        throw new Error("Slug in use...!!!");
      }
    }
    var createdAt = new Date()
    const newUrl = {
      url,
      slug,
      createdAt,
      iden,
    };
    const created = await urls.insert(newUrl);
    res.json(newUrl);
  } catch (error) {
    next(error);
  }
});



const port = process.env.PORT || 8081
const duration = process.env.DURATION || 24

// Set the time threshold in milliseconds
const timeThreshold = duration * 60 * 60 * 1000;

// Function to delete documents older than the time threshold
const deleteExpiredUrls = async () => {
  try {
    const currentTime = new Date();
    const thresholdTime = new Date(currentTime - timeThreshold);

    // Find and delete documents older than the threshold time
    const result = await urls.remove({
      createdAt: { $lt: thresholdTime }
    });
    console.log(`${result.deletedCount} documents deleted.`);
  } catch (err) {
    console.error('Error deleting old documents:', err);
  }
};

// Worker process to delete link every 12 hours
const intervalInMilliseconds = (duration / 2) * 60 * 60 * 1000; // 12 hours in milliseconds
setInterval(deleteExpiredUrls, intervalInMilliseconds);



app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

