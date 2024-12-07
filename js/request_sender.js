export class RequestsSender {
    constructor(url, callback, isAsync = false) {
      this.url = url;
      this.callback = callback;
      this.isAsync = isAsync;
    }
  
    httpGet(path = "", headers = {}) {
      var xmlHttp = new XMLHttpRequest();
  
      let callback = this.callback;
      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) callback(xmlHttp.responseText);
      };
  
      xmlHttp.open("GET", this.url + "/" + path, this.isAsync);
  
      for (let key in headers) xmlHttp.setRequestHeader(key, headers[key]);
  
      xmlHttp.send(null);
    }
  
    httpPost(data, path = "", headers = {}) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.withCredentials = true;
  
      let callback = this.callback;
      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) callback(xmlHttp.responseText);
      };
  
      xmlHttp.open("POST", this.url + "/" + path, this.isAsync);
  
      for (let key in headers) xmlHttp.setRequestHeader(key, headers[key]);
  
      xmlHttp.send(data);
    }
  
    httpPut(data, path = "", headers = {}) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.withCredentials = true;
  
      let callback = this.callback;
      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) callback(xmlHttp.responseText);
      };
  
      xmlHttp.open("PUT", this.url + "/" + path, this.isAsync);
  
      for (let key in headers) xmlHttp.setRequestHeader(key, headers[key]);
  
      xmlHttp.send(data);
    }
  }
  
  export function logCallback(text) {
    console.log(text);
  }
  
  export function alertCallback(text) {
    alert(text);
  }
  
  export const devApiURL = "http://127.0.0.1:8000";
  export const apiURL = "https://d5dsv84kj5buag61adme.apigw.yandexcloud.net";
  export const cookieExpireInMillis = 1000 * 60 * 2;
  
  export const retryRequest = async (url, options, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
  
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryRequest(url, options, retries - 1, delay);
      }
  
      saveFailedRequest(url, options);
  
      throw new Error(
        `Запрос не удался после нескольких попыток: ${error.message}`
      );
    }
  };
  
  const saveFailedRequest = (url, options) => {
    const failedRequests =
      JSON.parse(localStorage.getItem("failedRequests")) ?? [];
    failedRequests.push({ url, options, id: Date.now() });
    localStorage.setItem("failedRequests", JSON.stringify(failedRequests));
  };
  
  export const retryFailedRequests = async () => {
    const failedRequests =
      JSON.parse(localStorage.getItem("failedRequests")) ?? [];
  
    const results = await Promise.all(
      failedRequests.map((cur) => {
        const { url, options } = cur;
  
        return fetch(url, options)
          .then((response) => (response.ok ? null : cur))
          .catch(() => cur);
      })
    );
  
    const remainingRequests = results.filter(Boolean);
  
    localStorage.setItem("failedRequests", JSON.stringify(remainingRequests));
  };
  
  document.addEventListener("load", retryFailedRequests);
  document.addEventListener("authorized", retryFailedRequests);
  