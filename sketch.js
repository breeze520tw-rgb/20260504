let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 建立攝影機擷取
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上顯示
  capture.hide();
  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');

  push();
  // 移動座標原點至畫布中心
  translate(width / 2, height / 2);
  // 水平反轉影像 (達成左右顛倒的鏡像效果)
  scale(-1, 1);
  // 設定影像繪製模式為中心
  imageMode(CENTER);
  // 繪製影像，寬高為全螢幕畫面的 50%
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  image(capture, 0, 0, imgW, imgH);

  // 繪製指定的臉部連線 (唇部輪廓)
  if (faces.length > 0) {
    let face = faces[0];
    let paths = [
      [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
      [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184],
      // 右眼外圈 (包含 247 系列點，末尾連回首點以閉合)
      [247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25, 130, 247],
      // 右眼內圈 (包含 246 系列點，末尾連回首點以閉合)
      [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33, 246]
    ];
    
    stroke(255, 0, 0); // 設定線條顏色為紅色
    strokeWeight(1);   // 設定線條粗細為 1
    noFill();

    for (let indices of paths) {
      for (let i = 0; i < indices.length - 1; i++) {
        let p1 = face.keypoints[indices[i]];
        let p2 = face.keypoints[indices[i + 1]];

        if (p1 && p2) {
          // 將偵測到的座標從影片解析度映射到畫布上顯示的影像大小
          let x1 = map(p1.x, 0, capture.width, -imgW / 2, imgW / 2);
          let y1 = map(p1.y, 0, capture.height, -imgH / 2, imgH / 2);
          let x2 = map(p2.x, 0, capture.width, -imgW / 2, imgW / 2);
          let y2 = map(p2.y, 0, capture.height, -imgH / 2, imgH / 2);
          line(x1, y1, x2, y2);
        }
      }
    }
  }
  pop();
}
