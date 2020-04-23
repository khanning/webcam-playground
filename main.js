let drawing = false;
let capturing = false;
let removalThreshold = 20;
let videoDevices = [];
let orientation = null;

let camWidth = 0;
let camHeight = 0;

let imageCaptureData = null;

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function init() {
    const wrapperDiv = document.getElementById('wrapper');
    const startBtn = document.getElementById('start-button');
    const colorBox = document.getElementById('color-box');
    const slider = document.getElementById('slider');
    const deviceDropdown = document.getElementById('device-select');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = 400;
    canvas.width = window.innerWidth;
    canvas.onmousedown = (event) => {
      if (event.button !== 0 || !imageCaptureData) return;
      let pixel = ((event.offsetY * canvas.width) + event.offsetX) * 4;
      selectedColor = [imageCaptureData[pixel], imageCaptureData[pixel+1], imageCaptureData[pixel+2]];
      removeColor();
    };

    const video = document.createElement('video');
    video.style.display = 'none';
    video.style.maxHeight = '400px';
    video.autoplay = true;

    wrapperDiv.appendChild(canvas);
    wrapperDiv.appendChild(video);

    startBtn.onclick = (event) => {
      if (capturing) {
        video.pause();

        if (orientation !== null && orientation === 0) {
          let tmp = camHeight;
          camHeight = camWidth;
          camWidth = tmp;
        }

        if (camWidth > camHeight) { //Landscape
          let widthRatio = canvas.width / camWidth;
          let heightRatio = canvas.height / camHeight;
          if (widthRatio < heightRatio) {
            ctx.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
          } else {
            ctx.drawImage(video, (canvas.width - (camWidth * heightRatio)) / 2, 0, camWidth * heightRatio, camHeight * heightRatio);
          }
        } else { //Portrait
          let widthRatio = canvas.width / camWidth;
          let heightRatio = canvas.height / camHeight;
          if (widthRatio < heightRatio) {
            ctx.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
          } else {
            ctx.drawImage(video, Math.round((canvas.width - (camWidth * heightRatio)) / 2), 0, camWidth * heightRatio, camHeight * heightRatio);
          }
        }
        canvas.style.display = 'inline';
        video.style.display = 'none';
        startBtn.innerHTML = 'Take A Picture';
        capturing = false;
        imageCaptureData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } else {
        startCam(videoDevices[deviceDropdown.value]);
        startBtn.innerHTML = 'Capture';
        canvas.style.display = 'none';
        video.style.display = 'inline';
        capturing = true;
      }
    };

    slider.min = 1;
    slider.max = 100;
    slider.value = removalThreshold;
    slider.oninput = (event) => {
      removalThreshold = slider.value;
      removeColor();
    };

    deviceDropdown.onchange = (event) => {
      if (capturing) startCam(videoDevices[event.target.value]);
    };

    navigator.mediaDevices.enumerateDevices({video: true})
    .then(devices => {
      deviceDropdown.innerHTML = '';
      videoDevices = [];
      let devs = devices.filter(d => d.kind === 'videoinput');
      devs.forEach(d => {
        let index = videoDevices.push(d.deviceId);
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerHTML = 'Camera ' + index;
        deviceDropdown.appendChild(opt);
      });
    });

    function removeColor() {
      if (!selectedColor) return;
      let ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let px = ctxData.data;
      px.set(imageCaptureData);
      colorBox.style.backgroundColor = rgbToHex(selectedColor);
      for (let i=0; i < px.length; i+=4) {
        if (Math.abs(px[i] - selectedColor[0]) < removalThreshold &&
          Math.abs(px[i+1] - selectedColor[1]) < removalThreshold &&
          Math.abs(px[i+2] - selectedColor[2]) < removalThreshold) {
          px[i+3] = 0;
        }
      }
      ctx.putImageData(ctxData, 0, 0);
    }

    function startCam(id) {
      navigator.mediaDevices.getUserMedia({video: { deviceId: id }})
      .then((stream) => {
        let settings = stream.getVideoTracks()[0].getSettings();
        camWidth = settings.width;
        camHeight = settings.height;
        video.srcObject = stream;
      })
      .catch(err => console.log(err));
    }
}

window.onload = init;
window.addEventListener('deviceorientation', (event) => {
  orientation = window.orientation;
});
