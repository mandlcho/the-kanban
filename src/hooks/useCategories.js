import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "./useSession";

const DEFAULT_CATEGORIES = [
  { name: "work", color: "#2563eb" },
  { name: "personal", color: "#059669" },
  { name: "errands", color: "#d97706" },
  { name: "learning", color: "#9333ea" },
];

export function useCategories() {
  const { session } = useSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
      } else if (data.length === 0) {
        const { data: newCategories, error: insertError } = await supabase
          .from("categories")
          .insert(DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: user.id })))
          .select();
        
        if (insertError) {
          console.error("Error creating default categories:", insertError);
        } else {
          setCategories(newCategories);
        }
      } else {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();

    const subscription = supabase.channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
        if (payload.eventType === 'INSERT') {
          setCategories(currentCategories => [...currentCategories, payload.new]);
        }
        if (payload.eventType === 'UPDATE') {
          setCategories(currentCategories =>
            currentCategories.map(category =>
              category.id === payload.new.id ? payload.new : category
            )
          );
        }
        if (payload.eventType === 'DELETE') {
          setCategories(currentCategories =>
            currentCategories.filter(category => category.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addCategory = async (label) => {
    if (!user || !label) return null;

    const existing = categories.find(c => c.name === label.trim().toLowerCase());
    if (existing) return existing;

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: label.trim().toLowerCase(), user_id: user.id }])
      .select();

    if (error) {
      console.error("Error adding category:", error);
      return null;
    }
    return data[0];
  };

  const removeCategory = async (categoryId) => {
    if (!user || !categoryId) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting category:", error);
    }
  };

  return {
    categories,
    addCategory,
    removeCategory,
    loading,
  };
}


