let capture;
let faceMesh;
let faces = [];
let stars = [];

function preload() {
  // 載入 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh();
  console.log("FaceMesh 模型載入中...");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 建立攝影機擷取
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上顯示
  capture.hide();
  // 開始偵測臉部
  console.log("嘗試啟動偵測...");
  faceMesh.detectStart(capture, gotFaces);
  
  reinitStars();
}

function reinitStars() {
  stars = [];
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      opacity: random(100, 255)
    });
  }
}

function gotFaces(results) {
  if (faces.length === 0 && results.length > 0) {
    console.log("偵測到臉部！");
  }
  faces = results;
}

function draw() {
  // 1. 防錯檢查：確保攝影機已啟動且影像寬度大於 0
  background(0);
  if (capture.width === 0 || capture.height === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("正在啟動攝影機與 AI 模型...", width / 2, height / 2);
    return;
  }

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

  // 建立遮罩：將臉部輪廓以外的地方塗黑
  if (faces.length > 0) {
    let face = faces[0];
    let silhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    
    push();
    fill(0); // 設定遮罩顏色為黑色
    noStroke();
    
    beginShape();
    // 外部邊框：涵蓋整個畫布
    vertex(-width, -height);
    vertex(width, -height);
    vertex(width, height);
    vertex(-width, height);
    
    // 內部孔洞：臉部外輪廓
    beginContour();
    for (let i of silhouette) {
      let pt = face.keypoints[i];
      vertex(map(pt.x, 0, capture.width, -imgW / 2, imgW / 2), map(pt.y, 0, capture.height, -imgH / 2, imgH / 2));
    }
    endContour();
    endShape(CLOSE);
    pop();

  // 繪製指定的臉部連線 (唇部輪廓)
    let paths = [
      [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
      [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184],
      // 右眼外圈 (包含 247 系列點，末尾連回首點以閉合)
      [247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25, 130, 247],
      // 右眼內圈 (包含 246 系列點，末尾連回首點以閉合)
      [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33, 246],
      // 左眼外圈 (包含 467 系列點，末尾連回首點以閉合)
      [467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255, 359, 467],
      // 左眼內圈 (包含 466 系列點，末尾連回首點以閉合)
      [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263, 466],
      // 臉部最外層輪廓 (Silhouette)，末尾連回首點 10 以閉合
      [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10]
    ];
    
    stroke(255, 0, 0); // 設定線條顏色為紅色
    strokeWeight(2);   // 稍微增加粗細，霓虹燈效果會更明顯
    noFill();

    // 加入霓虹燈發光效果
    drawingContext.shadowBlur = 20;                     // 增加發光範圍
    drawingContext.shadowColor = 'rgba(255, 0, 0, 1)'; // 使用標準 CSS 顏色字串確保相容性
    drawingContext.shadowOffsetX = 0;                  // 確保光暈均勻分佈
    drawingContext.shadowOffsetY = 0;

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
    
    // 重設發光效果，避免影響到後續其他的繪製動作
    drawingContext.shadowBlur = 0;
  }

  // 如果視窗大小改變，重新初始化星星（防止畫面空白）
  if (stars.length === 0) {
    reinitStars();
  }

  // 在遮罩繪製完成後再繪製星星，這樣星星才會出現在外層黑色背景之上
  noStroke();
  for (let star of stars) {
    // 讓星星閃爍（透過隨機改變透明度）
    star.opacity += random(-15, 15);
    star.opacity = constrain(star.opacity, 50, 255);
    
    // 只在臉部顯示區域（中央 50% 寬高）以外的地方繪製星星
    // 稍微放寬判定，讓視覺更自然
    if (star.x < width * 0.2 || star.x > width * 0.8 || star.y < height * 0.2 || star.y > height * 0.8) {
      fill(255, star.opacity);
      circle(star.x, star.y, star.size);
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reinitStars();
}
