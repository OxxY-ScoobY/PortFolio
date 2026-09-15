import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PERSONAL_INFO } from '../data/portfolioData';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactBento: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: '31a7ce67-5ffa-42d1-bb05-c7967e464b59',
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bento-section">
      <h2 className="bento-section-title">
        <span className="accent-dot"></span> Get in Touch
      </h2>

      <div className="bento-grid">
        {/* Direct Contact Details Bento (Span 5) */}
        <motion.div
          className="bento-card col-span-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -3 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
            Let's Build Something Exceptional
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            I am currently open to full-time engineering roles in software development, Python backend engineering, and full-stack development.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                <a href={`mailto:${PERSONAL_INFO.contact.email}`} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>
                  {PERSONAL_INFO.contact.email}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div>
                <a href={`tel:${PERSONAL_INFO.contact.phone}`} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>
                  {PERSONAL_INFO.contact.phone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</div>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{PERSONAL_INFO.contact.location}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Bento Card (Span 7) */}
        <motion.div
          className="bento-card col-span-7"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -3 }}
        >
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bento-name">Your Name</label>
              <input
                type="text"
                id="bento-name"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bento-email">Your Email</label>
              <input
                type="email"
                id="bento-email"
                name="email"
                placeholder="YourEmail@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bento-subject">Subject</label>
              <input
                type="text"
                id="bento-subject"
                name="subject"
                placeholder="Project Collaboration Inquiry"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bento-message">Message</label>
              <textarea
                id="bento-message"
                name="message"
                rows={4}
                placeholder="Tell me about your project or opportunity..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-bento-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <motion.div
            className="modal-container"
            style={{ maxWidth: '420px', textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={52} color="#10b981" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
              Message Delivered!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Thank you for reaching out! Athil Hisham will review your message and respond shortly.
            </p>
            <button className="btn-bento-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};
