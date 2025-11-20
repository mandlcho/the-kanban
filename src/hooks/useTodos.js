import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "./useSession";

export const TODO_PRIORITIES = ["high", "medium", "low"];
export const DEFAULT_PRIORITY = "medium";

export function useTodos() {
  const { session } = useSession();
  const [todos, setTodos] = useState([]);
  const [archivedTodos, setArchivedTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching todos:", error);
      } else {
        setTodos(data.filter(todo => !todo.archivedAt));
        setArchivedTodos(data.filter(todo => todo.archivedAt));
      }
      setLoading(false);
    };

    fetchTodos();

    const subscription = supabase.channel('public:todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, payload => {
        if (payload.eventType === 'INSERT') {
          setTodos(currentTodos => [payload.new, ...currentTodos]);
        }
        if (payload.eventType === 'UPDATE') {
          setTodos(currentTodos =>
            currentTodos.map(todo =>
              todo.id === payload.new.id ? payload.new : todo
            )
          );
        }
        if (payload.eventType === 'DELETE') {
          setTodos(currentTodos =>
            currentTodos.filter(todo => todo.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addTodo = async (todo) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ ...todo, user_id: user.id }])
      .select();

    if (error) {
      console.error("Error adding todo:", error);
      return null;
    }
    return data[0];
  };

  const updateTodo = async (id, updates) => {
    if (!user) return;

    const { error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    if (!user) return;

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    }
  };


  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.is_complete).length;
    const active = todos.filter(
      (todo) => !todo.is_complete && todo.status === "active"
    ).length;
    const backlog = todos.filter(
      (todo) => !todo.is_complete && todo.status === "backlog"
    ).length;
    return {
      total,
      backlog,
      active,
      completed,
      remaining: total - completed,
    };
  }, [todos]);

  return {
    todos,
    setTodos,
    archivedTodos,
    setArchivedTodos,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    loading,
  };
}


