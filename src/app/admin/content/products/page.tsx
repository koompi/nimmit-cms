'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  compareAtPrice: number | null
  inventory: number
  trackInventory: boolean
  status: string
  featured: boolean
  featuredImage: string | null
  createdAt: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
  }, [status])

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, statusFilter, featuredFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (featuredFilter !== 'all') {
        params.append('featured', featuredFilter)
      }
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/products?${params}`)
      const data: ProductsResponse = await response.json()

      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchProducts()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'DRAFT':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getInventoryStatus = (product: Product) => {
    if (!product.trackInventory) {
      return { text: 'Not tracked', color: 'text-gray-500' }
    }
    if (product.inventory === 0) {
      return { text: 'Out of stock', color: 'text-red-600', icon: AlertTriangle }
    }
    if (product.inventory < 10) {
      return { text: `${product.inventory} left`, color: 'text-amber-600' }
    }
    return { text: `${product.inventory} in stock`, color: 'text-emerald-600' }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading products...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/content/products/new">
          <Button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-[#fdc501] focus:ring-[#fdc501]"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'DRAFT', label: 'Draft' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => {
              setFeaturedFilter(featuredFilter === 'true' ? 'all' : 'true')
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
              featuredFilter === 'true'
                ? 'bg-[#fdc501] text-black'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Star className={`h-4 w-4 ${featuredFilter === 'true' ? 'fill-current' : ''}`} />
            Featured
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== 'all' || featuredFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first product'}
              </p>
              {!search && statusFilter === 'all' && featuredFilter === 'all' && (
                <Link href="/admin/content/products/new">
                  <Button className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first product
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => {
              const inventory = getInventoryStatus(product)
              return (
                <div 
                  key={product.id} 
                  className="p-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/content/products/${product.id}`}
                              className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            {product.featured && (
                              <Star className="h-4 w-4 text-[#fdc501] fill-[#fdc501]" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="font-mono text-gray-500">{product.sku}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">/{product.slug}</span>
                          </div>
                        </div>
                        <Badge className={`${getStatusBadge(product.status)} text-xs border flex-shrink-0`}>
                          {product.status}
                        </Badge>
                      </div>
                      
                      {/* Price & Inventory */}
                      <div className="flex items-center gap-6 mt-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${inventory.color}`}>
                          {inventory.icon && <inventory.icon className="h-4 w-4" />}
                          <span className="font-medium">{inventory.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <a href={`/products/${product.slug}`} target="_blank" title="View product">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/admin/content/products/${product.id}`} title="Edit product">
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/content/products/${product.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/products/${product.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Live
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium text-gray-900">{pagination.total}</span> products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setPagination((prev) => ({ ...prev, page }))}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      pagination.page === page
                        ? 'bg-[#1a1a1a] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
