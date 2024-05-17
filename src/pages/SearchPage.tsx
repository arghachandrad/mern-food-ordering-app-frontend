import { useSearchRestaurants } from "@/api/restaurantApi"
import CuisineFilter from "@/components/CuisineFilter"
import PaginationSelector from "@/components/PaginationSelector"
import SearchBar, { SearchForm } from "@/components/SearchBar"
import SearchResultCard from "@/components/SearchResultCard"
import SearchResultInfo from "@/components/SearchResultInfo"
import SortOptionDropdown from "@/components/SortOptionDropdown"
import { useState } from "react"
import { useParams } from "react-router-dom"

export type SearchState = {
  searchQuery: string
  page: number
  selectedCuisines: string[]
  sortOption: string
}

export default function SearchPage() {
  const { city } = useParams()
  const [searchState, setSearchState] = useState<SearchState>({
    searchQuery: "",
    page: 1,
    selectedCuisines: [],
    sortOption: "bestMatch",
  })
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const { results, isLoading } = useSearchRestaurants(searchState, city)

  const setSortOption = (sortOption: string) => {
    setSearchState((prev) => ({
      ...prev,
      sortOption,
      page: 1,
    }))
  }

  const setSelectedCuisines = (selectedCuisineList: string[]) => {
    setSearchState((prev) => ({
      ...prev,
      selectedCuisines: selectedCuisineList,
      page: 1,
    }))
  }

  const setSearchQuery = (searchFormData: SearchForm) => {
    setSearchState((prev) => ({
      ...prev,
      searchQuery: searchFormData.searchQuery,
      page: 1,
    }))
  }

  const resetSearch = () => {
    setSearchState((prev) => ({
      ...prev,
      searchQuery: "",
      page: 1,
    }))
  }

  const setPage = (page: number) => {
    setSearchState((prev) => ({
      ...prev,
      page,
    }))
  }

  if (isLoading) {
    return <span>Loading...</span>
  }

  if (!results?.data || !city) {
    return <span>No results found</span>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div id="cuisines-list">
        <CuisineFilter
          onChange={setSelectedCuisines}
          selectedCuisines={searchState.selectedCuisines}
          isExpanded={isExpanded}
          onExpandedClick={() => setIsExpanded((prev) => !prev)}
        />
      </div>

      <div id="main" className="flex flex-col gap-5">
        <SearchBar
          searchQuery={searchState.searchQuery}
          onSubmit={setSearchQuery}
          placeholder="Search by Cuisine or Restaurant Name"
          onReset={resetSearch}
        />
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <SearchResultInfo total={results.pagination.total} city={city} />
          <SortOptionDropdown
            sortOption={searchState.sortOption}
            onChange={(value) => setSortOption(value)}
          />
        </div>
        {results?.data.map((restaurant) => (
          <SearchResultCard restaurant={restaurant} />
        ))}

        <PaginationSelector
          page={results?.pagination.page}
          pages={results.pagination.pages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
