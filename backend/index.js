import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { User } from "./model/user.model.js"
import { Todo } from './model/toDo.model.js';
import fileUpload from 'express-fileupload';
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import axios from "axios"

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser())
app.use(fileUpload({useTempFiles: true,tempFileDir: "/tmp/",}));
const port = process.env.port|| 10000

//Connecting to DB
try {
    mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to DB")
} catch (error) {
    console.log(error)
}

// User Registration
app.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    console.log(req.body);
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user)
  if (user && (await bcryptjs.compare(password, user.password))) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token,userid:user._id, name: user.name });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

// Get Todos
app.get('/todos', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  const todos = await Todo.find({ userId });
  res.json(todos);
});

// Add Todo
app.post('/todos', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  const todo = new Todo({ userId, text: req.body.text, completed: false });
  await todo.save();
  res.json(todo);
});

// Update Todo
app.put('/todos/:id', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  
 
  const updateFields = {};
  if (req.body.text !== undefined) updateFields.text = req.body.text;
  if (req.body.completed !== undefined) updateFields.completed = req.body.completed;

  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId },
    updateFields,
    { new: true }
  );
  console.log(todo)
  res.json(todo);
});


// Delete Todo
app.delete('/todos/:id', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  await Todo.findOneAndDelete({ _id: req.params.id, userId });
  res.json({ message: 'Todo deleted' });
});

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    res.json({ user: payload, access_token: token });
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
});

app.get("/emails", async (req, res) => {
  const auth = new google.auth.OAuth2();
  console.log("Access Token Sent:", req.headers.authorization);
  auth.setCredentials({ access_token: req.headers.authorization });
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = response.data.messages || [];
    const emailDetails = [];

    for (let msg of messages) {
      let message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      emailDetails.push(message.data);
    }
    res.json(emailDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.post("/send-email", async (req, res) => {
//   const { to, subject, message, access_token } = req.body;
//   // console.log(to,subject,message,access_token)
//   const auth = new google.auth.OAuth2();
//   auth.setCredentials({ access_token : access_token});

//   const gmail = google.gmail({ version: "v1", auth });

//   const email = `
//     To: ${to}
//     Subject: ${subject}

//     ${message}
//   `;
//   console.log(email)
//   const encodedMessage = Buffer.from(email).toString("base64");

//   try {
//     await gmail.users.messages.send({
//       userId: "me",
//       requestBody: { raw: encodedMessage },
//     });

//     res.json({ success: true });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, message, access_token,inReplyTo, references,threadId } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Recipient address required" });
    }

    const rawEmail = [
      `To: ${to}`,
      "From: your-email@gmail.com",
      `Subject: ${subject}`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : "",
      references ? `References: ${references}` : "",
      "",
      message,
    ].join("\n");

    const encodedEmail = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

      const emailPayload = { raw: encodedEmail };
      if (threadId) {
        emailPayload.threadId = threadId; 
      }

      const response = await axios.post(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        emailPayload,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

    res.json({ message: "Email sent successfully", response: response.data });
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});


app.listen(port, () => {
    console.log(`Server is running on ${port}`)
  })