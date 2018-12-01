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
  console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8

  console.log(response.status); // 200

  return response.json();
}).then(user => {
  console.log(user.name); // iliakan
}).catch(console.log);
const nevra = {}; // ожидание результата

const waiting = function (x, y, cb) {
  () => {
    while (!x && !y) {}

    ;
    return cb(x, y);
  };
};