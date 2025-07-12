
export const getSmsSettingsValue = (settings: any, key: string): string => {
  if (!settings || typeof settings !== 'object') {
    return '';
  }
  
  const value = settings[key];
  return typeof value === 'string' ? value : '';
};

export const validateSmsSettings = (settings: any): boolean => {
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  
  const username = getSmsSettingsValue(settings, 'username');
  const apiKey = getSmsSettingsValue(settings, 'apiKey');
  
  return username.length > 0 && apiKey.length > 0;
};
