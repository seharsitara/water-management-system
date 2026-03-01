import { useEffect, useState } from "react"
import { fetchCategories, createCategory } from "@/services/dashboard"

interface Category {
  id: string
  user_id: string
  name: string
  icon?: string
  daily_limit?: number
  monthly_limit?: number
  created_at: string
}

interface UseCategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories() {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchCategories()
      setState({ categories: data, loading: false, error: null })
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message ?? "Failed to load categories" }))
    }
  }

  const addCategory = async (payload: { name: string; icon?: string; daily_limit?: number; monthly_limit?: number }) => {
    try {
      await createCategory(payload)
      await load()
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message ?? "Failed to create category" }))
      throw err
    }
  }

  useEffect(() => {
    load()
  }, [])

  return {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    reload: load,
    addCategory,
  }
}
