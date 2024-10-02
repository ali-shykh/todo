"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/authContext";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function Todo() {
  const { user } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchTodos();
    }
  }, [user, router]);

  const fetchTodos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "todos"));
      const todosList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((todo) => todo.userId === user.uid);
      setTodos(todosList);
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  const handleSubmit = async () => {
    if (!task.trim()) {
      setError("Task cannot be empty!"); // Show error if task is empty
      return;
    }

    if (task.trim()) {
      if (isEditing) {
        const todoRef = doc(db, "todos", editIndex);
        await updateDoc(todoRef, { task });
        const updatedTodos = todos.map((todo) =>
          todo.id === editIndex ? { ...todo, task } : todo
        );
        setTodos(updatedTodos);
        setIsEditing(false);
        setEditIndex(null);
      } else {
        try {
          const docRef = await addDoc(collection(db, "todos"), {
            task,
            userId: user.uid,
          });
          setTodos([...todos, { id: docRef.id, task }]);
          console.log("Todo added Successfully!");
          setSuccess("Todo added Successfully!");
        } catch (e) {
          console.error("Error adding todo: ", e);
        }
      }
      setTask("");
      setError(""); // Clear error after successful submission
    }
  };

  const handleDelete = async (todoId) => {
    await deleteDoc(doc(db, "todos", todoId));
    setTodos(todos.filter((todo) => todo.id !== todoId));
  };

  const handleUpdate = (todoId) => {
    const selectedTodo = todos.find((todo) => todo.id === todoId);
    setTask(selectedTodo.task);
    setIsEditing(true);
    setEditIndex(todoId);
  };

  const handleInputChange = (e) => {
    setSuccess("");
    const input = e.target.value;
    if (input.length <= 20) {
      setTask(input);
      setError("");
    } else {
      setError("You can only enter up to 20 characters!");
    }
  };

  return user ? (
    <div className="w-full flex flex-col items-center px-6 sm:px-20 md:px-32 xl:px-44">
      <div className="font-extrabold text-4xl p-4 mb-10 text-center">
        TODO APP
      </div>
      <div className="flex flex-col text-center justify-center gap-4 w-full max-w-2xl">
        <div className="flex flex-row gap-4 w-full">
          <input
            className={`w-full p-2 rounded-xl text-black ${
              error ? "border-red-500" : ""
            }`} // Add red border if error exists
            placeholder="Enter Todo (Max 20)"
            value={task}
            onChange={handleInputChange}
          />
          <button
            className="rounded-xl p-2 border text-white bg-green-700 min-w-[100px]"
            onClick={handleSubmit}
            disabled={error} // Disable button if error exists
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-700 text-sm italic font-semibold">{error}</p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-green-700 text-sm italic font-semibold">
            {success}
          </p>
        )}

        <div className="flex flex-col gap-4 mt-10">
          <p className="text-3xl font-bold">Things to do:</p>
          <ul className="flex flex-col gap-2">
            {todos.length === 0 ? (
              <p className="text-gray-400 text-sm font-semibold italic">
                Nothing to show here...
              </p>
            ) : (
              todos.map((todo) => (
                <li
                  className="p-2 flex items-center justify-between rounded-xl border"
                  key={todo.id}
                >
                  {todo.task}
                  <div className="flex gap-2">
                    <button
                      className="p-1 bg-blue-700 text-white rounded-md"
                      onClick={() => handleUpdate(todo.id)}
                    >
                      Update
                    </button>
                    <button
                      className="p-1 bg-red-700 text-white rounded-md"
                      onClick={() => handleDelete(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  ) : null;
}
