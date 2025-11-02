import { createServerFn } from '@tanstack/react-start'
import { sampleItems } from '@/data/routes/item'

export const fetchItems = createServerFn({
  method: 'GET',
}).handler(() => sampleItems)
