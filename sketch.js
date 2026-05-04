let capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 建立攝影機擷取
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上顯示
  capture.hide();
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
  image(capture, 0, 0, width * 0.5, height * 0.5);
  pop();
}
