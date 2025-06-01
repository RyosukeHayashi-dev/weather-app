"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CitySearchProps {
  onSearch: (city: string) => void
  isLoading?: boolean
}

export function CitySearch({ onSearch, isLoading }: CitySearchProps) {
  const [city, setCity] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
      setCity("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md space-x-2">
      <Input
        type="text"
        placeholder="都市名を入力してください..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !city.trim()}>
        <Search className="h-4 w-4" />
        <span className="sr-only">検索</span>
      </Button>
    </form>
  )
}
