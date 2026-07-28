/**
 * Privacy Policy content for the Hustle App.
 *
 * Source: https://hustleapp.io/privacy-policy.html
 *
 * Rendered by LegalPage.jsx as a structured, scroll-tracked document.
 * Each section carries a stable `id` used for the table-of-contents anchors
 * and the scroll-spy highlight. `blocks` describe the body content:
 *   - { type: 'p',  text }            → paragraph
 *   - { type: 'ul', items: [...] }     → bullet list
 *   - { type: 'contacts', items: [...] } → contact rows ({ label, email })
 */

export const privacyPolicyMeta = {
  title: 'Privacy Policy',
  effectiveDate: 'June 22, 2026',
  intro:
    'This Privacy Policy explains how Hustle Innovations LLC and Hustle Global Technologies Limited (together, “Hustle”, “we”, “us”) collect, use, store, share, retain, and protect personal information across the Hustle platform at hustleapp.io. It reflects our commitment to handling your information responsibly and, where applicable, in line with Ghana’s Data Protection Act, 2012 (Act 843) and other mandatory local laws.',
}

/** Summary cards shown above the full document. */
export const privacyPolicyHighlights = [
  {
    number: '01',
    title: 'Data collected',
    text: 'Identity, contact, account, transaction, device, verification, compliance, and support information.',
  },
  {
    number: '02',
    title: 'Why it is used',
    text: 'Account management, bookings, verification, payments, safety, fraud prevention, compliance, and support.',
  },
  {
    number: '03',
    title: 'User rights',
    text: 'Users may request access, correction, deletion/blocking where applicable, and consent withdrawal where allowed.',
  },
]

