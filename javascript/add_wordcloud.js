let words = [
  { word: "Python", quantity: 1 },
  { word: "R", quantity: 0.7 },
  { word: "machine learning", quantity: 0.7 },
  { word: "deep learning", quantity: 0.7 },
  { word: "azure", quantity: 0.5 },
  { word: "html", quantity: 0.7 },
  { word: "css", quantity: 0.7 },
  { word: "javascript", quantity: 0.5 },
  { word: "git", quantity: 0.6 },
  { word: "Microsoft Office", quantity: 0.8 },
  { word: "BERT", quantity: 0.6 },
  { word: "SQL", quantity: 1 },
  { word: "Figma", quantity: 0.7 },
  { word: "data scraping", quantity: 0.9 },
  { word: "ETL", quantity: 0.9 },
  { word: "cloud", quantity: 0.5 },
  { word: "EDA", quantity: 1 },
  { word: "Data cleaning", quantity: 1 },
  { word: "Data visulization", quantity: 1 },
];

let colors = [
  "#8ecae6",
  "#219ebc",
  "#ccd5ae",
  "#0B60B0",
  "#a3b18a",
  "#588157",
  "#003049",
];

// var container = d3.select(".wordcloud");
// var width = container.node().getBoundingClientRect().width;
// var height = container.node().getBoundingClientRect().height;

let width = window.innerHeight / 3;
let height = window.innerWidth / 5;
// const width = 500;
// const height = 400;
// console.log(window.innerWidth);
const svg = d3
  .select(".wordcloud")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const layout = d3.layout
  .cloud()
  .size([width, height])
  .words(
    words.map((word) => ({
      text: word.word,
      size: word.quantity * 20,
    }))
  )
  .padding(1)
  .rotate(0)
  .fontSize((d) => d.size)
  .spiral("rectangular")
  .on("end", draw);
// console.log(layout);
updateCloud();
layout.start();

function draw(words) {
  svg.selectAll("*").remove();

  const textGroups = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("g")
    .data(words)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`);

  textGroups
    .append("text")
    .style("font-size", (d) => d.size / 7 + "vmin")
    .style("fill", (d, i) => colors[i % colors.length])
    .style("opacity", 1)
    // .style("text-shadow", "2px 2px 4px #ffffff")
    .attr("text-anchor", "middle")
    .text((d) => d.text)
    .style(
      "animation",
      (d) => `moveUpDown ${2 + Math.random()}s ease-in-out infinite alternate`
    );
}
// console.log("test");
function addWord() {
  const input = document.querySelector("#word-input");
  console.log(input);
  const word = input.value;
  input.value = "";

  const index = words.findIndex((w) => w.word === word);
  if (index === -1) {
    words.push({ word, quantity: 10 });
  } else {
    words[index].quantity += 10;
  }

  updateCloud();
}

function updateCloud() {
  const maxSize = 100;
  layout.words(
    words.map((w) => ({
      text: w.word,
      size: Math.min(w.quantity * 20, maxSize),
    }))
  );
  layout.start();
}

window.addEventListener("resize", () => {
  width = window.innerHeight / 3;
  height = window.innerWidth / 5;

  svg.attr("width", width).attr("height", height);
  // d3.layout.size([width, height]);

  layout.start();
});
