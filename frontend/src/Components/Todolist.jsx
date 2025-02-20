import React, { useState, useEffect } from "react";
import axios from "axios";
import dummyData from "../assets/dummydata.json";

const TodoList = ({ user,rerenderSection }) => {
  let [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  useEffect(() => {
    if (!user) {
      setTasks(dummyData.tasks);
      return;
    }
  
    if (rerenderSection === null || rerenderSection?.includes('todo')) {
      axios
        .get("http://localhost:4001/todos", {
          headers: {
            Authorization: user.token,
          },
        })
        .then((response) => {
          console.log(response.data);
          setTasks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching todos:", error);
        });
    }
  }, [user, rerenderSection]);
  

  // Add a new task
  const addTask = () => {
    if (newTask.trim() === "") return;
  console.log(newTask)
    axios
      .post(
        "http://localhost:4001/todos",
        { text: newTask },
        {
          headers: { Authorization: user.token },
        }
      )
      .then((response) => {
        setTasks([...tasks, response.data]); // Append new task
        setNewTask("");
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  // Start editing a task
  const startEditing = (taskId, currentName) => {
    setEditingTask(taskId);
    setEditedTaskName(currentName);
  };

  // Save the edited task
  const saveEdit = (taskId) => {
    if (editedTaskName.trim() === "") return;

    axios
      .put(
        `http://localhost:4001/todos/${taskId}`,
        { text: editedTaskName },
        {
          headers: { Authorization: user.token },
        }
      )
      .then((response) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? response.data : task
          )
        );
        setEditingTask(null);
        setEditedTaskName("");
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  // Mark a task as completed
  const toggleComplete = (taskId) => {
    axios
      .put(
        `http://localhost:4001/todos/${taskId}`,
        { completed: true },
        {
          headers: { Authorization: user.token },
        }
      )
      .then((response) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? response.data : task
          )
        );
      })
      .catch((error) => console.error("Error marking task as complete:", error));
  };

  // Delete a task
  const deleteTask = (taskId) => {
    axios
      .delete(`http://localhost:4001/todos/${taskId}`, {
        headers: { Authorization: user.token },
      })
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">To-Do List</h2>

      {/* Add Task Input */}
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 flex-1"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
          onClick={addTask}
        >
          Add
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task._id} className="flex justify-between items-center p-2 border-b">
            {editingTask === task._id ? (
              <input
                type="text"
                className="border p-1 flex-1"
                value={editedTaskName}
                onChange={(e) => setEditedTaskName(e.target.value)}
              />
            ) : (
              <span
                className={`flex-1 text-start ${task.completed ? "line-through" : ""}`}
                onClick={() => startEditing(task._id, task.text)}
              >
                {task.text}
              </span>
            )}
            <div>
              {editingTask === task._id ? (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => saveEdit(task._id)}
                >
                  ✔
                </button>
              ) : (
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => toggleComplete(task._id)}
                >
                  ✓
                </button>
              )}
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => deleteTask(task._id)}
              >
                ✖
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { TodoList };
export default TodoList;
