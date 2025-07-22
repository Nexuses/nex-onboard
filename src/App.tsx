import React, { useState } from 'react';
import { supabase, uploadFile, saveOnboardingSubmission, saveEmailAccounts, sendNotificationEmail, type OnboardingSubmission } from './lib/supabase';
import { 
  Building2, 
  Mail, 
  Users, 
  FileText, 
  Share2, 
  Globe, 
  MessageSquare,
  CheckCircle2,
  Upload,
  Link,
  User,
  Phone,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface FormData {
  // Step 1: Firm Details
  firmName: string;
  website: string;
  country: string;
  
  // Step 2: Email IDs
  emails: Array<{
    name: string;
    email: string;
    password: string;
  }>;
  
  // Step 3: Do Not Contact
  doNotContactOption: 'upload' | 'link' | 'review' | '';
  doNotContactFile: File | null;
  doNotContactLink: string;
  
  // Step 4: Leadership Contacts
  managingPartner: {
    name: string;
    phone: string;
    email: string;
    whatsappGroup: boolean;
  };
  spoc: {
    name: string;
    phone: string;
    email: string;
    whatsappGroup: boolean;
  };
  
  // Step 5: Company Profile
  companyProfileOption: 'upload' | 'link' | '';
  companyProfileFile: File | null;
  companyProfileLink: string;
  
  // Step 6: LinkedIn Access
  linkedinOption: 'access' | 'poc' | '';
  linkedinPocName: string;
  linkedinPocEmail: string;
  
  // Step 7: Website Access
  websiteOption: 'access' | 'internal' | '';
  websiteAdminUrl: string;
  websiteUsername: string;
  websitePassword: string;
  technicalContactName: string;
  technicalContactEmail: string;
  
  // Step 8: Additional Notes
  additionalNotes: string;
}

const RSMOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firmName: '',
    website: '',
    country: '',
    emails: [
      { name: '', email: '', password: '' },
      { name: '', email: '', password: '' },
      { name: '', email: '', password: '' }
    ],
    doNotContactOption: '',
    doNotContactFile: null,
    doNotContactLink: '',
    managingPartner: {
      name: '',
      phone: '',
      email: '',
      whatsappGroup: false
    },
    spoc: {
      name: '',
      phone: '',
      email: '',
      whatsappGroup: false
    },
    companyProfileOption: '',
    companyProfileFile: null,
    companyProfileLink: '',
    linkedinOption: '',
    linkedinPocName: '',
    linkedinPocEmail: '',
    websiteOption: '',
    websiteAdminUrl: '',
    websiteUsername: '',
    websitePassword: '',
    technicalContactName: '',
    technicalContactEmail: '',
    additionalNotes: ''
  });

  const totalSteps = 8;

  const steps = [
    { number: 1, title: 'Firm Details', icon: Building2 },
    { number: 2, title: 'Email IDs', icon: Mail },
    { number: 3, title: 'Do Not Contact', icon: Users },
    { number: 4, title: 'Leadership', icon: User },
    { number: 5, title: 'Company Profile', icon: FileText },
    { number: 6, title: 'LinkedIn Access', icon: Share2 },
    { number: 7, title: 'Website Access', icon: Globe },
    { number: 8, title: 'Additional Notes', icon: MessageSquare }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEmailData = (index: number, field: string, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    updateFormData('emails', newEmails);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let logoUrl = '';
      let doNotContactFileUrl = '';
      let companyProfileFileUrl = '';
      
      // Upload logo if provided
      if (logoFile) {
        const logoPath = `logos/${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadFile(logoFile, 'onboarding-files', logoPath);
      }
      
      // Upload do not contact file if provided
      if (formData.doNotContactFile) {
        const doNotContactPath = `do-not-contact/${Date.now()}-${formData.doNotContactFile.name}`;
        doNotContactFileUrl = await uploadFile(formData.doNotContactFile, 'onboarding-files', doNotContactPath);
      }
      
      // Upload company profile file if provided
      if (formData.companyProfileFile) {
        const companyProfilePath = `company-profiles/${Date.now()}-${formData.companyProfileFile.name}`;
        companyProfileFileUrl = await uploadFile(formData.companyProfileFile, 'onboarding-files', companyProfilePath);
      }
      
      // Prepare submission data
      const submissionData: OnboardingSubmission = {
        firm_name: formData.firmName,
        website: formData.website,
        country: formData.country,
        logo_url: logoUrl,
        do_not_contact_option: formData.doNotContactOption,
        do_not_contact_file_url: doNotContactFileUrl,
        do_not_contact_link: formData.doNotContactLink,
        managing_partner_name: formData.managingPartner.name,
        managing_partner_phone: formData.managingPartner.phone,
        managing_partner_email: formData.managingPartner.email,
        managing_partner_whatsapp: formData.managingPartner.whatsappGroup,
        spoc_name: formData.spoc.name,
        spoc_phone: formData.spoc.phone,
        spoc_email: formData.spoc.email,
        spoc_whatsapp: formData.spoc.whatsappGroup,
        company_profile_option: formData.companyProfileOption,
        company_profile_file_url: companyProfileFileUrl,
        company_profile_link: formData.companyProfileLink,
        linkedin_option: formData.linkedinOption,
        linkedin_poc_name: formData.linkedinPocName,
        linkedin_poc_email: formData.linkedinPocEmail,
        website_option: formData.websiteOption,
        website_admin_url: formData.websiteAdminUrl,
        website_username: formData.websiteUsername,
        website_password: formData.websitePassword,
        technical_contact_name: formData.technicalContactName,
        technical_contact_email: formData.technicalContactEmail,
        additional_notes: formData.additionalNotes
      };
      
      // Save submission to database
      const savedSubmission = await saveOnboardingSubmission(submissionData);
      
      // Save email accounts
      const emailAccounts = formData.emails
        .filter(email => email.name && email.email && email.password)
        .map(email => ({
          submission_id: savedSubmission.id,
          name: email.name,
          email: email.email,
          password: email.password
        }));
      
      if (emailAccounts.length > 0) {
        await saveEmailAccounts(emailAccounts);
      }
      
      // Send notification email
      const notificationData = {
        firmName: formData.firmName,
        website: formData.website,
        country: formData.country,
        managingPartner: {
          name: formData.managingPartner.name,
          email: formData.managingPartner.email,
          phone: formData.managingPartner.phone
        },
        spoc: {
          name: formData.spoc.name,
          email: formData.spoc.email,
          phone: formData.spoc.phone
        },
        emails: formData.emails.filter(email => email.name && email.email)
      };
      
      // Try to send notification email (non-blocking)
      try {
        await sendNotificationEmail(notificationData);
      } catch (emailError) {
        console.warn('Email notification failed, but form was saved successfully:', emailError);
        // Continue with success - don't fail the entire submission
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setLogo(null);
    setLogoFile(null);
    setFormData({
      firmName: '',
      website: '',
      country: '',
      emails: [
        { name: '', email: '', password: '' },
        { name: '', email: '', password: '' },
        { name: '', email: '', password: '' }
      ],
      doNotContactOption: '',
      doNotContactFile: null,
      doNotContactLink: '',
      managingPartner: {
        name: '',
        phone: '',
        email: '',
        whatsappGroup: false
      },
      spoc: {
        name: '',
        phone: '',
        email: '',
        whatsappGroup: false
      },
      companyProfileOption: '',
      companyProfileFile: null,
      companyProfileLink: '',
      linkedinOption: '',
      linkedinPocName: '',
      linkedinPocEmail: '',
      websiteOption: '',
      websiteAdminUrl: '',
      websiteUsername: '',
      websitePassword: '',
      technicalContactName: '',
      technicalContactEmail: '',
      additionalNotes: ''
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Onboarding Form Submitted!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Thank you for providing the necessary information. We will be in touch shortly and start the campaigns.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions, feel free to contact:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-gray-900">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Neeraj Naval</span>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a 
                    href="mailto:neeraj@nexuses.in" 
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    neeraj@nexuses.in
                  </a>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a 
                    href="tel:+919717689152" 
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    +91 9717689152
                  </a>
                </div>
              </div>
            </div>
            
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Submit Another Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Name
              </label>
              <input
                type="text"
                value={formData.firmName}
                onChange={(e) => updateFormData('firmName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter firm name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter country"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Please provide 3 official email IDs for outreach purposes.
            </p>
            
            {formData.emails.map((email, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Email {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={email.name}
                      onChange={(e) => updateEmailData(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email.email}
                      onChange={(e) => updateEmailData(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={email.password}
                      onChange={(e) => updateEmailData(index, 'password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="doNotContact"
                  value="upload"
                  checked={formData.doNotContactOption === 'upload'}
                  onChange={(e) => updateFormData('doNotContactOption', e.target.value)}
                  className="text-blue-600"
                />
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Upload "Do Not Contact" list file</span>
              </label>
              
              {formData.doNotContactOption === 'upload' && (
                <div className="ml-8">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt"
                    onChange={(e) => updateFormData('doNotContactFile', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: CSV, Excel, TXT
                  </p>
                </div>
              )}
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="doNotContact"
                  value="link"
                  checked={formData.doNotContactOption === 'link'}
                  onChange={(e) => updateFormData('doNotContactOption', e.target.value)}
                  className="text-blue-600"
                />
                <Link className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Share link to "Do Not Contact" list</span>
              </label>
              
              {formData.doNotContactOption === 'link' && (
                <div className="ml-8">
                  <input
                    type="url"
                    value={formData.doNotContactLink}
                    onChange={(e) => updateFormData('doNotContactLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://docs.google.com/spreadsheets/..."
                  />
                </div>
              )}
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="doNotContact"
                  value="review"
                  checked={formData.doNotContactOption === 'review'}
                  onChange={(e) => updateFormData('doNotContactOption', e.target.value)}
                  className="text-blue-600"
                />
                <Users className="w-5 h-5 text-gray-500" />
                <div className="text-gray-900">
                  <div>Review prospect list before outreach</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Before initiating outreach, Nexuses will share the full prospect list for your review, and I will flag any companies I do not wish you to contact.
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Managing Partner</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.managingPartner.name}
                    onChange={(e) => updateFormData('managingPartner', { ...formData.managingPartner, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.managingPartner.phone}
                    onChange={(e) => updateFormData('managingPartner', { ...formData.managingPartner, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.managingPartner.email}
                  onChange={(e) => updateFormData('managingPartner', { ...formData.managingPartner, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.managingPartner.whatsappGroup}
                  onChange={(e) => updateFormData('managingPartner', { ...formData.managingPartner, whatsappGroup: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include in campaign-related WhatsApp group</span>
              </label>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SPOC (Single Point of Contact)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.spoc.name}
                    onChange={(e) => updateFormData('spoc', { ...formData.spoc, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.spoc.phone}
                    onChange={(e) => updateFormData('spoc', { ...formData.spoc, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.spoc.email}
                  onChange={(e) => updateFormData('spoc', { ...formData.spoc, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.spoc.whatsappGroup}
                  onChange={(e) => updateFormData('spoc', { ...formData.spoc, whatsappGroup: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include in campaign-related WhatsApp group</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="companyProfile"
                  value="upload"
                  checked={formData.companyProfileOption === 'upload'}
                  onChange={(e) => updateFormData('companyProfileOption', e.target.value)}
                  className="text-blue-600"
                />
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Upload company profile file</span>
              </label>
              
              {formData.companyProfileOption === 'upload' && (
                <div className="ml-8">
                  <input
                    type="file"
                    accept=".ppt,.pptx,.pdf,.doc,.docx"
                    onChange={(e) => updateFormData('companyProfileFile', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PPT, PDF, DOC (Max 10MB)
                  </p>
                </div>
              )}
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="companyProfile"
                  value="link"
                  checked={formData.companyProfileOption === 'link'}
                  onChange={(e) => updateFormData('companyProfileOption', e.target.value)}
                  className="text-blue-600"
                />
                <Link className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Share link to company profile</span>
              </label>
              
              {formData.companyProfileOption === 'link' && (
                <div className="ml-8">
                  <input
                    type="url"
                    value={formData.companyProfileLink}
                    onChange={(e) => updateFormData('companyProfileLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/company-profile"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="linkedin"
                  value="access"
                  checked={formData.linkedinOption === 'access'}
                  onChange={(e) => updateFormData('linkedinOption', e.target.value)}
                  className="text-blue-600"
                />
                <Share2 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">LinkedIn access shared with Nexuses content manager</span>
              </label>
              
              {formData.linkedinOption === 'access' && (
                <div className="ml-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Steps to give content manager access:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Go to your LinkedIn Company Page settings</li>
                    <li>Navigate to "Admin tools" → "Page admins"</li>
                    <li>Click "Add admin" and search for: <a href="https://www.linkedin.com/in/neerajnaval/" target="_blank" rel="noopener noreferrer" className="underline font-medium">https://www.linkedin.com/in/neerajnaval/</a></li>
                    <li>Assign "Content admin" role (allows posting but not admin changes)</li>
                    <li>Send invitation and confirm access</li>
                  </ol>
                  <p className="text-xs text-blue-700 mt-3">
                    <strong>Note:</strong> Content admin role allows posting content but doesn't give access to sensitive company information or admin settings.
                  </p>
                </div>
              )}
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="linkedin"
                  value="poc"
                  checked={formData.linkedinOption === 'poc'}
                  onChange={(e) => updateFormData('linkedinOption', e.target.value)}
                  className="text-blue-600"
                />
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">LinkedIn POC assigned for content posting</span>
              </label>
              
              {formData.linkedinOption === 'poc' && (
                <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POC Name
                    </label>
                    <input
                      type="text"
                      value={formData.linkedinPocName}
                      onChange={(e) => updateFormData('linkedinPocName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter POC name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POC Email
                    </label>
                    <input
                      type="email"
                      value={formData.linkedinPocEmail}
                      onChange={(e) => updateFormData('linkedinPocEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="poc@example.com"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="website"
                  value="access"
                  checked={formData.websiteOption === 'access'}
                  onChange={(e) => updateFormData('websiteOption', e.target.value)}
                  className="text-blue-600"
                />
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Website login credentials shared with Nexuses</span>
              </label>
              
              {formData.websiteOption === 'access' && (
                <div className="ml-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin URL
                    </label>
                    <input
                      type="url"
                      value={formData.websiteAdminUrl}
                      onChange={(e) => updateFormData('websiteAdminUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/admin"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.websiteUsername}
                        onChange={(e) => updateFormData('websiteUsername', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.websitePassword}
                        onChange={(e) => updateFormData('websitePassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="website"
                  value="internal"
                  checked={formData.websiteOption === 'internal'}
                  onChange={(e) => updateFormData('websiteOption', e.target.value)}
                  className="text-blue-600"
                />
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Internal IT team will implement provided campaign page</span>
              </label>
              
              {formData.websiteOption === 'internal' && (
                <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.technicalContactName}
                      onChange={(e) => updateFormData('technicalContactName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.technicalContactEmail}
                      onChange={(e) => updateFormData('technicalContactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tech@example.com"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes and Instructions
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide any additional notes, special instructions, or specific requirements for the campaign setup..."
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Optional:</strong> Use this space to mention any specific requirements, preferences, or constraints that might help us tailor the campaign more effectively for your region.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top Logo Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo copy.png" 
            alt="RSM MENA Logo" 
            className="w-48 h-20 object-contain mx-auto mb-2"
          />
        </div>
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="w-full text-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                RSM MENA Client Onboarding Form
              </h1>
              <p className="text-gray-600">
                Risk Advisory and Cyber Awareness Campaign Setup
              </p>
            </div>
            
            {logo && (
              <div className="absolute top-6 right-6">
                <img src={logo} alt="Client Logo" className="w-12 h-12 object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="text-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors
                    ${isCompleted ? 'bg-green-100 text-green-600' : 
                      isCurrent ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`text-xs ${isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1]?.title}
            </h2>
          </div>
          
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-md transition-colors
              ${currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          {currentStep === totalSteps ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Form</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSMOnboardingForm;