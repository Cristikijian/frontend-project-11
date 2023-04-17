/* eslint-disable no-param-reassign */

const renderFeeds = (feeds, i18, elements) => {
  elements.feedsListGroup.innerHTML = feeds.reduce((result, feed) => {
    // eslint-disable-next-line no-param-reassign
    result += `
      <li class="list-group-item border-0 border-end-0">
        <h3 class="h6 m-0">${feed.title}</h3>
        <p class="m-0 small text-black-50">${feed.description}</p>
      </li>
    `;
    return result;
  }, '');
  elements.feedsCardTitle.textContent = i18('feeds');
};

const renderModal = (state) => {
  const {
    id, title, body, link,
  } = state.uiState.modal;
  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body').textContent = body;
  const modalBtn = document.querySelector('.full-article');
  modalBtn.href = link;
  modalBtn.dataset.linkId = id;
};

const renderPosts = (posts, i18, state, elements) => {
  const items = posts.map((post) => {
    const postListElement = document.createElement('li');
    const btn = document.createElement('button');
    const postLink = document.createElement('a');

    postListElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    btn.innerHTML = i18('btn');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.type = 'button';

    postLink.id = post.id;
    postLink.href = post.link;
    btn.dataset.postId = post.id;
    btn.dataset.bsTarget = '#modal';
    btn.dataset.bsToggle = 'modal';

    postListElement.prepend(postLink, btn);
    postLink.innerHTML = post.title;
    postLink.rel = 'noopener noreferrer';
    postLink.target = '_blank';

    if (state.uiState.clickedLinksIds.includes(post.id)) {
      postLink.classList.add('fw-normal', 'link-secondary');
    } else {
      postLink.classList.add('fw-bold');
    }
    return postListElement;
  });

  elements.postsListGroup.replaceChildren(...items);
  elements.postsCardTitle.textContent = i18('posts');
};

const renderForm = (state, i18, elements) => {
  switch (state.form.state) {
    case 'success': {
      elements.input.classList.remove('is-invalid');
      elements.input.classList.add('is-valid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18('successLoad');
      elements.input.value = '';
      elements.input.focus();
      break;
    }

    case 'failed': {
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      break;
    }

    case 'filling': {
      elements.input.classList.remove('is-invalid');
      break;
    }

    default:
  }
};

const render = ({
  path, value, state, i18, elements,
}) => {
  switch (path) {
    case 'feeds': {
      renderFeeds(value, i18, elements);
      break;
    }
    case 'posts': {
      renderPosts(value, i18, state, elements);
      break;
    }
    case 'form.state': {
      renderForm(state, i18, elements);
      break;
    }
    case 'form.error': {
      elements.feedback.textContent = state.form.error;
      break;
    }
    case 'isLoading': {
      elements.input.disabled = state.isLoading;
      elements.addBtn.disabled = state.isLoading;
      break;
    }
    case 'uiState.modal': {
      renderModal(state);
      break;
    }

    case 'uiState.clickedLinksIds': {
      const currentLink = document.getElementById(value[value.length - 1]);
      currentLink.classList.remove('fw-bold');
      currentLink.classList.add('fw-normal', 'link-secondary');
      break;
    }

    default:
  }
};
export default render;
