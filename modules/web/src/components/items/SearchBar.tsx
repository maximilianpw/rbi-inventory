import { Search } from 'lucide-react'

import { Input } from '../ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  className = '',
}: SearchBarProps): React.JSX.Element {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        className="pl-10"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
