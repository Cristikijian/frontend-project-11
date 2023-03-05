import elements from './domElements';

const renderFeeds = (feeds, i18) => {
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
  elements.feedsCardTitle.textContent = i18.t('feeds');
};

const renderPosts = (posts, i18) => {
  const items = posts.map((post) => {
    const postList = document.createElement('li');
    const btn = document.createElement('button');
    const postLink = document.createElement('a');

    postList.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    btn.innerHTML = i18.t('btn');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.type = 'button';

    postLink.classList.add('fw-bold');
    postLink.rel = 'noopener noreferrer';
    postLink.target = '_blank';
    postLink.id = post.id;
    postLink.href = post.link;

    btn.dataset.linkId = post.id;
    btn.dataset.bsTarget = '#modal';
    btn.dataset.bsToggle = 'modal';

    postList.prepend(postLink, btn);
    postLink.innerHTML = post.title;

    btn.addEventListener('click', () => {
      document.querySelector('.modal-title').textContent = post.title;
      document.querySelector('.modal-body').textContent = post.description;
      postLink.classList.remove('fw-bold');
      const modalBtn = document.querySelector('.full-article');
      modalBtn.href = post.link;
      modalBtn.dataset.linkId = post.id;
    });

    postLink.addEventListener('click', () => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    });
    return postList;
  });

  elements.postsListGroup.replaceChildren(...items);
  elements.postsCardTitle.textContent = i18.t('posts');
};

const renderForm = (state, i18) => {
  switch (state.form) {
    case 'success': {
      elements.input.classList.remove('is-invalid');
      elements.input.classList.add('is-valid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18.t('successLoad');
      elements.input.value = '';
      elements.input.focus();

      break;
    }

    case 'failed': {
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      break;
    }

    default:
  }
};

const render = ({
  path, value, state, i18,
}) => {
  switch (path) {
    case 'feeds': {
      renderFeeds(value, i18);
      break;
    }
    case 'posts': {
      renderPosts(value, i18);
      break;
    }
    case 'form': {
      renderForm(state, i18);
      break;
    }

    default:
  }
};
export default render;
