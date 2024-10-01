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
      const todosList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(todosList);
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  const handleSubmit = async () => {
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
        } catch (e) {
          console.error("Error adding todo: ", e);
        }
      }
      setTask("");
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

  return user ? (
    <div>
      <div className="font-extrabold text-4xl p-4 mb-10">TODO APP</div>
      <div className="flex flex-col text-center justify-center gap-4">
        <div className="flex flex-row gap-4 mb-10">
          <input
            className="p-2 rounded-xl text-black"
            placeholder="Enter Todo"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button
            className="rounded-xl p-2 border text-white bg-green-700"
            onClick={handleSubmit}
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-3xl font-bold">Things to do:</p>
          <ul className="flex flex-col gap-2">
            {todos.length === 0 ? (
              <p className="text-gray-400 text-xs font-semibold italic">
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
                      className="p-1 bg-blue-800 rounded-md"
                      onClick={() => handleUpdate(todo.id)}
                    >
                      Update
                    </button>
                    <button
                      className="p-1 bg-red-800 rounded-md"
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
