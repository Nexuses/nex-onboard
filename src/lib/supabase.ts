import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface OnboardingSubmission {
  id?: string
  firm_name: string
  website?: string
  country: string
  logo_url?: string
  do_not_contact_option?: string
  do_not_contact_file_url?: string
  do_not_contact_link?: string
  managing_partner_name: string
  managing_partner_phone: string
  managing_partner_email: string
  managing_partner_whatsapp: boolean
  spoc_name: string
  spoc_phone: string
  spoc_email: string
  spoc_whatsapp: boolean
  company_profile_option?: string
  company_profile_file_url?: string
  company_profile_link?: string
  linkedin_option?: string
  linkedin_poc_name?: string
  linkedin_poc_email?: string
  website_option?: string
  website_admin_url?: string
  website_username?: string
  website_password?: string
  technical_contact_name?: string
  technical_contact_email?: string
  additional_notes?: string
  created_at?: string
  updated_at?: string
}

export interface EmailAccount {
  id?: string
  submission_id: string
  name: string
  email: string
  password: string
  created_at?: string
}

// Upload file to Supabase Storage
export const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

// Save onboarding submission
export const saveOnboardingSubmission = async (submission: OnboardingSubmission) => {
  const { data, error } = await supabase
    .from('onboarding_submissions')
    .insert(submission)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Save email accounts
export const saveEmailAccounts = async (emailAccounts: Omit<EmailAccount, 'id' | 'created_at'>[]) => {
  const { data, error } = await supabase
    .from('email_accounts')
    .insert(emailAccounts)
    .select()

  if (error) {
    throw error
  }

  return data
}

// Send notification email
export const sendNotificationEmail = async (onboardingData: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-onboarding-notification', {
      body: { onboardingData }
    })

    if (error) {
      console.warn('Email notification failed:', error)
      // Don't throw error - just log it
      return { success: false, error: error.message }
    }

    return data
  } catch (error) {
    console.warn('Email notification failed:', error)
    // Don't throw error - just log it
    return { success: false, error: error.message }
  }
}