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
    form: 'filling',
    existedUrls: [],
    feeds: [],
    posts: [],
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
  });

  const updatePosts = (url, successCb, errorCb) => {
    getFeed(url)
      .then((result) => {
        if (result.error) {
          throw new Error(result.error);
        }

        return parser(result.data);
      })
      .then((doc) => {
        const posts = doc.querySelectorAll('item');
        watchedState.feeds = uniqBy([...watchedState.feeds, createFeed(doc, url)], 'link');
        watchedState.posts = uniqBy([...watchedState.posts, ...createPosts(posts)], 'link');

        if (successCb) {
          successCb();
        }

        setTimeout(() => updatePosts(url), 5000);
      })
      .catch((err) => {
        if (errorCb) errorCb(err);
      });
  };

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    i18nInstance.t('notUrl');
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validate(url)
      .then((validUrl) => {
        watchedState.existedUrls.push(validUrl);
        updatePosts(
          validUrl,
          () => { watchedState.form = 'success'; },
          (err) => {
            watchedState.form = 'failed';
            elements.feedback.textContent = i18nInstance.t(err.message);
          },
        );
      })
      .catch((err) => {
        watchedState.form = 'failed';
        elements.feedback.textContent = err.errors.map((errorKey) => i18nInstance.t(errorKey)).join('\n');
      });
  });
};

app();

export default app;
