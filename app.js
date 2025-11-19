if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js"); // Import booking routes

// const { Cookie } = require("express-session");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("ERROR: ATLASDB_URL environment variable is not set!");
  process.exit(1);
}

// MongoDB connection options for Atlas
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority',
};

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    // Don't exit in production - let the app try to reconnect
    if (process.env.NODE_ENV === "production") {
      console.log("App will continue running and attempt to reconnect...");
    } else {
      process.exit(1);
    }
  });

async function main() {
  try {
    await mongoose.connect(dbUrl, mongooseOptions);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Serve favicon for RentScape
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'RentScape-logo.ico'));
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 360,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to check database connection
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    console.warn(`Database connection state: ${mongoose.connection.readyState}`);
  }
  next();
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null; // Ensure currUser is always defined
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/booking", bookingRouter); // Route for booking-related actions
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// app.use((err, req, res, next) =>{
//     let {statusCode= 500, message = "Something went wrong!"} = err;
//     res.status(statusCode).render("error.ejs", {message});
//     // res.status(statusCode).send(message);
// });

app.use((err, req, res, next) => {
  console.error("Error occurred:", err);
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
