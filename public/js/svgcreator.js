window.onload = () => {
  const Snap = require('./snap.svg');

  const svg = Snap('#svgapp');
  let Circle = svg.circle(150, 150, 100);
  Circle.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 5
  });
  let Circle1 = svg.circle(150, 150, 70);
  let discs = svg.group(Circle1, svg.circle(200, 150, 70));
  Circle.attr({
    mask: discs
  });
  Circle1.animate({
    r: 50
  }, 1000);
  let p = svg.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
    fill: "none",
    stroke: "#bada55",
    strokeWidth: 5
  });
  p = p.pattern(0, 0, 10, 10);
  Circle.attr({
    fill: p
  });
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdmdjcmVhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAuc3ZnJyk7XG5cbiAgY29uc3Qgc3ZnID0gU25hcCgnI3N2Z2FwcCcpO1xuICBsZXQgQ2lyY2xlID0gc3ZnLmNpcmNsZSgxNTAsIDE1MCwgMTAwKTtcbiAgQ2lyY2xlLmF0dHIoe1xuICAgIGZpbGw6IFwiI2JhZGE1NVwiLFxuICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgc3Ryb2tlV2lkdGg6IDVcbiAgfSk7XG4gIGxldCBDaXJjbGUxID0gc3ZnLmNpcmNsZSgxNTAsIDE1MCwgNzApO1xuICBsZXQgZGlzY3MgPSBzdmcuZ3JvdXAoQ2lyY2xlMSwgc3ZnLmNpcmNsZSgyMDAsIDE1MCwgNzApKTtcbiAgQ2lyY2xlLmF0dHIoe1xuICAgIG1hc2s6IGRpc2NzXG4gIH0pO1xuICBDaXJjbGUxLmFuaW1hdGUoe1xuICAgIHI6IDUwXG4gIH0sIDEwMDApO1xuICBsZXQgcCA9IHN2Zy5wYXRoKFwiTTEwLTUtMTAsMTVNMTUsMCwwLDE1TTAtNS0yMCwxNVwiKS5hdHRyKHtcbiAgICBmaWxsOiBcIm5vbmVcIixcbiAgICBzdHJva2U6IFwiI2JhZGE1NVwiLFxuICAgIHN0cm9rZVdpZHRoOiA1XG4gIH0pO1xuICBwID0gcC5wYXR0ZXJuKDAsIDAsIDEwLCAxMCk7XG4gIENpcmNsZS5hdHRyKHtcbiAgICBmaWxsOiBwXG4gIH0pO1xufTsiXSwiZmlsZSI6InN2Z2NyZWF0b3IuanMifQ==
