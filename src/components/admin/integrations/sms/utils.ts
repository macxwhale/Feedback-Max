
// Helper function to safely access sms_settings properties
export const getSmsSettingsValue = (smsSettings: any, key: string): string => {
  if (smsSettings && typeof smsSettings === 'object' && !Array.isArray(smsSettings)) {
    return smsSettings[key] || '';
  }
  return '';
};
