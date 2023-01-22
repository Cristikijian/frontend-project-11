// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import { Button } from 'bootstrap';

import onChange from 'on-change';
import *as yup from 'yup';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import resources from '../locales/index.js';
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
        existedUrls: [],
        posts: [],
    };

    setLocale({
        mixed: {
          notOneOf: 'errors.urlExist',
          
        },
        string: {
            url: 'errors.notUrl',
        }
    });

    const validate = (field) => {
        return yup.string().trim().required().url().notOneOf(state.existedUrls).validate(field);
    };
    
    const elements = {
        formEl: document.querySelector('form'),
        postsContainer: document.querySelector('.container-xxl'),
        input: document.getElementById('url-input'),
        feedback: document.querySelector('.feedback'),
    };

    elements.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        i18nInstance.t('notUrl');
        console.log(elements.formEl);
        const formData = new FormData(e.target);
        const url = formData.get('url');
        
        
        validate(url).then((validUrl) => {
            elements.input.classList.add('is-valid');
            elements.feedback.classList.remove('text-danger');
            elements.feedback.classList.add('text-success');
            state.existedUrls.push(url);
            elements.feedback.textContent = i18nInstance.t('successLoad');
            elements.input.value = '';
            elements.input.focus();
        })
        .catch((err) =>{
            elements.input.classList.add('is-invalid');
            elements.feedback.classList.add('text-danger');
            elements.feedback.textContent = err.errors.map((errorKey) => i18nInstance.t(errorKey)).join("\n");
            console.log(state.existedUrls);
        });
        
    });

    elements.postsContainer.addEventListener('click', (e) => {

    });

    // const watchedState = onChange(state, (path, value, previousValue) => {
    //     render(watchedState, elements, i18nInstance);
    //   });
}

app();

export default app;