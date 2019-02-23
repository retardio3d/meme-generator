(function MemeMaker() {
  'use strict';

  const videoModal = document.getElementById('videoModal');
  const cancelUserMediaBtn = document.getElementById('cancelUserMediaBtn');
  const captureUserMediaBtn = document.getElementById('captureUserMediaBtn');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const canvasPlaceholder = document.getElementById('canvasPlaceholder');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('file');
  const fileInputName = document.getElementById('fileName');
  const addTextboxBtn = document.getElementById('addTextboxBtn');
  const inputsContainer = document.getElementById('inputsContainer');
  const generateMemeBtn = document.getElementById('generateMemeBtn');
  const captureMediaContainer = document.getElementById('captureMediaContainer');
  const askUserMediaBtn = document.getElementById('askUserMediaBtn');
  let selectedImage = null;

  const defaultOptions = {
    text: '',
    fillColor: '#ffffff',
    strokeColor: '#000000',
    font: 'Impact',
    fontSize: 50,
    textAlign: 'center',
    lineWidth: 3,
    offsetY: 0
  };

  const options = [Object.assign({}, defaultOptions)];

  function toggleVideoModal(visible) {
    if (visible) {
      videoModal.style.display = 'block';
      videoModal.classList.remove('fade');
    } else {
      videoModal.style.display = 'none';
      videoModal.classList.add('fade');
    }
  }

  function generateMeme() {
    return window.open().document.write(`<iframe src="${canvas.toDataURL()}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  }

  function onImageLoaded(evt) {
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 600;
    let width = evt.target.width;
    let height = evt.target.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;

    draw(evt.target);

    selectedImage = evt.target;

    generateMemeBtn.disabled = false;
    canvas.classList.remove('d-none');
    canvasPlaceholder.classList.add('d-none');
  }

  function handleFileSelect(evt) {
    const image = new Image();
    const file = evt.target.files[0];
    const reader = new FileReader();

    if (file && file.name) {
      fileInputName.textContent = file.name;
    }

    reader.addEventListener('load', function (evt) {
      const data = evt.target.result;
      image.addEventListener('load', onImageLoaded);
      image.src = data;
    });

    reader.readAsDataURL(file);
  }

  function requestGetUserMedia() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(stream => {
      toggleVideoModal(true);
      video.srcObject = stream;
    }).catch(error => {
      alert(error);
    });
  }

  function handleCaptureMedia() {
    toggleVideoModal(false);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.addEventListener('load', onImageLoaded);
    image.src = canvas.toDataURL();

    selectedImage = video;
    draw(selectedImage);
  }

  function handleTextPropChange(element, index, prop) {
    options[index][prop] = element.value;
    draw(selectedImage);
  }

  function createNewInput(index) {
    const inputTemplate =`
      <div class="d-flex">
        <input class="form-control m-2" type="text" data-index="${index}" data-input="text" autocomplete="off" placeholder="Text #${index + 1}" style="min-width: 0;">
        <div class="d-flex align-items-center pr-2">
          <input class="form-control" type="color" value="${options[index].fillColor}" data-index="${index}" data-input="fillColor" title="Fill color">
          <input class="form-control" type="color" value="${options[index].strokeColor}" data-index="${index}" data-input="strokeColor" title="Outline color">
          <button class="btn btn-secondary settings-button" data-index=${index} data-button="settings"></button>
        </div>
      </div>
      <div class="p-2 d-none" data-section="settings_${index}">
        <div class="form-row">
          <div class="col-lg-6 mb-3">
            <label class="mb-1">Font: </label>
            <select class="custom-select" data-input="font" data-index="${index}">
              <option value="Impact">Impact</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Times">Times</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Palatino">Palatino</option>
              <option value="Garamond">Garamond</option>
              <option value="Bookman">Bookman</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Arial Black">Arial Black</option>
            </select>
          </div>
          <div class="col-lg-6 mb-3">
            <label class="mb-1">Font size: </label>
            <input class="form-control" type="number" min="1" max="100" value="${options[index].fontSize}" data-input="fontSize" data-index="${index}">
          </div>
        </div>
        <div class="form-row">
          <div class="col-lg-6 mb-3">
            <label class="mb-1">Outline width: </label>
            <input class="form-control" type="number" min="0" max="10" value="${options[index].lineWidth}" data-input="lineWidth" data-index="${index}">
          </div>
          <div class="col-lg-6 mb-3">
            <label class="mb-1">Text align: </label>
            <select class="custom-select" data-input="textAlign" data-index="${index}">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="col-lg-6 mb-3">
            <label class="mb-1">Top offset: </label>
            <input class="form-control" type="number" value="${options[index].offsetY}" data-input="offsetY" data-index="${index}">
          </div>
        </div>
      </div>
    `;

    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    div.className = 'bg-light';
    div.setAttribute('data-section', `textBox_${index}`);
    div.innerHTML = inputTemplate;
    setTimeout(() => {
      selectedImage && div.querySelector('[data-input="text"]').focus();
    }, 100);
    div.querySelector('[data-input="font"]').value = options[index].font;
    div.querySelector('[data-input="textAlign"]').value = options[index].textAlign;
    return fragment.appendChild(div);
  }

  function onAddTextboxBtnClicked() {
    const textBoxesLength = document.querySelectorAll('[data-input="text"]').length;
    options.push(Object.assign({}, defaultOptions));
    inputsContainer.appendChild(createNewInput(textBoxesLength));
  }

  function draw(image) {
    if (image == null) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    options.forEach(function (item, index) {
      ctx.font = `${item.fontSize || 50}px ${item.font || 'Impact'}`;

      const multiplier = index + 1;
      const lineHeight = ctx.measureText('M').width + 20;
      const xPos = item.textAlign === 'center' || !item.textAlign ? canvas.width / 2 : item.textAlign === 'left' ? 0 : canvas.width;
      const lineWidth = !Number.isNaN(Number(item.lineWidth)) ? Number(item.lineWidth) : 3;

      ctx.fillStyle = item.fillColor || 'white';
      ctx.strokeStyle = item.strokeColor || 'black';
      ctx.textAlign = item.textAlign || 'center';
      ctx.fillText(item.text || '', xPos, lineHeight * multiplier + Number(item.offsetY));

      if (lineWidth !== 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeText(item.text || '', xPos, lineHeight * multiplier + Number(item.offsetY));
      }
    });
  }

  fileInput.addEventListener('change', handleFileSelect, false);

  askUserMediaBtn.addEventListener('click', requestGetUserMedia, false);

  cancelUserMediaBtn.addEventListener('click', () => {
    toggleVideoModal(false);
    video.srcObject = null;
  }, false);

  captureUserMediaBtn.addEventListener('click', handleCaptureMedia, false);

  addTextboxBtn.addEventListener('click', onAddTextboxBtnClicked, false);

  generateMemeBtn.addEventListener('click', generateMeme, false);

  inputsContainer.appendChild(createNewInput(0));

  inputsContainer.addEventListener('input', evt => {
    const element = evt.target;
    const index = Number(element.getAttribute('data-index'));
    let prop;

    if (element.matches('[data-input="text"]')) {
      prop = 'text';
    } else if (element.matches('[data-input="fillColor"]')) {
      prop = 'fillColor';
    } else if (element.matches('[data-input="strokeColor"]')) {
      prop = 'strokeColor';
    } else if (element.matches('[data-input="font"]')) {
      prop = 'font';
    } else if (element.matches('[data-input="fontSize"]')) {
      prop = 'fontSize';
    } else if (element.matches('[data-input="textAlign"]')) {
      prop = 'textAlign';
    } else if (element.matches('[data-input="lineWidth"]')) {
      prop = 'lineWidth';
    } else if (element.matches('[data-input="offsetY"]')) {
      prop = 'offsetY';
    }

    if (prop) {
      handleTextPropChange(element, index, prop);
    }
  }, false);

  inputsContainer.addEventListener('click', evt => {
    const element = evt.target;

    if (element.matches('[data-button="settings"]')) {
      element.classList.toggle('active');
      document.querySelector(`[data-section="settings_${evt.target.getAttribute('data-index')}"]`).classList.toggle('d-none');
    }
  }, false);

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    captureMediaContainer.classList.remove('d-none');
  }
}());
