'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Menu as MenuIcon,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Globe,
  Link,
  Loader2,
  LayoutGrid,
  PanelBottom,
  Sidebar,
  GripVertical,
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  url: string
  target: string
  order: number
  children?: MenuItem[]
}

interface Menu {
  id: string
  name: string
  location: string
  items: MenuItem[]
  createdAt: string
  updatedAt: string
}

export default function MenusPage() {
  const { data: session, status } = useSession()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [menuForm, setMenuForm] = useState({ name: '', location: 'header' })
  const [itemForm, setItemForm] = useState({ label: '', url: '', target: '_self' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMenus()
    }
  }, [status])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/menus')
      const data = await response.json()
      setMenus(data.menus)

      // Auto-select first menu if none selected
      if (data.menus.length > 0 && !selectedMenu) {
        setSelectedMenu(data.menus[0])
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const openMenuDialog = (menu?: Menu) => {
    setEditingMenu(menu || null)
    setMenuForm({
      name: menu?.name || '',
      location: menu?.location || 'header',
    })
    setMenuDialogOpen(true)
  }

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingMenu
        ? `/api/admin/menus/${editingMenu.id}`
        : '/api/admin/menus'
      const method = editingMenu ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save menu')
        setSaving(false)
        return
      }

      setMenuDialogOpen(false)
      fetchMenus()
    } catch (error) {
      console.error('Save menu error:', error)
      alert('Failed to save menu')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMenu = async (menu: Menu) => {
    if (!confirm(`Delete "${menu.name}" menu? This will also delete all menu items.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/menus/${menu.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (selectedMenu?.id === menu.id) {
          setSelectedMenu(null)
        }
        fetchMenus()
      } else {
        alert('Failed to delete menu')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete menu')
    }
  }

  const openItemDialog = (item?: MenuItem) => {
    setEditingItem(item || null)
    setItemForm({
      label: item?.label || '',
      url: item?.url || '',
      target: item?.target || '_self',
    })
    setItemDialogOpen(true)
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMenu) return
    setSaving(true)

    try {
      // Get current items
      let items = [...(selectedMenu.items || [])]

      if (editingItem) {
        // Update existing item
        items = items.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...itemForm }
            : item
        )
      } else {
        // Add new item
        items.push({
          id: `temp-${Date.now()}`,
          ...itemForm,
          order: items.length,
        })
      }

      // Update menu with new items
      const response = await fetch(`/api/admin/menus/${selectedMenu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            tempId: item.id,
            label: item.label,
            url: item.url,
            target: item.target,
            order: index,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save menu item')
        setSaving(false)
        return
      }

      setItemDialogOpen(false)
      fetchMenus()
    } catch (error) {
      console.error('Save item error:', error)
      alert('Failed to save menu item')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (item: MenuItem) => {
    if (!selectedMenu) return
    if (!confirm(`Delete "${item.label}"?`)) return

    try {
      const items = selectedMenu.items.filter((i) => i.id !== item.id)

      const response = await fetch(`/api/admin/menus/${selectedMenu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            tempId: item.id,
            label: item.label,
            url: item.url,
            target: item.target,
            order: index,
          })),
        }),
      })

      if (response.ok) {
        fetchMenus()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete item')
    }
  }

  const moveItem = async (item: MenuItem, direction: 'up' | 'down') => {
    if (!selectedMenu) return

    const items = [...selectedMenu.items]
    const index = items.findIndex((i) => i.id === item.id)

    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const [removed] = items.splice(index, 1)
    items.splice(newIndex, 0, removed)

    try {
      const response = await fetch(`/api/admin/menus/${selectedMenu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, idx) => ({
            tempId: item.id,
            label: item.label,
            url: item.url,
            target: item.target,
            order: idx,
          })),
        }),
      })

      if (response.ok) {
        fetchMenus()
      }
    } catch (error) {
      console.error('Move error:', error)
    }
  }

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'header':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
            <LayoutGrid className="w-3 h-3" />
            Header
          </Badge>
        )
      case 'footer':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
            <PanelBottom className="w-3 h-3" />
            Footer
          </Badge>
        )
      case 'sidebar':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
            <Sidebar className="w-3 h-3" />
            Sidebar
          </Badge>
        )
      default:
        return <Badge>{location}</Badge>
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <MenuIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Navigation Menus</h1>
              <p className="text-gray-400 text-sm">Create and manage site navigation menus</p>
            </div>
          </div>
          <Button 
            onClick={() => openMenuDialog()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Menu
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <MenuIcon className="w-4 h-4" />
            Menus
          </h2>
          {menus.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <MenuIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No menus created yet</p>
              <Button 
                variant="link" 
                className="mt-2 text-yellow-600"
                onClick={() => openMenuDialog()}
              >
                Create your first menu
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMenu?.id === menu.id
                      ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                      : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{menu.name}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {getLocationBadge(menu.location)}
                        <span className="text-xs text-gray-500">
                          {menu.items.length} items
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-yellow-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          openMenuDialog(menu)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMenu(menu)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="md:col-span-2 bg-white rounded-xl border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-gray-700">
              <Link className="w-4 h-4" />
              {selectedMenu ? `Items: ${selectedMenu.name}` : 'Select a menu'}
            </h2>
            {selectedMenu && (
              <Button 
                size="sm" 
                onClick={() => openItemDialog()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            )}
          </div>

          {!selectedMenu ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Link className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Select a menu from the list to manage its items</p>
            </div>
          ) : selectedMenu.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No items in this menu</p>
              <Button 
                variant="link" 
                className="mt-2 text-yellow-600"
                onClick={() => openItemDialog()}
              >
                Add your first item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedMenu.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-yellow-100"
                        disabled={index === 0}
                        onClick={() => moveItem(item, 'up')}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-yellow-100"
                        disabled={index === selectedMenu.items.length - 1}
                        onClick={() => moveItem(item, 'down')}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {item.target === '_blank' ? (
                          <ExternalLink className="w-3 h-3" />
                        ) : (
                          <Globe className="w-3 h-3" />
                        )}
                        {item.url}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-yellow-100"
                      onClick={() => openItemDialog(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MenuIcon className="w-5 h-5 text-yellow-500" />
              {editingMenu ? 'Edit Menu' : 'Create Menu'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">Menu Name *</Label>
              <Input
                id="menuName"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Main Navigation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menuLocation">Location</Label>
              <Select
                value={menuForm.location}
                onValueChange={(value) =>
                  setMenuForm((prev) => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Header
                    </span>
                  </SelectItem>
                  <SelectItem value="footer">
                    <span className="flex items-center gap-2">
                      <PanelBottom className="w-4 h-4" />
                      Footer
                    </span>
                  </SelectItem>
                  <SelectItem value="sidebar">
                    <span className="flex items-center gap-2">
                      <Sidebar className="w-4 h-4" />
                      Sidebar
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMenuDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingMenu ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-yellow-500" />
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemLabel">Label *</Label>
              <Input
                id="itemLabel"
                value={itemForm.label}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="e.g., About Us"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemUrl">URL *</Label>
              <Input
                id="itemUrl"
                value={itemForm.url}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="e.g., /about or https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemTarget">Open in</Label>
              <Select
                value={itemForm.target}
                onValueChange={(value) =>
                  setItemForm((prev) => ({ ...prev, target: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Same Tab
                    </span>
                  </SelectItem>
                  <SelectItem value="_blank">
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      New Tab
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingItem ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
