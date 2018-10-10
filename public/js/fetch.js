function httpGet(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = () => {
      if (this.status == 210) {
        resolve(this.response);
      } else {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });
}

fetch('/article/fetch/user.json').then(response => {
  alert(response.headers.get('Content-Type')); // application/json; charset=utf-8

  alert(response.status); // 200

  return response.json();
}).then(user => {
  alert(user.name); // iliakan
}).catch(alert);
const nevra = {}; // ожидание результата

const waiting = function (x, y, cb) {
  () => {
    while (!x && !y) {}

    ;
    return cb(x, y);
  };
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmZXRjaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBodHRwR2V0KHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcblxuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjEwKSB7XG4gICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IodGhpcy5zdGF0dXNUZXh0KTtcbiAgICAgICAgZXJyb3IuY29kZSA9IHRoaXMuc3RhdHVzO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJOZXR3b3JrIEVycm9yXCIpKTtcbiAgICB9O1xuXG4gICAgeGhyLnNlbmQoKTtcbiAgfSk7XG59XG5cbmZldGNoKCcvYXJ0aWNsZS9mZXRjaC91c2VyLmpzb24nKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgYWxlcnQocmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpKTsgLy8gYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFxuXG4gIGFsZXJ0KHJlc3BvbnNlLnN0YXR1cyk7IC8vIDIwMFxuXG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59KS50aGVuKHVzZXIgPT4ge1xuICBhbGVydCh1c2VyLm5hbWUpOyAvLyBpbGlha2FuXG59KS5jYXRjaChhbGVydCk7XG5jb25zdCBuZXZyYSA9IHt9OyAvLyDQvtC20LjQtNCw0L3QuNC1INGA0LXQt9GD0LvRjNGC0LDRgtCwXG5cbmNvbnN0IHdhaXRpbmcgPSBmdW5jdGlvbiAoeCwgeSwgY2IpIHtcbiAgKCkgPT4ge1xuICAgIHdoaWxlICgheCAmJiAheSkge31cblxuICAgIDtcbiAgICByZXR1cm4gY2IoeCwgeSk7XG4gIH07XG59OyJdLCJmaWxlIjoiZmV0Y2guanMifQ==
