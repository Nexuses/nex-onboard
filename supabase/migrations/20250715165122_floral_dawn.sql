/*
  # RSM MENA Client Onboarding Database Schema

  1. New Tables
    - `onboarding_submissions`
      - `id` (uuid, primary key)
      - `firm_name` (text)
      - `website` (text)
      - `country` (text)
      - `logo_url` (text, optional)
      - `do_not_contact_option` (text)
      - `do_not_contact_file_url` (text, optional)
      - `do_not_contact_link` (text, optional)
      - `managing_partner_name` (text)
      - `managing_partner_phone` (text)
      - `managing_partner_email` (text)
      - `managing_partner_whatsapp` (boolean)
      - `spoc_name` (text)
      - `spoc_phone` (text)
      - `spoc_email` (text)
      - `spoc_whatsapp` (boolean)
      - `company_profile_option` (text)
      - `company_profile_file_url` (text, optional)
      - `company_profile_link` (text, optional)
      - `linkedin_option` (text)
      - `linkedin_poc_name` (text, optional)
      - `linkedin_poc_email` (text, optional)
      - `website_option` (text)
      - `website_admin_url` (text, optional)
      - `website_username` (text, optional)
      - `website_password` (text, optional)
      - `technical_contact_name` (text, optional)
      - `technical_contact_email` (text, optional)
      - `additional_notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `email_accounts`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `password` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    - Add storage bucket for file uploads

  3. Storage
    - Create storage bucket for file uploads
    - Set up proper access policies
*/

-- Create onboarding_submissions table
CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name text NOT NULL,
  website text,
  country text NOT NULL,
  logo_url text,
  do_not_contact_option text DEFAULT '',
  do_not_contact_file_url text,
  do_not_contact_link text,
  managing_partner_name text NOT NULL,
  managing_partner_phone text NOT NULL,
  managing_partner_email text NOT NULL,
  managing_partner_whatsapp boolean DEFAULT false,
  spoc_name text NOT NULL,
  spoc_phone text NOT NULL,
  spoc_email text NOT NULL,
  spoc_whatsapp boolean DEFAULT false,
  company_profile_option text DEFAULT '',
  company_profile_file_url text,
  company_profile_link text,
  linkedin_option text DEFAULT '',
  linkedin_poc_name text,
  linkedin_poc_email text,
  website_option text DEFAULT '',
  website_admin_url text,
  website_username text,
  website_password text,
  technical_contact_name text,
  technical_contact_email text,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES onboarding_submissions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding_submissions
CREATE POLICY "Anyone can insert onboarding submissions"
  ON onboarding_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read onboarding submissions"
  ON onboarding_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for email_accounts
CREATE POLICY "Anyone can insert email accounts"
  ON email_accounts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read email accounts"
  ON email_accounts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('onboarding-files', 'onboarding-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for file uploads
CREATE POLICY "Anyone can upload files"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'onboarding-files');

CREATE POLICY "Anyone can view files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'onboarding-files');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_onboarding_submissions_updated_at
  BEFORE UPDATE ON onboarding_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();