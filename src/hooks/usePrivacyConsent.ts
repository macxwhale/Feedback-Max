
import { useState, useEffect } from 'react';

export const usePrivacyConsent = () => {
  const [hasConsented, setHasConsented] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('feedback-privacy-consent');
    if (consent === 'true') {
      setHasConsented(true);
      setShowPrivacyNotice(false);
    }
  }, []);

  const acceptPrivacy = () => {
    localStorage.setItem('feedback-privacy-consent', 'true');
    setHasConsented(true);
    setShowPrivacyNotice(false);
  };

  return {
    hasConsented,
    showPrivacyNotice,
    acceptPrivacy
  };
};
