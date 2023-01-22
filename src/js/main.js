// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import { Button } from 'bootstrap';

import onChange from 'on-change';
import *as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/index.js';
import render from './view';


const app = async() => {
    const defaultLanguage = 'ru';

    const i18nInstance = i18n.createInstance();
    await i18nInstance.init({
        lng: defaultLanguage,
        debug: false,
        resources,
    });

    const state = {
        formProcess: {
            state: 'filling',
            error: null,
        },
        loadingProcess: {
            state: 'initial',
            error: null,
        },
        posts: [],
    };


    const schema = yup.string().trim().required().url().notOneOf(existedUrls, url);

    const validate = async(field) => {
        return schema.validate(field).then().catch();
    };

    const elements = {
        formEl: document.querySelector('form'),
        postsContainer: document.querySelector('.container-xxl'),
    };

    elements.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const existedUrls = [];
        if(validate(existedUrls, url).then()) {
            elements.formEl.classList.add('is-invalid');
        }; //создать список существующих 
    });

    elements.posts.container.addEventListener('click', (e) => {

    });

    // const watchedState = onChange(state, (path, value, previousValue) => {
    //     render(watchedState, elements, i18nInstance);
    //   });
}

export default app;