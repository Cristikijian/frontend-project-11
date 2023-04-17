// Import our custom CSS
import '../scss/styles.scss';
import 'bootstrap/js/src/modal';

import onChange from 'on-change';
import * as yup from 'yup';
import { setLocale } from 'yup';

import { uniqBy } from 'lodash';

import render from './view';
import parser from './parser';
import getFeed from './getFeed';

const app = (i18) => {
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

  elements.feedsCard.append(elements.feedsCardBody);
  elements.feedsCard.classList.add('card', 'border-0');
  elements.feedsCardBody.append(elements.feedsCardTitle);
  elements.feedsCardBody.classList.add('card-body');
  elements.feedsContainer.append(elements.feedsCard);
  elements.feedsCard.append(elements.feedsListGroup);
  elements.feedsCardTitle.classList.add('card-title', 'h4');
  elements.feedsListGroup.classList.add('list-group', 'border-0', 'rounded-0');

  elements.postsCard.append(elements.postsCardBody);
  elements.postsCard.classList.add('card', 'border-0');
  elements.postsCardBody.append(elements.postsCardTitle);
  elements.postsCardBody.classList.add('card-body');
  elements.postsContainer.append(elements.postsCard);
  elements.postsCard.append(elements.postsListGroup);
  elements.postsCardTitle.classList.add('card-title', 'h4');
  elements.postsListGroup.classList.add('list-group', 'border-0', 'rounded-0');

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
      clickedLinksIds: [],
      modal: {
        title: '',
        body: '',
        link: '',
        id: '',
      },
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

  elements.modal.addEventListener('click', (e) => {
    watchedState.uiState.clickedLinksIds.push(e.target.id);
  });

  elements.postsListGroup.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const { postId } = e.target.dataset;

      const post = watchedState.posts.find(({ id }) => id === postId);

      watchedState.uiState.modal = {
        body: post.description,
        title: post.title,
        link: post.link,
        id: post.id,
      };
      watchedState.uiState.clickedLinksIds.push(postId);
    }
    if (e.target.tagName === 'A') {
      watchedState.uiState.clickedLinksIds.push(e.target.id);
    }
  });

  const validate = (field) => yup.string().trim().required().url()
    .notOneOf(watchedState.existedUrls)
    .validate(field);

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
        // eslint-disable-next-line no-console
        console.error(err);
        if (errorCb) errorCb(err);
      })
      .finally(() => {
        setTimeout(() => updatePosts(url), 5000);
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
        updatePosts(
          validUrl,
          () => {
            watchedState.isLoading = false;
            watchedState.form.state = 'success';
            watchedState.existedUrls.push(validUrl);
          },
          (err) => {
            watchedState.isLoading = false;
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

export default app;
