// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import { Button } from 'bootstrap';
import uniqueId from 'lodash/uniqueId.js';
import onChange from 'on-change';
import *as yup from 'yup';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import resources from '../locales/index.js';
import render from './view';
import axios from 'axios';
import parser from './parser';


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
        feeds: [],
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
        feedsContainer: document.querySelector('.feeds'),
        postsContainer: document.querySelector('.posts'),
        feedsCard: document.createElement('div'),
        cardBody: document.createElement('div'),
        cardTitle: document.createElement('h2'),
        listGroup: document.createElement('ul'),
    };

    elements.feedsCard.append(elements.cardBody);
    elements.feedsCard.classList.add('card', 'border-0');
    elements.cardBody.append(elements.cardTitle);
    elements.cardBody.classList.add('card-body');
    elements.feedsContainer.append(elements.feedsCard);
    elements.feedsCard.append(elements.listGroup);
    elements.cardTitle.classList.add('card-title', 'h4');
    elements.listGroup.classList.add('list-group', 'border-0', 'rounded-0');

    const watchedState = onChange(state, (path, value) => {
        render({
            path, value, state, i18: i18nInstance, elements
        })
    });

    elements.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        i18nInstance.t('notUrl');
        console.log(elements.formEl);
        const formData = new FormData(e.target);
        const url = formData.get('url');
        
        
        validate(url).then((validUrl) => {
            elements.input.classList.remove('is-invalid');
            elements.input.classList.add('is-valid');
            elements.feedback.classList.remove('text-danger');
            elements.feedback.classList.add('text-success');
            state.existedUrls.push(validUrl);
            elements.feedback.textContent = i18nInstance.t('successLoad');
            elements.input.value = '';
            elements.input.focus();
            return validUrl;
        })
        .catch((err) =>{
            elements.input.classList.add('is-invalid');
            elements.feedback.classList.add('text-danger');
            elements.feedback.textContent = err.errors.map((errorKey) => i18nInstance.t(errorKey)).join("\n");
            console.log(state.existedUrls);
        })
        .then((validUrl) => {
            return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`)
        })
        .then(response => {
            return response.data.contents;
          })
        .then(parser)
        .then((parsedResult) => {
            const doc = parsedResult.documentElement;
            const feedTitle = doc.querySelector('channel title');
            const feedDescription = doc.querySelector('channel description');
            const posts = doc.querySelectorAll('item');

            console.log(doc, feedTitle, posts);

            watchedState.feeds.push({
                id: uniqueId('feed'),
                title: feedTitle.textContent,
                description: feedDescription.textContent,
                posts: [...posts].map((post) => {
                    return {
                        id: uniqueId('post'),
                        title: post.querySelector('title').textContent,
                        link: post.querySelector('link').textContent,
                    }
                })
            });
            console.log(state.feeds);
        })
        .catch((err) => {
            console.log(err);
            if(err.request) {
                elements.input.classList.add('is-invalid');
                elements.feedback.classList.add('text-danger');
                elements.feedback.textContent = i18nInstance.t('errors.networkError');
            }
        })

    });

    elements.postsContainer.addEventListener('click', (e) => {

    });

    // const watchedState = onChange(state, (path, value, previousValue) => {
    //     render(watchedState, elements, i18nInstance);
    //   });
}

app();

export default app;