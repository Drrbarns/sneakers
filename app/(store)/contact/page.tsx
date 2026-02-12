'use client';

import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { supabase } from '@/lib/supabase';

interface TeamContact {
  name: string;
  phone: string;
  role: string;
}

export default function ContactPage() {
  usePageTitle('Contact Adjetman Sneakers – Sizes, Orders & Support');
  const { getSetting, getSettingJSON } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { getToken, verifying } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    const isHuman = await getToken('contact');
    if (!isHuman) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }
    try {
      await supabase.from('contact_submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', payload: formData }),
      }).catch(() => {});
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactEmail = getSetting('contact_email') || '233isrealadjetey@gmail.com';
  const contactPhone = getSetting('contact_phone') || '+233 53 471 2925';
  const contactAddress = getSetting('contact_address') || 'Accra, Ghana';
  const heroTitle = getSetting('contact_hero_title') || 'Get in touch';
  const heroSubtitle =
    getSetting('contact_hero_subtitle') ||
    'Need help with sizes, styling, orders or delivery? We’re here to help you get the right pair and the right fit.';
  const contactHours = getSetting('contact_hours') || 'Mon–Fri, 8am–6pm GMT';
  const contactMapLink = getSetting('contact_map_link') || 'https://maps.google.com';
  const teamContacts = getSettingJSON<TeamContact[]>('contact_team_json', []);

  const contactMethods = [
    {
      icon: 'ri-phone-line',
      title: 'Call us',
      value: contactPhone,
      link: `tel:${contactPhone.replace(/\s/g, '')}`,
      description: contactHours,
    },
    {
      icon: 'ri-mail-line',
      title: 'Email',
      value: contactEmail,
      link: `mailto:${contactEmail}`,
      description: 'We reply within 24 hours',
    },
    {
      icon: 'ri-whatsapp-line',
      title: 'WhatsApp',
      value: contactPhone,
      link: `https://wa.me/233${contactPhone.replace(/\D/g, '').replace(/^0/, '')}`,
      description: 'Chat with us',
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Visit',
      value: contactAddress,
      link: contactMapLink,
      description: 'Mon–Sat, 9am–6pm',
    },
  ];

  const faqs = [
    {
      question: 'What are your delivery times?',
      answer:
        'Standard delivery is 2–5 business days. Express options are available for next-day delivery in major cities.',
    },
    {
      question: 'Do you ship internationally?',
      answer:
        'We currently ship within Ghana only. We plan to expand to neighbouring countries soon.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept mobile money (MTN, Vodafone, AirtelTigo) and card payments via our secure Moolre gateway.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2 text-center">
          Contact
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Reach us your way
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target={method.link.startsWith('http') ? '_blank' : '_self'}
              rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
              className="rounded-2xl border border-emerald-50 bg-emerald-50/40 p-5 sm:p-6 hover:border-emerald-200 transition-colors"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <i className={`${method.icon} text-lg`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
              <p className="text-emerald-700 font-medium text-sm mb-0.5">{method.value}</p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </a>
          ))}
        </div>

        {teamContacts.length > 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 sm:p-8 mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reach our team</h3>
            <p className="text-sm text-gray-600 mb-6">Call or WhatsApp any of us</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamContacts.map((contact: TeamContact, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-emerald-50 bg-white p-4 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <i className="ri-user-line text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                      {contact.role && (
                        <p className="text-xs text-emerald-600">{contact.role}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium text-sm mb-3">{contact.phone}</p>
                  <div className="flex gap-2 mt-auto">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700"
                    >
                      <i className="ri-phone-line" /> Call
                    </a>
                    <a
                      href={`https://wa.me/233${String(contact.phone).replace(/\D/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-700"
                    >
                      <i className="ri-whatsapp-line" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          <div className="rounded-2xl border border-emerald-50 bg-gray-50/50 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send a message</h3>
            <p className="text-sm text-gray-600 mb-6">
              Fill in the form and we’ll get back to you as soon as we can.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Order, product question, etc."
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                  placeholder="How can we help?"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
              </div>
              {submitStatus === 'success' && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">
                  <i className="ri-check-line mr-2" />
                  Message sent. We’ll respond within 24 hours.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  <i className="ri-error-warning-line mr-2" />
                  Something went wrong. Try again or contact us by phone/WhatsApp.
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || verifying}
                className="w-full rounded-xl bg-emerald-600 text-white py-3.5 font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || verifying
                  ? verifying
                    ? 'Verifying...'
                    : 'Sending...'
                  : 'Send message'}
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick answers</h3>
            <p className="text-sm text-gray-600 mb-6">
              Common questions before you reach out.
            </p>
            <div className="space-y-3 mb-8">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="rounded-xl border border-emerald-50 bg-emerald-50/30 overflow-hidden"
                >
                  <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:bg-emerald-50/50 text-sm sm:text-base">
                    {faq.question}
                  </summary>
                  <div className="px-4 pb-3 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-950 text-white p-6 sm:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <i className="ri-customer-service-2-line text-2xl" />
              </div>
              <h4 className="text-lg font-bold mb-2">Need immediate help?</h4>
              <p className="text-emerald-100 text-sm mb-6">
                We’re available {contactHours}. For urgent issues, WhatsApp is fastest.
              </p>
              <a
                href={`https://wa.me/233${contactPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-900 px-6 py-3 text-sm font-semibold hover:bg-emerald-50"
              >
                <i className="ri-whatsapp-line text-lg" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gray-50 py-10 sm:py-14 border-t border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2">
            Visit us
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Prefer to shop in person?
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mb-4">
            Drop by our store. Our team can help with sizing, styling and any questions.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-600 text-sm">
            <span className="inline-flex items-center gap-2">
              <i className="ri-map-pin-2-line text-emerald-600" />
              {contactAddress}
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="ri-time-line text-emerald-600" />
              Mon–Sat: 9am–6pm
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
