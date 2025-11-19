import { SortOption } from '@/types/store';

interface ProductFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  hideSoldOut: boolean;
  onHideSoldOutChange: (hide: boolean) => void;
}

export default function ProductFilters({
  sortBy,
  onSortChange,
  hideSoldOut,
  onHideSoldOutChange,
}: ProductFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-[#282828] text-white px-4 py-2 rounded border border-[#404040] hover:border-white transition cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={hideSoldOut}
          onChange={(e) => onHideSoldOutChange(e.target.checked)}
          className="w-5 h-5 rounded accent-green-500 cursor-pointer"
        />
        <span className="text-sm group-hover:text-green-500 transition">
          Hide sold out items
        </span>
      </label>
    </div>
  );
}

