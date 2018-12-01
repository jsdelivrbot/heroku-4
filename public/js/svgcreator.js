window.onload = () => {
  let app = document.getElementById('app');

  function resize(el) {
    el.style.width = document.documentElement.clientWidth;
    el.style.height = document.documentElement.clientHeight;
  }

  resize(app);
  this.addEventListener('resize', () => {
    app.style.width = document.documentElement.clientWidth;
    app.style.height = document.documentElement.clientHeight;
  });
  const paper = Snap('#app');
  let Circl = paper.circle(150, 150, 100);
  Circl.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 5
  });
  let Circle1 = paper.circle(400, 150, 70);
  let discs = paper.group(paper.circle(100, 150, 70), paper.circle(200, 150, 70));
  discs.attr({
    stroke: "#fff",
    fill: "#fff"
  });
  Circl.attr({
    mask: discs
  });
  Circle1.animate({
    r: 50
  }, 1000);
  let p = paper.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
    fill: "none",
    stroke: "#bada55",
    strokeWidth: 5
  });
  p = p.pattern(0, 0, 10, 10);
  Circl.attr({
    fill: p
  });
  Circl.drag();
  Circle1.drag();
  paper.click(e => {
    if (e.target.tagName == 'svg') {
      paper.circle(e.offsetX, e.offsetY, 20).attr({
        fill: p
      }).drag();
    }
  });
};