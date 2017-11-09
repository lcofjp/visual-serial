import { localizationData } from './setup';

// Export Constants
export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE';

export function switchLanguage(newLang) {
  return {
    type: SWITCH_LANGUAGE,
    ...localizationData[newLang],
  };
}
