// 1. 初始化地图至曼哈顿核心区
var map = L.map("map", { zoomControl: false }).setView([40.745, -73.985], 13);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; CARTO",
  subdomains: "abcd",
  maxZoom: 20,
}).addTo(map);

var stationLayer = L.layerGroup().addTo(map);
var odLayer = L.layerGroup().addTo(map);
var controlsPanel = document.getElementById("controls");
var aiFab = document.getElementById("aiFab");
var closeAiPanelBtn = document.getElementById("closeAiPanel");

function openAiPanel() {
  controlsPanel.classList.remove("hidden");
  aiFab.classList.add("hidden");
}

function closeAiPanel() {
  controlsPanel.classList.add("hidden");
  aiFab.classList.remove("hidden");
}

aiFab.addEventListener("click", openAiPanel);
closeAiPanelBtn.addEventListener("click", closeAiPanel);

// 2. 演示假数据
var stationData = {
  morning: [
    {
      lat: 40.7505,
      lon: -73.9934,
      station_name: "Penn Station (通勤枢纽)",
      demand: 85,
    },
    {
      lat: 40.7527,
      lon: -73.9772,
      station_name: "Grand Central (通勤枢纽)",
      demand: 90,
    },
    {
      lat: 40.7281,
      lon: -73.9773,
      station_name: "East Village (住宅区)",
      demand: -60,
    },
    {
      lat: 40.7128,
      lon: -74.006,
      station_name: "Financial District (办公区)",
      demand: 70,
    },
  ],
  evening: [
    {
      lat: 40.7505,
      lon: -73.9934,
      station_name: "Penn Station (通勤枢纽)",
      demand: -80,
    },
    {
      lat: 40.7527,
      lon: -73.9772,
      station_name: "Grand Central (通勤枢纽)",
      demand: -95,
    },
    {
      lat: 40.7281,
      lon: -73.9773,
      station_name: "East Village (住宅区)",
      demand: 65,
    },
    {
      lat: 40.7128,
      lon: -74.006,
      station_name: "Financial District (办公区)",
      demand: -75,
    },
  ],
};

var odData = {
  morning: [
    {
      start_lat: 40.7281,
      start_lon: -73.9773,
      end_lat: 40.7505,
      end_lon: -73.9934,
      count: 50,
    },
    {
      start_lat: 40.7281,
      start_lon: -73.9773,
      end_lat: 40.7128,
      end_lon: -74.006,
      count: 40,
    },
  ],
  evening: [
    {
      start_lat: 40.7505,
      start_lon: -73.9934,
      end_lat: 40.7281,
      end_lon: -73.9773,
      count: 45,
    },
    {
      start_lat: 40.7128,
      start_lon: -74.006,
      end_lat: 40.7281,
      end_lon: -73.9773,
      count: 55,
    },
  ],
};

// 3. 渲染逻辑
function updateMap(highlightType = null) {
  var time = document.getElementById("timeSelect").value;
  stationLayer.clearLayers();
  odLayer.clearLayers();

  odData[time].forEach(function (d) {
    L.polyline(
      [
        [d.start_lat, d.start_lon],
        [d.end_lat, d.end_lon],
      ],
      {
        color: "#ff9f0a",
        weight: d.count / 10,
        opacity: 0.8,
        className: "flow-line",
        lineCap: "round",
      },
    ).addTo(odLayer);
  });

  stationData[time].forEach(function (d) {
    if (highlightType === "shortage" && d.demand >= 0) return;
    if (highlightType === "surplus" && d.demand < 0) return;

    var color = d.demand < 0 ? "#ff3b30" : "#007aff";
    var fillColor = d.demand < 0 ? "#ffb3ad" : "#a7d0ff";
    var radius = Math.min(Math.abs(d.demand) / 3, 25);

    L.circleMarker([d.lat, d.lon], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      weight: 2,
      radius: radius,
    })
      .bindPopup(
        `<b>${d.station_name}</b><br>当前净供需差: <b>${d.demand}</b> 辆<br>${d.demand < 0 ? "建议调度: 补车" : "建议调度: 清运"}`,
      )
      .addTo(stationLayer);
  });
}

// 4. 伪装版 AI 解析引擎
function runAIQuery() {
  var query = document.getElementById("aiInput").value;
  if (!query) return;

  var statusDiv = document.getElementById("aiStatus");
  statusDiv.innerHTML = "正在解析语义并调用 Arcpy 模型...";

  setTimeout(() => {
    var timeVal = document.getElementById("timeSelect").value;
    var highlightType = null;

    if (query.includes("早")) timeVal = "morning";
    if (query.includes("晚")) timeVal = "evening";
    if (query.includes("缺车")) highlightType = "shortage";
    if (query.includes("爆仓") || query.includes("满")) highlightType = "surplus";

    document.getElementById("timeSelect").value = timeVal;
    statusDiv.innerHTML = `✓ 已提取参数：时间=[${timeVal}], 过滤=[${highlightType || "全部"}]`;
    updateMap(highlightType);
  }, 800);
}

// 初始化
updateMap();
openAiPanel();