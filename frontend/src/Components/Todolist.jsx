import React, { useState, useEffect } from "react";
import axios from "axios";
import dummyData from "../assets/dummydata.json"

const TodoList = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDate, setTaskDate] = useState("");

  useEffect(() => {
    if (user) {
      axios.get(`/api/tasks?userId=${user.id}`).then((response) => {
        setTasks(response.data);
      });
    } else {
      setTasks(dummyData.tasks);
    }
  }, [user]);

  const addTask = () => {
    if (newTask.trim() === "" || taskDate.trim() === "") return;
    const task = {
      name: newTask,
      completed: false,
      date: taskDate,
      userId: user?.id,
    };
    axios.post("/api/tasks", task).then((response) => {
      setTasks([...tasks, response.data]);
      setNewTask("");
      setTaskDate("");
    });
  };

  const toggleComplete = (taskId) => {
    const updatedTask = tasks.find((task) => task.id === taskId);
    axios.patch(`/api/tasks/${taskId}`, { completed: !updatedTask.completed }).then(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    });
  };

  const deleteTask = (taskId) => {
    axios.delete(`/api/tasks/${taskId}`).then(() => {
      setTasks(tasks.filter((task) => task.id !== taskId));
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">To-Do List</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Task Name"
          className="border rounded p-2 w-full"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input
          type="date"
          className="border rounded p-2"
          value={taskDate}
          onChange={(e) => setTaskDate(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white rounded px-4 py-2"
          onClick={addTask}
        >
          Add
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex justify-between p-2 border-b ${
              task.completed ? "text-gray-400 opacity-50" : ""
            }`}
          >
            <span>{task.name} - {task.date}</span>
            <div>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                onClick={() => toggleComplete(task.id)}
              >
                {task.completed ? "Undo" : "Complete"}
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
