import { enabledLanguages, localizationData } from './setup';
import { SWITCH_LANGUAGE } from './IntlActions';

const initLocale = (global.navigator && global.navigator.language || 'en').slice(0,2);

const initialState = {
  locale: initLocale,
  enabledLanguages,
  ...(localizationData[initLocale] || {}),
};

const IntlReducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_LANGUAGE: {
      const { type, ...actionWithoutType } = action; // eslint-disable-line
      return { ...state, ...actionWithoutType };
    }

    default:
      return state;
  }
};

export default IntlReducer;
