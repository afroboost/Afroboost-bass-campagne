// emailService.js - Service d'envoi d'emails automatisés via EmailJS
// Compatible Vercel - Configuration stockée dans MongoDB
import emailjs from '@emailjs/browser';

// API URL
const API = process.env.REACT_APP_BACKEND_URL || '';

// === CONFIGURATION CACHE ===
let cachedConfig = null;

/**
 * Récupère la configuration EmailJS depuis MongoDB
 */
export const getEmailJSConfig = async () => {
  try {
    const response = await fetch(`${API}/api/emailjs-config`);
    if (response.ok) {
      cachedConfig = await response.json();
      return cachedConfig;
    }
  } catch (e) {
    console.error('Error fetching EmailJS config:', e);
  }
  return { serviceId: '', templateId: '', publicKey: '' };
};

/**
 * Récupère la configuration EmailJS synchrone (depuis cache)
 */
export const getEmailJSConfigSync = () => {
  return cachedConfig || { serviceId: '', templateId: '', publicKey: '' };
};

/**
 * Sauvegarde la configuration EmailJS dans MongoDB
 */
export const saveEmailJSConfig = async (config) => {
  try {
    const response = await fetch(`${API}/api/emailjs-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (response.ok) {
      cachedConfig = await response.json();
      return true;
    }
  } catch (e) {
    console.error('Error saving EmailJS config:', e);
  }
  return false;
};

/**
 * Vérifie si EmailJS est configuré
 */
export const isEmailJSConfigured = () => {
  const config = cachedConfig || { serviceId: '', templateId: '', publicKey: '' };
  return !!(config.serviceId && config.templateId && config.publicKey);
};

/**
 * Initialise EmailJS avec la clé publique
 */
export const initEmailJS = () => {
  const config = cachedConfig || { publicKey: '' };
  if (config.publicKey) {
    emailjs.init(config.publicKey);
    return true;
  }
  return false;
};

/**
 * Envoie un email à un destinataire unique
 */
export const sendEmail = async (params) => {
  const config = cachedConfig || await getEmailJSConfig();
  
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    throw new Error('EmailJS non configuré. Veuillez configurer les clés dans l\'onglet Campagnes.');
  }

  // Personnaliser le message avec le prénom
  let personalizedMessage = params.message;
  if (params.to_name) {
    const firstName = params.to_name.split(' ')[0];
    personalizedMessage = params.message.replace(/{prénom}/gi, firstName);
  }

  // Ajouter le média au message si présent
  const fullMessage = params.media_url 
    ? `${personalizedMessage}\n\n🔗 Voir le visuel: ${params.media_url}`
    : personalizedMessage;

  const templateParams = {
    to_email: params.to_email,
    to_name: params.to_name || 'Client',
    subject: params.subject || 'Afroboost - Message',
    message: fullMessage,
    from_name: 'Afroboost',
    reply_to: 'contact.artboost@gmail.com'
  };

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS send error:', error);
    return { success: false, error: error.text || error.message };
  }
};

/**
 * Envoie des emails en masse avec progression
 */
export const sendBulkEmails = async (recipients, campaign, onProgress) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
    details: []
  };

  const total = recipients.length;

  // Charger la config si pas en cache
  if (!cachedConfig) {
    await getEmailJSConfig();
  }

  // Initialiser EmailJS
  if (!initEmailJS()) {
    return {
      ...results,
      failed: total,
      errors: ['EmailJS non configuré']
    };
  }

  // Envoyer les emails un par un avec délai
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    if (onProgress) {
      onProgress(i + 1, total, 'sending', recipient.name || recipient.email);
    }

    try {
      const result = await sendEmail({
        to_email: recipient.email,
        to_name: recipient.name,
        subject: campaign.name,
        message: campaign.message,
        media_url: campaign.mediaUrl
      });

      if (result.success) {
        results.sent++;
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: 'sent'
        });
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: 'failed',
          error: result.error
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${recipient.email}: ${error.message}`);
      results.details.push({
        email: recipient.email,
        name: recipient.name,
        status: 'failed',
        error: error.message
      });
    }

    // Délai entre les envois (200ms)
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'completed');
  }

  return results;
};

/**
 * Teste la configuration EmailJS
 */
export const testEmailJSConfig = async (testEmail) => {
  return sendEmail({
    to_email: testEmail,
    to_name: 'Test',
    subject: 'Test EmailJS - Afroboost',
    message: '🎉 Félicitations ! Votre configuration EmailJS fonctionne correctement.'
  });
};

export default {
  getEmailJSConfig,
  getEmailJSConfigSync,
  saveEmailJSConfig,
  isEmailJSConfigured,
  initEmailJS,
  sendEmail,
  sendBulkEmails,
  testEmailJSConfig
};
