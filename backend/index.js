import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { User } from "./model/user.model.js"
import { Todo } from './model/toDo.model.js';
import { HealthRecord } from './model/healthrecord.model.js';
import { DoctorVisit } from './model/doctorvisit.model.js';
import fileUpload from 'express-fileupload';
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import axios from "axios"
import {OpenAI} from "openai"


dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/auth/google/callback";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

app.get('/events', async (req, res) => {
  const access_token = req.headers.authorization;
  console.log("Access Token Received:", access_token);

  if (!access_token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          maxResults: 10, 
          orderBy: 'startTime',
          singleEvents: true,
          timeMin: new Date().toISOString(), 
        },
      }
    );

    res.status(200).json(response.data.items);
  } catch (error) {
    console.error('Error fetching calendar events:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});




app.post('/create-event', async (req, res) => {
  const { accessToken, summary, description, startTime, endTime, attendees } = req.body;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary,
        description,
        start: {
          dateTime: `${startTime}:00`,
          timeZone: 'Asia/Kolkata', 
        },
        end: {
          dateTime: `${endTime}:00`, 
          timeZone: 'Asia/Kolkata',
        },
        attendees: attendees.map((email) => ({ email })),
        guestsCanInviteOthers: true,
        guestsCanModify: true,
      },
      sendUpdates: 'all',
    });

    res.json(event.data);
  } catch (error) {
    console.error('Failed to create event:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Get all health records and visits
app.get('/health', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  try {
    console.log(userId)
    const records = await HealthRecord.find({ userId });
    const visits = await DoctorVisit.find({ userId });

    res.json({ records, visits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new health record
app.post('/health/records', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  try {
    const record = new HealthRecord({ ...req.body, userId });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a health record
app.delete('/health/records/:id', async (req, res) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new doctor visit
app.post('/health/visits', async (req, res) => {
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  try {
    const visit = new DoctorVisit({ ...req.body, userId });
    await visit.save();
    res.status(201).json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a doctor visit
app.delete('/health/visits/:id', async (req, res) => {
  try {
    await DoctorVisit.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Assistant
let pendingUpdateRequest = {};
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
  const authHeader = req.headers.authorization; 


//For re responses  
if (pendingUpdateRequest[userId]) {
  const { matchingTodos, updateDetails, action } = pendingUpdateRequest[userId];

    const selectedTodo = matchingTodos.find((todo) => todo.text.toLowerCase() === message.toLowerCase());
  
    if (!selectedTodo) {
      return res.json({
        reply: `Invalid selection. Please choose from: ${matchingTodos.map((t) => t.text).join(', ')}`,
      });
    }
  
    let responseMessage;
  
    if (action === 'updatetodo') {
      const updateFields = {};
      if (updateDetails.newText !== undefined) updateFields.text = updateDetails.newText;
      if (updateDetails.completed !== undefined) updateFields.completed = updateDetails.completed;
      console.log(selectedTodo._id,updateFields)
      const updatedTodo = await Todo.findByIdAndUpdate(selectedTodo._id, updateFields, { new: true });
      responseMessage = `Todo updated: "${updatedTodo.text}"`;
    } else if (action === 'deletetodo') {
      await Todo.findByIdAndDelete(selectedTodo._id);
      responseMessage = `Deleted todo: "${selectedTodo.text}"`;
    }else{
      responseMessage="Sorry try again"
    }
  
    delete pendingUpdateRequest[userId];
  
    return res.json({ reply: responseMessage });
  }
  

  const gptPrompt = `You are a friendly and helpful assistant that can do two main things:
1. Helpful assistant that extracts user intent and required details from messages related to a to-do list, health records,
 and other personal tasks
2. Engage in casual, friendly conversations when the user is not asking for a specific task.

Your output should still ALWAYS be a valid JSON object, using one of these formats:

1. Add Todo:
   { "intent": "add_todo", "text": "Buy groceries" }

2. Update Todo:
   For marking a todo as completed:
   { "intent": "update_todo", "oldText": "Pay electricity bill", "completed": true }

   For changing the todo text:
   { "intent": "update_todo", "oldText": "Pay electricity bill", "newText": "Pay electricity bill on 23rd Feb" }

   For updating both text and completion status:
   { "intent": "update_todo", "oldText": "Pay electricity bill", "newText": "Pay electricity bill on 23rd Feb", "completed": true }

3. Delete Todo:
   { "intent": "delete_todo", "text": "Call the doctor" }

4. Show Health Records:
   { "intent": "show_health_records" }
  
5. Clarify:
   { "intent": "clarify", "question": "There are multiple todos containing 'meeting'. Which one would you like to update or delete?" }

6. Small Talk:(e.g., 'Hi', 'what can you do?', 'What's up?'):
   { "intent": "small_talk", "response": "Hello! What can I help you with today Add task, quick reply to mails , schedule a meeting..." }


Ensure valid JSON at all times.
If unsure, default to:
{ "intent": "casual_chat", "reply": "I'm not sure, but I'm here to help!" }

Guidelines:
- Always ensure the output is a valid JSON object.
- If the user wants to mark a task as done, set "completed": true.
- If the user wants to change the text of a task, provide both "oldText" and "newText".
- If both completion status and text change are mentioned, provide both fields.
- If there is ambiguity (e.g., multiple matching tasks), return { "intent": "clarify", "question": "Your clarification question here" }.
- If the intent is unclear, output { "intent": "unknown" }.
`;

  try {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        { role: 'system', content: gptPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });
    console.log(gptResponse.choices[0].message.content)
    const { intent,oldText, newText, completed, text, date, time, recordId,response,reply } = gptResponse.choices[0].message.content
      ? JSON.parse(gptResponse.choices[0].message.content)
      : {};

    console.log(`Detected Intent: ${intent}`, { text, date, time, recordId,oldText, newText, completed });


    let responseMessage;

    switch (intent) {
      case 'add_todo':
        const newTodo = new Todo({ userId, text, completed: false });
        await newTodo.save();
        responseMessage = `Todo added: "${text}"`;
        break;

      case 'update_todo':
          const matchingTodos = await Todo.find({
            userId,
            text: { $regex: oldText, $options: 'i' },
          });
  
          if (matchingTodos.length === 0) {
            responseMessage = `No matching todo found for "${oldText}".`;
          } else if (matchingTodos.length === 1) {
            const updateFields = {};
            if (newText !== undefined) updateFields.text = newText;
            if (completed !== undefined) updateFields.completed = completed;
  
            const updatedTodo = await Todo.findByIdAndUpdate(matchingTodos[0]._id, updateFields, { new: true });
  
            responseMessage = `Todo updated: "${updatedTodo.text}"`;
          } else {
            pendingUpdateRequest[userId] = {
              matchingTodos,
              updateDetails: { newText, completed },
              action:"updatetodo"
            };
  
            responseMessage = `There are multiple todos matching "${oldText}". Which one would you like to update?\nMatches: ${matchingTodos.map((t) => t.text).join(', ')}`;
          }
          break; 
        

      case 'clarify':
            responseMessage = `Clarification needed: ${question}`;
            break;    

      case 'delete_todo':
              const matchingTodosToDelete = await Todo.find({
                userId,
                text: { $regex: text, $options: 'i' },
              });
            
              if (matchingTodosToDelete.length === 0) {
                responseMessage = `No matching todo found for "${text}".`;
              } else if (matchingTodosToDelete.length === 1) {
                await Todo.findByIdAndDelete(matchingTodosToDelete[0]._id);
                responseMessage = `Deleted todo: "${matchingTodosToDelete[0].text}"`;
              } else {
                pendingUpdateRequest[userId] = {
                  matchingTodos: matchingTodosToDelete,
                  action: 'deletetodo',
                };
            
                const matches = matchingTodosToDelete.map((todo) => todo.text).join(', ');
                responseMessage = `There are multiple todos matching "${text}". Which one would you like to delete?\nMatches: ${matches}`;
              }
              break;

      case 'show_health_records':
        const records = await HealthRecord.find({ userId });
        const visits = await DoctorVisit.find({ userId });
        responseMessage = `Your health records: ${JSON.stringify({ records, visits })}`;
        break;

      case 'delete_health_record':
        await HealthRecord.findByIdAndDelete(recordId);
        responseMessage = `Deleted health record with ID: ${recordId}`;
        break;

      case 'schedule_meeting':
        const { access_token } = req.headers;
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        oauth2Client.setCredentials({ access_token });

        const event = await calendar.events.insert({
          calendarId: 'primary',
          resource: {
            summary: text, 
            start: { dateTime: `${date}T${time}:00`, timeZone: 'Asia/Kolkata' },
            end: { dateTime: `${date}T${time}:30`, timeZone: 'Asia/Kolkata' },
          },
        });

        responseMessage = `Meeting scheduled: "${text}" on ${date} at ${time}`;
        break;

      case 'small_talk':
          responseMessage = response || "Hello!";
          break;
 
          
          default:
            try {
              const generalGptResponse = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-1106',
                messages: [
                  { role: 'system', content: 'You are a general assistant answering any kind of questions.' },
                  { role: 'user', content: message },
                ],
                max_tokens: 100,
              });
        
              responseMessage = generalGptResponse.choices[0].message.content.trim();
            } catch (generalError) {
              console.error('General GPT fallback error:', generalError);
              responseMessage = "I couldn't understand that. Can you try rephrasing?";
            }
    }

   
    res.json({ reply: responseMessage });
  } catch (error) {
    console.error('Chat action error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


app.listen(port, () => {
    console.log(`Server is running on ${port}`)
  })