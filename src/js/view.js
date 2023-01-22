import onChange from 'on-change';

const render = (state, elements, i18nInstance) => {
  const renderPosts = () => {
      container.innerHTML = '';
  const buttons = state.posts.map(()=> {});
  container.append(...buttons);
  };

  const renderForm = () => {
      return i18nInstance.t('');
  };

  switch(state.node) {
      case 'posts': {
          renderPosts();
          break;
      }

      case 'form': {
          renderForm();
          break;
      }

      default:
          throw new Error();
  };
  
  const watchedState = onChange(state, (path, value, previousValue) => {
    render(watchedState, elements, i18nInstance);
  });

  return watchedState;
};
export default render;