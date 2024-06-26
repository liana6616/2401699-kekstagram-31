const container = document.querySelector('.pictures');
const template = document.querySelector('#picture').content.querySelector('.picture');

const clearThumbnails = () => {
  const pictureElements = document.querySelectorAll('.picture');

  pictureElements.forEach((el) => el.remove());
};

let photosList;

//cоздаем 1 фото
const renderThumbnails = (photos) => {
  clearThumbnails();
  const similarVariableLengthFragment = document.createDocumentFragment(); //интернирование метод хранения лишь одной копии из многих одинаковых объектов.
  photosList = photos;
  photos.forEach(({url, id, description, comments, likes}) => {
    const thumbnail = template.cloneNode(true);
    const image = thumbnail.querySelector('.picture__img');
    image.src = url; //Адрес изображения url подставьте как атрибут src изображения.   //по qeury селектор дописать url scr ссылку
    image.alt = description;//описание
    thumbnail.dataset.pictureId = id; //чтобы программа понимала что именно по нужному фото кликаем доб id (dataset.pictureId жту чать просто запомнить синстаксис )
    thumbnail.querySelector('.picture__comments').textContent = comments.length; //Количество комментариев comments выведите в блок .picture__comments.
    thumbnail.querySelector('.picture__likes').textContent = likes; //Количество лайков likes выведите в блок .picture__likes.
    similarVariableLengthFragment.append(thumbnail); //ретюн возврат функции выше

  });
  container.append(similarVariableLengthFragment); //закомит результат в дом

};

export { renderThumbnails, photosList };
