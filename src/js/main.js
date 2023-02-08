// Import our custom CSS
import '../scss/styles.scss';

// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';

import onChange from 'on-change';
import * as yup from 'yup';
import { setLocale } from 'yup';
import i18n from 'i18next';
import { uniqBy } from 'lodash';
import resources from '../locales/index';
import render from './view';
import parser from './parser';
import getFeed from './getFeed';
import createFeed from './createFeed';
import createPosts from './createPosts';
import elements from './domElements';

const app = async () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const state = {
    isValid: false,

    form:
      'filling',

    loadingProcess: {
      state: 'initial',
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
      path, value, state, i18: i18nInstance,
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

  const validation = (url) => validate(url)
    .then((validUrl) => {
      watchedState.existedUrls.push(validUrl);
      watchedState.isValid = true;
      return validUrl;
    })
    .catch((err) => {
      console.log(err.errors);
      watchedState.form = 'failed';
      watchedState.isValid = false;
      elements.feedback.textContent = err.errors.map((errorKey) => i18nInstance.t(errorKey)).join('\n');
      return Promise.reject();
    });

  const updatePosts = (url) => {
    setTimeout(() => getFeed(url)
      .then((response) => parser(response.data.contents))
      .then((data) => {
        const newPosts = data.querySelectorAll('item');
        watchedState.posts = uniqBy([...watchedState.posts, ...createPosts(newPosts)], 'link');
        updatePosts(url);
      }), 5000);
  };

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    i18nInstance.t('notUrl');
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validation(url)
      .then(getFeed)
      .then((response) => {
        watchedState.loadingProcess.state = 'success';
        watchedState.form = 'success';
        watchedState.loadingProcess.data = response.data.contents;
        return response.data.contents;
      })
      .catch((err) => {
        watchedState.loadingProcess.state = 'failed';
        watchedState.form = 'failed';
        watchedState.loadingProcess.error = 'error';
        let errorName = '';
        if (err.response) {
          errorName = 'errors.responseErr';
        } else if (err.request) {
          errorName = 'networkError';
        }
        elements.feedback.textContent = i18nInstance.t(errorName);
        return Promise.reject();
      })
      .then(parser)
      .catch(() => {
        elements.feedback.textContent = i18nInstance.t('errors.parserError');
        return Promise.reject();
      })
      .then((doc) => {
        const posts = doc.querySelectorAll('item');
        watchedState.feeds.push(createFeed(doc, url));
        watchedState.posts = [...watchedState.posts, ...createPosts(posts)];
      })
      .then(updatePosts(url));
  });
};

app();

export default app;
