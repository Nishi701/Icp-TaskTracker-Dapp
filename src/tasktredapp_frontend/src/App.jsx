import React, { useState, useEffect } from "react";
import { tasktredapp_backend } from "declarations/tasktredapp_backend";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);    // Track which task is being edited
  const [editingTitle, setEditingTitle] = useState(""); // Store the new title while editing

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const all = await tasktredapp_backend.get_tasks();
      setTasks(all);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;

    const task = {
      id: BigInt(Date.now()),
      title,
      done: false,
    };

    try {
      await tasktredapp_backend.add_task(task);
      setTitle("");
      loadTasks();
    } catch (error) {
      console.error("Error calling add_task:", error);
    }
  };

  const completeTask = async (id) => {
    try {
      await tasktredapp_backend.complete_task(id);
      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasktredapp_backend.remove_task(id);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Update task title handler
  const updateTask = async (id) => {
    if (!editingTitle.trim()) return;

    try {
      // Call backend update, assuming it takes (id, title, done)
      await tasktredapp_backend.update_task(id, editingTitle, false);
      setEditingId(null);
      setEditingTitle("");
      loadTasks();
    } catch (error) {
      console.error(" Error updating task:", error);
    }
  };

  return (
    <div className="container">
      <h1> Task Tracker DApp</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <button onClick={() => updateTask(task.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {task.title}
                <div>
                  {!task.done && (
                    <button onClick={() => completeTask(task.id)}>Done</button>
                  )}
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditingTitle(task.title);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
