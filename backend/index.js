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



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
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



app.listen(port, () => {
    console.log(`Server is running on ${port}`)
  })