export const privacyPolicySections = [
  {
    id: 'section-1',
    number: 1,
    title: 'Who This Policy Applies To',
    blocks: [
      {
        type: 'p',
        text: 'This Privacy Policy applies to Clients, Service Providers, website visitors, app users, prospective users, and business contacts whose information flows through the Hustle platform. It governs platform operations conducted in Ghana as well as other jurisdictions where Hustle operates, subject to mandatory local laws.',
      },
    ],
  },
  {
    id: 'section-2',
    number: 2,
    title: 'Who Controls Your Information',
    blocks: [
      {
        type: 'p',
        text: 'Within the United States, Hustle Innovations LLC is the entity responsible for controlling your personal information. Outside the United States, Hustle Global Technologies Limited manages or jointly processes information for non-U.S. markets, including Ghana.',
      },
    ],
  },
  {
    id: 'section-3',
    number: 3,
    title: 'Information Hustle Collects',
    blocks: [
      { type: 'p', text: 'Depending on how you interact with Hustle, we may collect the following categories of personal data:' },
      {
        type: 'ul',
        items: [
          'Identity information — names, dates of birth, profile photos, government ID details, and professional credentials.',
          'Contact information — email addresses, phone numbers, physical addresses, and emergency contacts.',
          'Account and profile data — service categories, qualifications, skills, licenses, ratings, and reviews.',
          'Transaction and payment information — booking history, invoices, bank details, and billing information.',
          'Device and usage data — IP addresses, browser types, device identifiers, and location information.',
          'Verification and compliance data — identity materials, tax information, and insurance records.',
          'Communications and support — platform messages, customer support requests, and survey responses.',
        ],
      },
    ],
  },
  {
    id: 'section-4',
    number: 4,
    title: 'How Hustle Collects Information',
    blocks: [
      {
        type: 'p',
        text: 'We collect information directly from you when you register, complete your profile, book or deliver services, contact support, or upload documents. We also collect information automatically through cookies, analytics technologies, device data, and usage logs.',
      },
      {
        type: 'p',
        text: 'In addition, we may receive information about you from third-party sources such as payment processors, identity verification providers, and public records, where permitted by law.',
      },
    ],
  },
  {
    id: 'section-5',
    number: 5,
    title: 'Why Hustle Uses Personal Information',
    blocks: [
      { type: 'p', text: 'We use personal information for purposes that include:' },
      {
        type: 'ul',
        items: [
          'Managing accounts and profiles.',
          'Matching Clients with Service Providers and facilitating bookings.',
          'Verifying identity and meeting compliance obligations.',
          'Providing customer support and maintaining safety on the platform.',
          'Detecting and preventing fraud and abuse.',
          'Complying with legal and regulatory requirements.',
          'Improving the platform through analytics, and sending service-related communications and marketing where lawfully permitted.',
        ],
      },
    ],
  },
  {
    id: 'section-6',
    number: 6,
    title: 'Operations in Ghana',
    blocks: [
      {
        type: 'p',
        text: 'Where personal information is processed in Ghana, we acknowledge that the Data Protection Act, 2012 (Act 843) governs that processing. Organisations processing personal data are expected to register with the Data Protection Commission, renew registration periodically, and appoint and train a data protection supervisor.',
      },
    ],
  },
  {
    id: 'section-7',
    number: 7,
    title: 'Disclosure and Dissemination of Client Information',
    blocks: [
      { type: 'p', text: 'Hustle does not sell personal information as an independent data commodity. We share information only as necessary, including with:' },
      {
        type: 'ul',
        items: [
          'Service Providers and Clients, to enable bookings, delivery, and communication.',
          'Payment processors and financial partners.',
          'Identity verification, insurance, and analytics vendors.',
          'Professional advisers, auditors, and insurers.',
          'Regulators and law enforcement, when legally required.',
          'Potential buyers or merger partners in the context of a corporate transaction.',
        ],
      },
    ],
  },
  {
    id: 'section-8',
    number: 8,
    title: 'Cross-Border Transfers',
    blocks: [
      {
        type: 'p',
        text: 'Your personal information may be accessed, processed, or stored outside Ghana, including in the United States or in other jurisdictions where our service providers operate. By using the platform, you acknowledge that such transfers may occur, subject to reasonable security safeguards and contractual protections where required.',
      },
    ],
  },
  {
    id: 'section-9',
    number: 9,
    title: 'Data Retention',
    blocks: [
      {
        type: 'p',
        text: 'We retain personal information only for as long as reasonably necessary to provide the platform, maintain accounts, resolve disputes, comply with legal obligations, and preserve security. Specific retention periods vary by data type and apply to active accounts, transaction records, and communications, and deletion requests are honoured subject to applicable legal exceptions.',
      },
    ],
  },
  {
    id: 'section-10',
    number: 10,
    title: 'User Rights',
    blocks: [
      {
        type: 'p',
        text: 'Subject to applicable law, you may request access to your personal data, correction of inaccurate data, deletion or blocking of data, and withdrawal of consent. Ghana’s Data Protection Commission states that data subjects have rights to be informed, to access their personal data, and to request rectification.',
      },
    ],
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Security',
    blocks: [
      {
        type: 'p',
        text: 'We implement reasonable technical, administrative, and organizational safeguards — including access controls, encryption, secure storage, and incident response procedures — to protect personal information. However, no method of transmission or storage is completely secure.',
      },
    ],
  },
  {
    id: 'section-12',
    number: 12,
    title: 'Cookies and Similar Technologies',
    blocks: [
      {
        type: 'p',
        text: 'We use cookies, SDKs, pixels, and local storage to support website and app operation, remember preferences, analyse traffic, and maintain security. Where required by law, we obtain consent before using non-essential tracking technologies.',
      },
    ],
  },
  {
    id: 'section-13',
    number: 13,
    title: "Children's Privacy",
    blocks: [
      {
        type: 'p',
        text: 'The platform is not intended for children, and we do not knowingly collect personal information from individuals below the age permitted under applicable law. If such information is collected inadvertently, we will take steps to delete it.',
      },
    ],
  },
  {
    id: 'section-14',
    number: 14,
    title: 'Third-Party Services and Links',
    blocks: [
      {
        type: 'p',
        text: 'Hustle is not responsible for the privacy, security, or data-handling practices of third parties. We encourage you to review the privacy policies of any third-party services or websites you access through the platform.',
      },
    ],
  },
  {
    id: 'section-15',
    number: 15,
    title: 'Policy Updates',
    blocks: [
      {
        type: 'p',
        text: 'Hustle may update this Privacy Policy from time to time to reflect legal, technical, and operational changes. Material modifications will be communicated through the website, app, or email, in accordance with legal requirements.',
      },
    ],
  },
  {
    id: 'section-16',
    number: 16,
    title: 'Contact and Complaints',
    blocks: [
      {
        type: 'p',
        text: 'Questions or complaints about this Privacy Policy or our handling of personal information may be directed to the contacts published below. Individuals in Ghana may also have the right to lodge a complaint with the Ghana Data Protection Commission.',
      },
    ],
  },
  {
    id: 'section-17',
    number: 17,
    title: 'Contact Block',
    blocks: [
      { type: 'p', text: 'You can reach the relevant Hustle teams at:' },
      {
        type: 'contacts',
        items: [
          { label: 'Privacy', email: 'privacy@hustleapp.io' },
          { label: 'Legal', email: 'legal@hustleapp.io' },
          { label: 'Support', email: 'support@hustleapp.io' },
          { label: 'Ghana Operations', email: 'letshustle@hustleapp.io' },
          { label: 'Data Protection Lead', email: 'Juliana@hustleapp.io' },
        ],
      },
    ],
  },
]
