import { isEscapeKey } from './modal-photo.js';
import { isHashtagValid, getTextErrorMessage } from './valid-hashtag.js';
import { onEffectChange } from './effects-slider.js';
import { sendData } from './api.js';
import { submitBtnText, disabledBtn, enableBtn, handleSuccessMessage, handleErrorMessage } from './notification-module.js';
import { addScalesListeners, removeScalesListeners, resetScale } from './scale-step.js';
import { showErrorMessage } from './notification-module.js';

const FILE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.jfif', '.svg'];

const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('.img-upload__input');
const bodyPage = document.querySelector('body');
const uploadFile = document.querySelector('#upload-file'); //id
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancelBtn = document.querySelector('#upload-cancel');
const hashtagInput = uploadForm.querySelector('.text__hashtags');
const commentInput = uploadForm.querySelector('.text__description');
const imgUploadEffects = uploadForm.querySelector('.img-upload__effects');
const imgUploadPreview = uploadForm.querySelector('.img-upload__preview img');
const uploadEffectPreview = uploadForm.querySelectorAll('.effects__preview');
const imgUploadEffectLevel = uploadForm.querySelector('.img-upload__effect-level');

//валидация хэштегов
const pristine = new Pristine(uploadForm,{
  classTo: 'img-upload__field-wrapper', // Эл д/добавления классов
  errorTextClass: 'img-upload__field-wrapper--error', //класс д/эл с ошибкой
  errorTextParent: 'img-upload__field-wrapper', //куда выодится текст с ошибкой
  errorTextTag: 'div', //обрамляет текст с ошибкой
});

const onPhotoCancelBtnClick = () => {//выз колбэк closePhotoEditor- делает обратное доб все удаляет
  closePhotoEditor();
};

const onDocumentKeydown = (evt) => {
  if(isEscapeKey(evt)) { //проврка что именно esc
    evt.preventDefault();
    if(document.activeElement === hashtagInput || document.activeElement === commentInput) {
      evt.stopPropagation(); //помогает предотвратить активацию событий на родительских элементах после того, как они сработали на дочернем элементе.
    } else {
      uploadForm.reset();//сброс значения формы
      closePhotoEditor(); //вызываем то что до ()
    }
  }
};

function initUploadModal () {
  uploadFile.addEventListener('change', () => { //изменяем событие инпута через прослушиватель событий ''
    uploadOverlay.classList.remove('hidden');
    bodyPage.classList.add('modal-open');
    uploadCancelBtn.addEventListener('click', onPhotoCancelBtnClick);
    document.addEventListener('keydown', onDocumentKeydown);
    addScalesListeners();

  });
}

//ф закрытия модального окна
function closePhotoEditor () {
  uploadOverlay.classList.add('hidden');//когда случается удаляет hidden
  bodyPage.classList.remove('modal-open'); //вешает на body класс
  document.removeEventListener('keydown', onDocumentKeydown);
  uploadCancelBtn.removeEventListener('click', onPhotoCancelBtnClick); //кнопка на ней событие
  imgUploadEffectLevel.classList.add('hidden');
  imgUploadPreview.style.filter = 'none';
  uploadFile.value = '';
  pristine.reset();
  uploadForm.reset();
  resetScale();
  if (closePhotoEditor) {
    imgUploadPreview.style.transform = 'none';
    removeScalesListeners();
  } else if (initUploadModal()) {
    addScalesListeners();
  }
}

//загрузка только изображения
const onFileInputChange = () => {
  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    const fileName = file.name.toLowerCase();
    const matches = FILE_TYPES.some((item) => fileName.endsWith(item));//через массив разрешенных разрешений

    if (matches) {
      const url = URL.createObjectURL(file);
      imgUploadPreview.src = url;
      uploadEffectPreview.forEach((item) => {
        item.style.backgroundImage = `url(${url})`;
      });
    } else {
      showErrorMessage('Неверный тип файла');
      return;
    }
    initUploadModal();
  });
};

//кол-во символов коменнтария не должен превышать 140
pristine.addValidator(commentInput, (value) => {
  const isCorrectLength = value.length <= 140; //(текущая длина)
  return isCorrectLength;
}, 'Длина комментария не может превышать 140 символов.');

//Добавляем слушатель на форму, при неправильно введённых значениях в форму, отправить невозможно
const sendFormData = (onSuccess) => {//передаём ('событие', функцию)
  uploadForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    if (pristine.validate()) {
      disabledBtn(submitBtnText.SENDING);
      hashtagInput.value = hashtagInput.value.trim().replaceAll(/\s+/g, ' ');
      sendData(new FormData(evt.target))
        .then(() => {
          onSuccess ();
          handleSuccessMessage();
        })
        .catch(() => {
          handleErrorMessage();
        })
        .finally(() => {
          enableBtn(submitBtnText.IDLE);//устанавливаем текст кнопки
        });
    }
  });
};

const onFormSubmit = (evt) => {
  evt.preventDefault();
  sendFormData(evt.target);
};

pristine.addValidator(hashtagInput, isHashtagValid, getTextErrorMessage);
imgUploadEffects.addEventListener('change', onEffectChange);
uploadForm.addEventListener('submit', onFormSubmit);

export { sendFormData, closePhotoEditor, onFileInputChange, onDocumentKeydown, initUploadModal };
