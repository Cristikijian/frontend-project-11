// Import our custom CSS
import '../scss/styles.scss';
import 'bootstrap/js/src/modal';

import onChange from 'on-change';
import * as yup from 'yup';
import { setLocale } from 'yup';
import { uniqBy, uniqueId } from 'lodash';
import i18n from 'i18next';
import resources from '../locales/index';

import { render, initRender } from './view';
import parse from './parse';
import getFeed from './getFeed';

const elements = {
  formEl: document.querySelector('form'),
  addBtn: document.querySelector('form button'),
  input: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  feedsCard: document.createElement('div'),
  feedsCardBody: document.createElement('div'),
  feedsCardTitle: document.createElement('h2'),
  feedsListGroup: document.createElement('ul'),
  postsCard: document.createElement('div'),
  postsCardBody: document.createElement('div'),
  postsCardTitle: document.createElement('h2'),
  postsListGroup: document.createElement('ul'),
  modal: document.getElementById('modal'),
};

const TIMEOUT = 5000;

const app = () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then((i18) => {
    initRender(elements);

    const state = {
      isLoading: false,
      form: {
        state: 'filling',
        error: null,
      },
      existedUrls: [],
      feeds: [],
      posts: [],
      uiState: {
        clickedLinksIds: new Set(),
        selectedPostId: null,
      },
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
        path, value, state, i18, elements,
      });
    });

    elements.input.addEventListener('input', () => {
      if (watchedState.form.error) {
        watchedState.form.error = null;
        watchedState.form.state = 'filling';
      }
    });

    elements.postsListGroup.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const { postId } = e.target.dataset;

        watchedState.uiState.selectedPostId = postId;
        watchedState.uiState.clickedLinksIds.add(postId);
      }
      if (e.target.tagName === 'A') {
        watchedState.uiState.clickedLinksIds.add(e.target.id);
      }
    });

    const validate = (field) => yup.string().trim().required().url()
      .notOneOf(watchedState.existedUrls)
      .validate(field);

    const updatePosts = (url) => {
      getFeed(url)
        .then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }
          const parsedResult = parse(result.data);

          const newPosts = parsedResult.posts.map((post) => ({
            ...post,
            id: uniqueId('post'),
          }));

          watchedState.posts = uniqBy([...watchedState.posts, ...newPosts], 'link');
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
        })
        .finally(() => setTimeout(() => updatePosts(url), TIMEOUT));
    };

    const loadPosts = (url) => {
      getFeed(url)
        .then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }
          const parsedResult = parse(result.data);

          const newFeed = {
            ...parsedResult.feed,
            id: uniqueId('feed'),
            link: url,
          };
          const newPosts = parsedResult.posts.map((post) => ({
            ...post,
            id: uniqueId('post'),
          }));

          watchedState.feeds = uniqBy([...watchedState.feeds, newFeed], 'link');
          watchedState.posts = uniqBy([...watchedState.posts, ...newPosts], 'link');

          watchedState.isLoading = false;
          watchedState.form.state = 'success';
          watchedState.existedUrls.push(url);
          setTimeout(() => updatePosts(url), TIMEOUT);
        })
        .catch((err) => {
        // eslint-disable-next-line no-console
          console.error(err);
          watchedState.isLoading = false;
          watchedState.form.state = 'failed';
          watchedState.form.error = err.message;
          console.log(err.message);
        });
    };

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.form.error = null;
      const formData = new FormData(e.target);
      const url = formData.get('url');

      validate(url)
        .then((validUrl) => {
          watchedState.isLoading = true;
          loadPosts(validUrl);
        })
        .catch((err) => {
          watchedState.form.state = 'failed';
          watchedState.form.error = err.errors.pop();
        });
    });
  });
};

export default app;
