'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Trash2, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  featuredImage: string | null
  slug: string
}

function ProductGridBlockComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  const attrs = node.attrs as {
    title: string
    productIds: string[]
    columns: 2 | 3 | 4
    showPrice: boolean
    showDescription: boolean
  }

  // Fetch all products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          setAllProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // Filter products by selected IDs (derived state, no useEffect needed)
  const products = allProducts.filter(p => attrs.productIds.includes(p.id))

  const toggleProduct = (productId: string) => {
    const newIds = attrs.productIds.includes(productId)
      ? attrs.productIds.filter(id => id !== productId)
      : [...attrs.productIds, productId]
    updateAttributes({ productIds: newIds })
  }

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[attrs.columns]

  return (
    <NodeViewWrapper className="my-4">
      <div className="bg-gray-50 rounded-lg p-6">
        {/* Title */}
        {attrs.title && (
          <h2 className="text-2xl font-bold mb-6">{attrs.title}</h2>
        )}
        
        {/* Product Grid */}
        {products.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-6`}>
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200">
                  {product.featuredImage ? (
                    <img 
                      src={product.featuredImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {attrs.showDescription && product.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {attrs.showPrice && (
                    <p className="text-blue-600 font-bold mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products selected. Click settings to choose products.</p>
          </div>
        )}

        {/* Edit Controls */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Edit Product Grid</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Section Title</Label>
                  <Input 
                    value={attrs.title}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    placeholder="Featured Products"
                  />
                </div>
                <div>
                  <Label>Columns</Label>
                  <Select 
                    value={attrs.columns.toString()} 
                    onValueChange={(v) => updateAttributes({ columns: parseInt(v) as 2 | 3 | 4 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="showPrice"
                      checked={attrs.showPrice}
                      onCheckedChange={(checked) => updateAttributes({ showPrice: !!checked })}
                    />
                    <Label htmlFor="showPrice">Show Price</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="showDesc"
                      checked={attrs.showDescription}
                      onCheckedChange={(checked) => updateAttributes({ showDescription: !!checked })}
                    />
                    <Label htmlFor="showDesc">Show Description</Label>
                  </div>
                </div>
                <div>
                  <Label>Select Products</Label>
                  <div className="border rounded-lg max-h-60 overflow-auto mt-2">
                    {allProducts.length > 0 ? (
                      allProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleProduct(product.id)}
                        >
                          <Checkbox 
                            checked={attrs.productIds.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <div className="h-10 w-10 bg-gray-200 rounded flex-shrink-0">
                            {product.featuredImage && (
                              <img 
                                src={product.featuredImage} 
                                alt={product.name}
                                className="h-full w-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500 text-center">No products available</p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="destructive" onClick={deleteNode}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const ProductGridBlock = Node.create({
  name: 'productGridBlock',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes() {
    return {
      title: { default: 'Featured Products' },
      productIds: { default: [] },
      columns: { default: 3 },
      showPrice: { default: true },
      showDescription: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="product-grid-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'product-grid-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductGridBlockComponent)
  },
})
