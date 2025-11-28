'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Settings as SettingsIcon,
  Globe,
  Share2,
  Search,
  Home,
  Loader2,
  Save,
  Mail,
  Phone,
  MapPin,
  Link,
  Image as ImageIcon,
  FileText,
  Layout,
} from 'lucide-react'

interface SiteSettings {
  name: string
  tagline: string
  description: string
  logo: string
  favicon: string
  email: string
  phone: string
  address: string
}

interface SocialSettings {
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
}

interface SEOSettings {
  defaultTitle: string
  titleSeparator: string
  defaultDescription: string
  keywords: string
  ogImage: string
}

interface HomepageSettings {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  showFeaturedProducts: boolean
  showLatestPosts: boolean
  showTestimonials: boolean
}

interface FooterSettings {
  copyrightText: string
  showSocialLinks: boolean
}

interface AllSettings {
  site: SiteSettings
  social: SocialSettings
  seo: SEOSettings
  homepage: HomepageSettings
  footer: FooterSettings
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('site')
  const [settings, setSettings] = useState<AllSettings>({
    site: {
      name: '',
      tagline: '',
      description: '',
      logo: '',
      favicon: '',
      email: '',
      phone: '',
      address: '',
    },
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
    seo: {
      defaultTitle: '',
      titleSeparator: ' | ',
      defaultDescription: '',
      keywords: '',
      ogImage: '',
    },
    homepage: {
      heroTitle: '',
      heroSubtitle: '',
      heroImage: '',
      showFeaturedProducts: true,
      showLatestPosts: true,
      showTestimonials: true,
    },
    footer: {
      copyrightText: '',
      showSocialLinks: true,
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.settings) {
        setSettings((prev) => ({
          site: { ...prev.site, ...data.settings.site },
          social: { ...prev.social, ...data.settings.social },
          seo: { ...prev.seo, ...data.settings.seo },
          homepage: { ...prev.homepage, ...data.settings.homepage },
          footer: { ...prev.footer, ...data.settings.footer },
        }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save: ${error.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof AllSettings>(
    category: K,
    key: keyof AllSettings[K],
    value: AllSettings[K][keyof AllSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const tabs = [
    { id: 'site', label: 'General', icon: Globe },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'footer', label: 'Footer', icon: Layout },
  ]

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
              <SettingsIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-gray-400 text-sm">Configure your site settings and preferences</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <nav className="flex gap-1 p-2 border-b overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">General Settings</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.site.name}
                    onChange={(e) => updateSetting('site', 'name', e.target.value)}
                    placeholder="Your Site Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.site.tagline}
                    onChange={(e) =>
                      updateSetting('site', 'tagline', e.target.value)
                    }
                    placeholder="Your tagline here"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Site Description</Label>
                  <Textarea
                    id="description"
                    value={settings.site.description}
                    onChange={(e) =>
                      updateSetting('site', 'description', e.target.value)
                    }
                    placeholder="Brief description of your site"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Logo URL
                  </Label>
                  <Input
                    id="logo"
                    value={settings.site.logo}
                    onChange={(e) => updateSetting('site', 'logo', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Favicon URL
                  </Label>
                  <Input
                    id="favicon"
                    value={settings.site.favicon}
                    onChange={(e) =>
                      updateSetting('site', 'favicon', e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.site.email}
                    onChange={(e) => updateSetting('site', 'email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={settings.site.phone}
                    onChange={(e) => updateSetting('site', 'phone', e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={settings.site.address}
                    onChange={(e) =>
                      updateSetting('site', 'address', e.target.value)
                    }
                    placeholder="Your business address"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Social Media Links</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={settings.social.facebook}
                    onChange={(e) =>
                      updateSetting('social', 'facebook', e.target.value)
                    }
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    value={settings.social.twitter}
                    onChange={(e) =>
                      updateSetting('social', 'twitter', e.target.value)
                    }
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={settings.social.instagram}
                    onChange={(e) =>
                      updateSetting('social', 'instagram', e.target.value)
                    }
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={settings.social.linkedin}
                    onChange={(e) =>
                      updateSetting('social', 'linkedin', e.target.value)
                    }
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={settings.social.youtube}
                    onChange={(e) =>
                      updateSetting('social', 'youtube', e.target.value)
                    }
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">SEO Settings</h2>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTitle" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Default Meta Title
                    </Label>
                    <Input
                      id="defaultTitle"
                      value={settings.seo.defaultTitle}
                      onChange={(e) =>
                        updateSetting('seo', 'defaultTitle', e.target.value)
                      }
                      placeholder="Your Site Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleSeparator">Title Separator</Label>
                    <Input
                      id="titleSeparator"
                      value={settings.seo.titleSeparator}
                      onChange={(e) =>
                        updateSetting('seo', 'titleSeparator', e.target.value)
                      }
                      placeholder=" | "
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultDescription">Default Meta Description</Label>
                  <Textarea
                    id="defaultDescription"
                    value={settings.seo.defaultDescription}
                    onChange={(e) =>
                      updateSetting('seo', 'defaultDescription', e.target.value)
                    }
                    placeholder="Default description for pages without custom meta"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Default Keywords</Label>
                  <Input
                    id="keywords"
                    value={settings.seo.keywords}
                    onChange={(e) =>
                      updateSetting('seo', 'keywords', e.target.value)
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Default OG Image URL
                  </Label>
                  <Input
                    id="ogImage"
                    value={settings.seo.ogImage}
                    onChange={(e) =>
                      updateSetting('seo', 'ogImage', e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Homepage Settings */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Homepage Settings</h2>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={settings.homepage.heroTitle}
                    onChange={(e) =>
                      updateSetting('homepage', 'heroTitle', e.target.value)
                    }
                    placeholder="Welcome to Our Site"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={settings.homepage.heroSubtitle}
                    onChange={(e) =>
                      updateSetting('homepage', 'heroSubtitle', e.target.value)
                    }
                    placeholder="A brief description or call to action"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroImage" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Hero Background Image URL
                  </Label>
                  <Input
                    id="heroImage"
                    value={settings.homepage.heroImage}
                    onChange={(e) =>
                      updateSetting('homepage', 'heroImage', e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-gray-700">Display Options</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showFeaturedProducts"
                      checked={settings.homepage.showFeaturedProducts}
                      onChange={(e) =>
                        updateSetting(
                          'homepage',
                          'showFeaturedProducts',
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <Label htmlFor="showFeaturedProducts" className="font-normal cursor-pointer">
                      Show Featured Products section
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showLatestPosts"
                      checked={settings.homepage.showLatestPosts}
                      onChange={(e) =>
                        updateSetting('homepage', 'showLatestPosts', e.target.checked)
                      }
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <Label htmlFor="showLatestPosts" className="font-normal cursor-pointer">
                      Show Latest Blog Posts section
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showTestimonials"
                      checked={settings.homepage.showTestimonials}
                      onChange={(e) =>
                        updateSetting(
                          'homepage',
                          'showTestimonials',
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <Label htmlFor="showTestimonials" className="font-normal cursor-pointer">
                      Show Testimonials section
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Footer Settings</h2>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <Input
                    id="copyrightText"
                    value={settings.footer.copyrightText}
                    onChange={(e) =>
                      updateSetting('footer', 'copyrightText', e.target.value)
                    }
                    placeholder="© {year} Your Company. All rights reserved."
                  />
                  <p className="text-sm text-gray-500">
                    Use {'{year}'} to automatically insert the current year
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="showSocialLinks"
                    checked={settings.footer.showSocialLinks}
                    onChange={(e) =>
                      updateSetting('footer', 'showSocialLinks', e.target.checked)
                    }
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <Label htmlFor="showSocialLinks" className="font-normal cursor-pointer">
                    Show social media links in footer
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
