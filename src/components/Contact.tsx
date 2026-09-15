import React, { useState } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
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
    <section id="contact" className="contact-section scroll-reveal">
      <div className="section-header">
        <h2 className="section-title">Get in Touch</h2>
        <div className="section-divider"></div>
      </div>

      <div className="contact-grid">
        <div className="contact-details scroll-reveal-item">
          <h3>Contact Information</h3>
          <p className="contact-pitch">
            I am currently looking for full-time opportunities as a Software Developer, Python Developer,
            Backend Developer, or Full-Stack Developer. Feel free to reach out via email, phone, or LinkedIn!
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Mail size={20} />
              </div>
              <div>
                <h4>Email</h4>
                <a href={`mailto:${PERSONAL_INFO.contact.email}`}>{PERSONAL_INFO.contact.email}</a>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Phone size={20} />
              </div>
              <div>
                <h4>Phone</h4>
                <a href={`tel:${PERSONAL_INFO.contact.phone}`}>{PERSONAL_INFO.contact.phone}</a>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h4>Location</h4>
                <p>{PERSONAL_INFO.contact.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper scroll-reveal-item">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="form-name">Name</label>
              <input
                type="text"
                id="form-name"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="form-email">Email</label>
              <input
                type="email"
                id="form-email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="form-subject">Subject</label>
              <input
                type="text"
                id="form-subject"
                name="subject"
                placeholder="Collaboration Inquiry"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="form-message">Message</label>
              <textarea
                id="form-message"
                name="message"
                rows={5}
                placeholder="Tell me about your project..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay active" style={{ display: 'flex' }}>
          <div className="modal-container success-modal-content">
            <div className="success-icon-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={48} color="#27c93f" />
            </div>
            <h2>Message Sent Successfully!</h2>
            <p>Thank you for reaching out, Athil Hisham will get back to you shortly.</p>
            <button
              className="btn btn-primary success-ok-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
