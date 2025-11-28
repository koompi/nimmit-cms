'use client'

import { useSession } from 'next-auth/react'
import { redirect, useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RevisionHistory } from '@/components/content/RevisionHistory'
import { PreviewButton } from '@/components/preview/PreviewButton'

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  price: number
  compareAtPrice: number | null
  sku: string
  inventory: number
  trackInventory: boolean
  status: string
  featured: boolean
  featuredImage: string | null
  specifications: Record<string, unknown> | null
  seo: Record<string, string> | null
}

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    inventory: '0',
    trackInventory: true,
    status: 'DRAFT',
    featured: false,
    featuredImage: '',
    specifications: '{}',
    seo: JSON.stringify({
      metaTitle: '',
      metaDescription: '',
    }),
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
  }, [status])

  useEffect(() => {
    if (productId && status === 'authenticated') {
      fetchProduct()
    }
  }, [productId, status])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/content/products')
          return
        }
        throw new Error('Failed to fetch product')
      }

      const product: Product = await response.json()

      setFormData({
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        sku: product.sku,
        inventory: product.inventory.toString(),
        trackInventory: product.trackInventory,
        status: product.status,
        featured: product.featured,
        featuredImage: product.featuredImage || '',
        specifications: JSON.stringify(product.specifications || {}),
        seo: JSON.stringify(
          product.seo || { metaTitle: '', metaDescription: '' }
        ),
      })
    } catch (err) {
      console.error('Fetch product error:', err)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Product name is required')
        setSaving(false)
        return
      }
      if (!formData.sku.trim()) {
        setError('SKU is required')
        setSaving(false)
        return
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        setError('Valid price is required')
        setSaving(false)
        return
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specifications: JSON.parse(formData.specifications || '{}'),
          seo: JSON.parse(formData.seo || '{}'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update product')
        setSaving(false)
        return
      }

      router.push('/admin/content/products')
    } catch (err) {
      console.error('Update product error:', err)
      setError('Failed to update product')
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <div className="flex gap-2">
          {productId && (
            <>
              <PreviewButton
                contentType="product"
                contentId={productId}
                contentSlug={formData.slug}
              />
              <RevisionHistory contentType="product" contentId={productId} />
            </>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="product-url-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                placeholder="Brief product description for listings"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Detailed product description"
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Pricing</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    compareAtPrice: e.target.value,
                  }))
                }
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500">
                Original price for sale items
              </p>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Inventory</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sku: e.target.value }))
                }
                placeholder="Product SKU"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Stock Quantity</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, inventory: e.target.value }))
                }
                disabled={!formData.trackInventory}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trackInventory"
              checked={formData.trackInventory}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trackInventory: e.target.checked,
                }))
              }
              className="rounded"
            />
            <Label htmlFor="trackInventory" className="font-normal">
              Track inventory for this product
            </Label>
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Publishing</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredImage: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="rounded"
            />
            <Label htmlFor="featured" className="font-normal">
              Feature this product on homepage
            </Label>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">SEO Settings</h2>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Meta Title</Label>
              <Input
                id="seoTitle"
                value={JSON.parse(formData.seo).metaTitle || ''}
                onChange={(e) => {
                  const seo = JSON.parse(formData.seo)
                  seo.metaTitle = e.target.value
                  setFormData((prev) => ({ ...prev, seo: JSON.stringify(seo) }))
                }}
                placeholder="Page title for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Textarea
                id="seoDescription"
                value={JSON.parse(formData.seo).metaDescription || ''}
                onChange={(e) => {
                  const seo = JSON.parse(formData.seo)
                  seo.metaDescription = e.target.value
                  setFormData((prev) => ({ ...prev, seo: JSON.stringify(seo) }))
                }}
                placeholder="Description for search engines"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
