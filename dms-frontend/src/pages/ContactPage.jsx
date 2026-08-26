import { Icon } from "../components/Icon.jsx";

const CONTACT = {
  product: "AEGIS",
  fullName: "AI Enhanced Governance & Information System",
  developer: "Aditya Ranjan Nayak",
  email: "aditya17072004@gmail.com",
  linkedIn: "https://www.linkedin.com/in/adityaranjannayak",
};

export function ContactPage() {
  return <div className="page contact-page"><div className="page-intro"><div><span className="eyebrow">ABOUT THE WORKSPACE</span><h1>AEGIS, with a human point of contact.</h1><p>Learn more about the platform and connect with the developer responsible for its continued evolution.</p></div><div className="intro-index">AEGIS<span>CONTACT / ABOUT</span></div></div><section className="contact-layout"><div className="content-panel contact-overview"><span className="aegis-mark contact-mark"><Icon name="lock" size={24} /></span><span className="eyebrow">{CONTACT.product}</span><h2>{CONTACT.fullName}</h2><p>AEGIS is a secure, role-aware document management system designed for governed access, controlled collaboration, and AI-assisted information retrieval.</p><div className="contact-principles"><span><Icon name="lock" size={15} />Secure by design</span><span><Icon name="users" size={15} />Permission-aware</span><span><Icon name="spark" size={15} />Contextual intelligence</span></div></div><div className="content-panel contact-card"><span className="eyebrow">DEVELOPER</span><h2>{CONTACT.developer}</h2><p>For product questions, implementation feedback, or collaboration inquiries, use one of the channels below.</p><a className="contact-link" href={`mailto:${CONTACT.email}`}><span className="contact-link-icon"><Icon name="mail" size={17} /></span><span><small>Email</small><strong>{CONTACT.email}</strong></span><Icon name="arrow" size={16} /></a><a className="contact-link" href={CONTACT.linkedIn} target="_blank" rel="noreferrer"><span className="contact-link-icon"><Icon name="link" size={17} /></span><span><small>LinkedIn</small><strong>linkedin.com/in/adityaranjannayak</strong></span><Icon name="arrow" size={16} /></a></div></section></div>;
}
