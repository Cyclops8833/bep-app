export type OutletType = 'cafe' | 'restaurant' | 'street_food' | 'bakery' | 'other'
export type LanguagePref = 'vi' | 'en'

export interface Profile {
  id: string
  business_name: string
  outlet_type: OutletType
  city: string
  vat_registered: boolean
  language_pref: LanguagePref
  created_at: string
}
