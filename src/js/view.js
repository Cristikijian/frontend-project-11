import onChange from 'on-change';

const renderFeed = (elements, feed) => {
      // elements.feedsContainer.append(elements.feedsCaption);
      console.log(elements);

      elements.listGroup.innerHTML = `<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${feed.title}</h3>
      <p class="m-0 small text-black-50">${feed.description}</p>
      </li>` + elements.listGroup.innerHTML;
      elements.cardTitle.textContent = 'Фиды';
};

const render = ({path, value, state, i18: i18nInstance, elements}) => {
  console.log(path, value);

  const renderForm = () => {
      return i18nInstance.t('');
  };

  switch(path) {
    case 'exictedUrls': 
      return;
    case 'feeds': {
        renderFeed(elements, value[value.length - 1]);
        break;
    }

    case 'form': {
        renderForm();
        break;
    }

    default:
        return;
};
};
export default render;


// feedsCaption: '<div class="card-body"><h2 class="card-title h4">Фиды</h2></div>',

// container.innerHTML = '';
//   const buttons = state.posts.map(()=> {});
//   container.append(...buttons);