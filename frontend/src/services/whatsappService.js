// whatsappService.js - Service d'envoi WhatsApp automatisé via Twilio API
// Compatible Vercel - Clés configurables via Admin ou variables d'environnement
// IMPORTANT: L'envoi WhatsApp via Twilio nécessite un compte Twilio avec WhatsApp activé

// === CONFIGURATION PAR DÉFAUT ===
const DEFAULT_CONFIG = {
  accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID || '',
  authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN || '',
  fromNumber: process.env.REACT_APP_TWILIO_WHATSAPP_FROM || '', // Format: +14155238886 (sans 'whatsapp:')
  apiMode: 'twilio' // 'twilio' ou 'meta' (pour futur support Meta Business API)
};

// Clé localStorage pour la configuration admin
const WHATSAPP_CONFIG_KEY = 'afroboost_whatsapp_config';

/**
 * Récupère la configuration WhatsApp (localStorage > env vars)
 */
export const getWhatsAppConfig = () => {
  try {
    const stored = localStorage.getItem(WHATSAPP_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      if (config.accountSid && config.authToken && config.fromNumber) {
        return config;
      }
    }
  } catch (e) {
    console.error('Error reading WhatsApp config:', e);
  }
  return DEFAULT_CONFIG;
};

/**
 * Sauvegarde la configuration WhatsApp dans localStorage
 */
export const saveWhatsAppConfig = (config) => {
  try {
    localStorage.setItem(WHATSAPP_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving WhatsApp config:', e);
    return false;
  }
};

/**
 * Vérifie si WhatsApp API est configuré
 */
export const isWhatsAppConfigured = () => {
  const config = getWhatsAppConfig();
  return !!(config.accountSid && config.authToken && config.fromNumber);
};

/**
 * Formate un numéro de téléphone au format E.164
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 */
export const formatPhoneE164 = (phone) => {
  if (!phone) return '';
  // Supprimer tous les caractères non numériques sauf +
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Ajouter + si absent et commence par un indicatif pays
  if (!cleaned.startsWith('+')) {
    // Supposer Suisse (+41) si pas d'indicatif
    if (cleaned.startsWith('0')) {
      cleaned = '+41' + cleaned.substring(1);
    } else if (cleaned.length > 10) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+41' + cleaned;
    }
  }
  return cleaned;
};

/**
 * Envoie un message WhatsApp via Twilio API
 * @param {Object} params - Paramètres du message
 * @param {string} params.to - Numéro de téléphone du destinataire
 * @param {string} params.message - Corps du message
 * @param {string} [params.mediaUrl] - URL du média (image/vidéo)
 * @param {string} [params.contactName] - Nom du contact pour personnalisation
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendWhatsAppMessage = async (params) => {
  const config = getWhatsAppConfig();
  
  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    throw new Error('WhatsApp API non configuré. Veuillez configurer les clés dans l\'onglet Campagnes.');
  }

  const toNumber = formatPhoneE164(params.to);
  if (!toNumber || toNumber.length < 10) {
    return { success: false, error: 'Numéro de téléphone invalide' };
  }

  // Personnaliser le message avec le prénom
  let personalizedMessage = params.message;
  if (params.contactName) {
    const firstName = params.contactName.split(' ')[0];
    personalizedMessage = params.message.replace(/{prénom}/gi, firstName);
  }

  // Construire les données du formulaire
  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${formatPhoneE164(config.fromNumber)}`);
  formData.append('To', `whatsapp:${toNumber}`);
  formData.append('Body', personalizedMessage);
  
  // Ajouter le média si présent
  if (params.mediaUrl) {
    formData.append('MediaUrl', params.mediaUrl);
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio API error:', data);
      return { 
        success: false, 
        error: data.message || `HTTP ${response.status}`,
        code: data.code
      };
    }

    return { 
      success: true, 
      sid: data.sid,
      status: data.status
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoie des messages WhatsApp en masse avec progression
 * @param {Array} recipients - Liste des destinataires [{phone, name}]
 * @param {Object} campaign - Données de la campagne {message, mediaUrl}
 * @param {Function} onProgress - Callback de progression (current, total, status, name)
 * @returns {Promise<Object>} Résultats {sent, failed, errors}
 */
export const sendBulkWhatsApp = async (recipients, campaign, onProgress) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
    details: []
  };

  const total = recipients.length;

  if (!isWhatsAppConfigured()) {
    return {
      ...results,
      failed: total,
      errors: ['WhatsApp API non configuré']
    };
  }

  // Envoyer les messages un par un avec délai
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    if (onProgress) {
      onProgress(i + 1, total, 'sending', recipient.name || recipient.phone);
    }

    try {
      const result = await sendWhatsAppMessage({
        to: recipient.phone,
        message: campaign.message,
        mediaUrl: campaign.mediaUrl,
        contactName: recipient.name
      });

      if (result.success) {
        results.sent++;
        results.details.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'sent',
          sid: result.sid
        });
      } else {
        results.failed++;
        results.errors.push(`${recipient.phone}: ${result.error}`);
        results.details.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: result.error
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${recipient.phone}: ${error.message}`);
      results.details.push({
        phone: recipient.phone,
        name: recipient.name,
        status: 'failed',
        error: error.message
      });
    }

    // Délai entre les envois (500ms) pour éviter le rate limiting Twilio
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'completed');
  }

  return results;
};

/**
 * Teste la configuration WhatsApp en envoyant un message de test
 * @param {string} testPhone - Numéro de téléphone de test
 * @returns {Promise<Object>} Résultat du test
 */
export const testWhatsAppConfig = async (testPhone) => {
  return sendWhatsAppMessage({
    to: testPhone,
    message: '🎉 Test Afroboost WhatsApp API!\n\nVotre configuration Twilio fonctionne correctement.',
    contactName: 'Test'
  });
};

export default {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  isWhatsAppConfigured,
  formatPhoneE164,
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  testWhatsAppConfig
};
