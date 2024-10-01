"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/authContext";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function Todo() {
  const { user } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]); // State for todos
  const [task, setTask] = useState(""); // State for the input task
  const [isEditing, setIsEditing] = useState(false); // To track if we're editing
  const [editId, setEditId] = useState(null); // To track the Firestore document ID

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchTodos(); // Fetch todos when the user is logged in
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "todos"));
      const todosList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Get the document ID
        ...doc.data(), // Get the document data
      }));
      setTodos(todosList); // Update the state with the todos list including IDs
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  const handleSubmit = async () => {
    if (task.trim()) {
      if (isEditing) {
        // Update existing todo in Firestore
        try {
          const todoRef = doc(db, "todos", editId);
          await updateDoc(todoRef, { task }); // Update the task in Firestore

          // Update local state with the new task
          const updatedTodos = todos.map((todo) =>
            todo.id === editId ? { ...todo, task } : todo
          );
          setTodos(updatedTodos);

          // Reset editing state
          setIsEditing(false);
          setEditId(null);
        } catch (error) {
          console.error("Error updating todo: ", error);
        }
      } else {
        // Add new todo to Firestore
        try {
          const docRef = await addDoc(collection(db, "todos"), {
            task: task,
            userId: user.uid, // Save the user's ID to link todos to users
          });

          // Update the local state after adding the new todo
          setTodos([...todos, { id: docRef.id, task }]);
        } catch (e) {
          console.error("Error adding todo: ", e);
        }
      }
      setTask(""); // Reset the task input
    }
  };

  const handleDelete = async (todoId) => {
    try {
      // Delete the document from Firestore using the document ID
      await deleteDoc(doc(db, "todos", todoId));

      // Update your local state after deletion
      const updatedTodos = todos.filter((todo) => todo.id !== todoId);
      setTodos(updatedTodos); // Update the state to reflect the deletion

      console.log("Todo deleted successfully!");
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  const handleUpdate = async (todoId) => {
    try {
      // Find the todo to update
      const selectedTodo = todos.find((todo) => todo.id === todoId);
      if (selectedTodo) {
        setTask(selectedTodo.task); // Populate the input field with the selected task
        setIsEditing(true); // Set the state to editing
        setEditId(todoId); // Track the ID of the todo being updated
      } else {
        console.log("Todo not found!");
      }
    } catch (error) {
      console.error("Error fetching todo for update: ", error);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="font-extrabold text-4xl p-4 mb-10">TODO APP</div>
      <div className="flex flex-col text-center justify-center gap-4">
        <div className="flex flex-row gap-4 mb-4">
          <input
            className="p-2 rounded-xl text-black"
            placeholder="Enter Todo"
            value={task} // Bind the input field to task state
            onChange={(e) => setTask(e.target.value)} // Update task state on input change
          />
          <button
            className="rounded-xl p-2 border text-white bg-green-700"
            onClick={handleSubmit} // Call handleSubmit when button is clicked
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-bold">Things to do:</p>
          <div>
            <ul className="flex flex-col gap-2">
              {todos.map((todo) => (
                <li
                  className="p-2 flex items-center justify-between rounded-xl border"
                  key={todo.id} // Use todo.id as the key
                >
                  {todo.task}{" "}
                  {/* Display the task property instead of the todo object */}
                  <div className="flex gap-2">
                    <button
                      className="p-1 bg-blue-800 rounded-md"
                      onClick={() => handleUpdate(todo.id)} // Pass todo.id here
                    >
                      Update
                    </button>
                    <button
                      className="p-1 bg-red-800 rounded-md"
                      onClick={() => handleDelete(todo.id)} // Pass todo.id here
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
