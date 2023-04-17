import i18n from 'i18next';
import app from './main';
import resources from '../locales/index';

const init = () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });
};

init().then(app);
