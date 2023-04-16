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
    document.querySelector('.full-article').addEventListener('click', (e) => {
      const { linkId } = e.target.dataset;
      const link = document.getElementById(linkId);
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
      state.uiState.clickedLinksIds.push(linkId);
    });

    if (state.uiState.clickedLinksIds.includes(post.id)) {
      postLink.classList.add('fw-normal', 'link-secondary');
    } else {
      postLink.classList.add('fw-bold');
      postLink.rel = 'noopener noreferrer';
      postLink.target = '_blank';
    }

    btn.dataset.linkId = post.id;
    btn.dataset.bsTarget = '#modal';
    btn.dataset.bsToggle = 'modal';

    postListElement.prepend(postLink, btn);
    postLink.innerHTML = post.title;

    btn.addEventListener('click', () => {
      document.querySelector('.modal-title').textContent = post.title;
      document.querySelector('.modal-body').textContent = post.description;
      const modalBtn = document.querySelector('.full-article');
      modalBtn.href = post.link;
      modalBtn.dataset.linkId = post.id;
    });

    postLink.addEventListener('click', () => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
      state.uiState.clickedLinksIds.push(postLink.id);
    });
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

    default:
  }
};
export default render;
