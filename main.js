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
    canvas.height = 200;
    canvas.width = 300;
    canvas.onmousedown = (event) => {
      if (event.button !== 0 || !imageCaptureData) return;
      let pixel = ((event.offsetY * canvas.width) + event.offsetX) * 4;
      selectedColor = [imageCaptureData[pixel], imageCaptureData[pixel+1], imageCaptureData[pixel+2]];
      removeColor();
    };

    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    canvas2.height = 200;
    canvas2.width = 300;
    canvas2.onmousedown = (event) => {
      if (event.button !== 0 || !imageCaptureData) return;
      let pixel = ((event.offsetY * canvas.width) + event.offsetX) * 4;
      selectedColor = [imageCaptureData[pixel], imageCaptureData[pixel+1], imageCaptureData[pixel+2]];
      removeColor();
    };

    const canvas3 = document.createElement('canvas');
    const ctx3 = canvas3.getContext('2d');
    canvas3.height = 200;
    canvas3.width = 300;
    canvas3.onmousedown = (event) => {
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
    wrapperDiv.appendChild(canvas2);
    wrapperDiv.appendChild(canvas3);
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
            ctx2.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
            ctx3.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
          } else {
              console.log(ctx2);
            ctx.drawImage(video, (canvas.width - (camWidth * heightRatio)) / 2, 0, camWidth * heightRatio, camHeight * heightRatio);
            ctx2.drawImage(video, (canvas.width - (camWidth * heightRatio)) / 2, 0, camWidth * heightRatio, camHeight * heightRatio);
            ctx3.drawImage(video, (canvas.width - (camWidth * heightRatio)) / 2, 0, camWidth * heightRatio, camHeight * heightRatio);
          }
        } else { //Portrait
          let widthRatio = canvas.width / camWidth;
          let heightRatio = canvas.height / camHeight;
          if (widthRatio < heightRatio) {
            ctx.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
            ctx2.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
            ctx3.drawImage(video, 0, 0, camWidth * widthRatio, camHeight * widthRatio);
          } else {
            ctx2.drawImage(video, Math.round((canvas.width - (camWidth * heightRatio)) / 2), 0, camWidth * heightRatio, camHeight * heightRatio);
            ctx.drawImage(video, Math.round((canvas.width - (camWidth * heightRatio)) / 2), 0, camWidth * heightRatio, camHeight * heightRatio);
            ctx3.drawImage(video, Math.round((canvas.width - (camWidth * heightRatio)) / 2), 0, camWidth * heightRatio, camHeight * heightRatio);
          }
        }
        canvas.style.display = 'inline';
        canvas2.style.display = 'inline';
        canvas3.style.display = 'inline';
        video.style.display = 'none';
        startBtn.innerHTML = 'Take A Picture';
        capturing = false;
        imageCaptureData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } else {
        startCam(videoDevices[deviceDropdown.value]);
        startBtn.innerHTML = 'Capture';
        canvas.style.display = 'none';
        canvas2.style.display = 'none';
        canvas3.style.display = 'none';
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

    function distance3d(r1, g1, b1, r2, g2, b2) {
      return Math.sqrt(Math.pow(r1-r2, 2) + Math.pow(g1-g2, 2) + Math.pow(b1-b2, 2));
    }

    function distanceYUV(r1, g1, b1, r2, g2, b2) {
      let r = (r1-r2) / 2;
      return Math.sqrt((2 + (r/256)) * Math.pow(r1-r2, 2) + 4 * Math.pow(g1-g2, 2) + (2 / ((255-r)/256)) * Math.pow(b1-b2, 2));
    }

    function rgbToHSL(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h*360, s, l];
    }

    function removeColor() {
      if (!selectedColor) return;
      colorBox.style.backgroundColor = rgbToHex(selectedColor);

      let ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let px = ctxData.data;
      px.set(imageCaptureData);
      for (let i=0; i < px.length; i+=4) {
        if (distance3d(selectedColor[0], selectedColor[1], selectedColor[2],
            px[i], px[i+1], px[i+2]) < removalThreshold) {
              px[i+3] = 0;
          }
      }
      ctx.putImageData(ctxData, 0, 0);
      ctx.font = "14px Arial";
      ctx.fillText('RGB', 25, 15);

      ctxData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
      px = ctxData.data;
      px.set(imageCaptureData);
      for (let i=0; i < px.length; i+=4) {
        if (distanceYUV(selectedColor[0], selectedColor[1], selectedColor[2],
            px[i], px[i+1], px[i+2]) < removalThreshold * 2) {
              px[i+3] = 0;
          }
      }
      ctx2.putImageData(ctxData, 0, 0);
      ctx2.font = "14px Arial";
      ctx2.fillText('YUV', 25, 15);

      ctxData = ctx3.getImageData(0, 0, canvas3.width, canvas3.height);
      px = ctxData.data;
      px.set(imageCaptureData);
      let selectedHSL = rgbToHSL(selectedColor);
      for (let i=0; i < px.length; i+=4) {
          if (Math.abs(rgbToHSL([px[i],px[i+1],px[i+2]])[0] - selectedHSL[0]) < removalThreshold) {
              px[i+3] = 0;
          }
      }
      ctx3.putImageData(ctxData, 0, 0);
      ctx3.putImageData(ctxData, 0, 0);
      ctx3.font = "14px Arial";
      ctx3.fillText('HSL', 25, 15);
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
