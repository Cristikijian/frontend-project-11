// Import our custom CSS
import '../scss/styles.scss';
import 'bootstrap/js/src/modal';

import onChange from 'on-change';
import * as yup from 'yup';
import { setLocale } from 'yup';
import i18n from 'i18next';
import { uniqBy } from 'lodash';
import resources from '../locales/index';
import render from './view';
import parser from './parser';
import getFeed from './getFeed';
import elements from './domElements';

const init = () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });
};

const app = (i18) => {
  const state = {
    form: {
      state: 'filling',
      error: null,
    },
    existedUrls: [],
    feeds: [],
    posts: [],
    uiState: [],
  };

  setLocale({
    mixed: {
      notOneOf: 'errors.urlExist',

    },
    string: {
      url: 'errors.notUrl',
    },
  });

  const watchedState = onChange(state, (path, value) => {
    render({
      path, value, state, i18,
    });
  });

  const validate = (field) => yup.string().trim().required().url()
    .notOneOf(watchedState.existedUrls)
    .validate(field);

  document.querySelector('.full-article').addEventListener('click', (e) => {
    const { linkId } = e.target.dataset;
    const link = document.getElementById(linkId);
    link.classList.remove();
    link.classList.add('fw-normal', 'link-secondary');
    watchedState.uiState.push(linkId);
  });

  const updatePosts = (url, successCb, errorCb) => {
    getFeed(url)
      .then((result) => {
        if (result.error) {
          throw new Error(result.error);
        }

        return parser(result.data, url);
      })
      .then((data) => {
        watchedState.feeds = uniqBy([...watchedState.feeds, data.feed], 'link');
        watchedState.posts = uniqBy([...watchedState.posts, ...data.posts], 'link');

        if (successCb) {
          successCb();
        }
      })
      .catch((err) => {
        if (errorCb) errorCb(err);
      })
      .finally(() => setTimeout(() => updatePosts(url), 5000));
  };

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.error = null;
    i18('notUrl');
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validate(url)
      .then((validUrl) => {
        updatePosts(
          validUrl,
          () => {
            watchedState.form.state = 'success';
            watchedState.existedUrls.push(validUrl);
          },
          (err) => {
            watchedState.form.state = 'failed';
            watchedState.form.error = i18(err.message);
          },
        );
      })
      .catch((err) => {
        watchedState.form.state = 'failed';
        watchedState.form.error = err.errors.map((errorKey) => i18(errorKey)).join('\n');
      });
  });
};

init().then((i18) => app(i18));

export default app;
