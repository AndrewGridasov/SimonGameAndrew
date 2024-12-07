import { apiURL, retryRequest, cookieExpireInMillis } from "./request_sender.js";

// Проверка на истекший срок действия cookie
const cookieExpiresIn = localStorage.getItem("cookieExpiresIn");
const isCookieExpired = !cookieExpiresIn
  ? true
  : cookieExpiresIn - new Date().getTime() <= 0;

// Разделение пути текущей страницы
const paths = window.location.pathname.split(/\//g);

// Логика для авторизации
if (isCookieExpired && !["autorization", "index"].some((cur) => paths.at(-1).includes(cur))) {
  localStorage.removeItem("username"); // Очистить информацию о пользователе
  window.location.pathname = paths.slice(0, -1).join("/") + "/autorization.html"; // Перенаправить на страницу авторизации
} else if (!isCookieExpired && ["autorization", "index"].some((cur) => paths.at(-1).includes(cur))) {
  // Если cookie не истекло, а мы на странице авторизации или индекса, перенаправляем на страницу игры
  window.location.pathname = "/game.html"; // Можно заменить на путь к вашей странице игры
} else {
  // Если все в порядке, отображаем тело страницы
  document.body.style.display = "block";
  document.body.style.opacity = 1;
}

// Компонент Header
class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.registerAuthorizedListener(this);
    this.mountHeader(this, !isCookieExpired);
  }

  registerAuthorizedListener(context) {
    document.addEventListener("authorized", () => this.mountHeader(context, true));
  }
}

if (!customElements.get("header-component")) {
  customElements.define("header-component", Header); // Убедитесь, что элемент не регистрируется несколько раз
}

// Хеширование пароля
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Регистрация
document.addEventListener("DOMContentLoaded", () => {
  const registrationForm = document.getElementById("registrationForm");
  const nicknameField = document.getElementById("nickname");
  const passwordField = document.getElementById("password");

  const alertContainer = document.getElementById("alertContainer");
  const alertInfo = document.getElementById("alertInfo");

  registrationForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const nickname = nicknameField.value.trim();
      const password = passwordField.value;

      if (!nickname || !password) {
        alert("Пожалуйста, заполните все поля.");
        return;
      }

      const hashedPassword = await hashPassword(password);

      const response = await retryRequest(`${apiURL}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: nickname, password: hashedPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alertInfo.innerText = "Пользователь успешно зарегистрирован!";
        alertContainer.classList.add("show");
      } else {
        throw new Error(result.message || "Ошибка при регистрации.");
      }
    } catch (error) {
      alertInfo.innerText = error.message || "Ошибка при регистрации";
      alertContainer.classList.add("show");
    } finally {
      setTimeout(() => {
        alertContainer.classList.remove("show");
      }, 2000);
    }
  });
});

// Авторизация
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");
  const nicknameFieldLogin = document.getElementById("nickname");
  const passwordFieldLogin = document.getElementById("password");
  const rememberMeField = document.getElementById("rememberMe");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const nickname = nicknameFieldLogin.value.trim();
      const password = passwordFieldLogin.value;

      if (!nickname || !password) {
        alert("Пожалуйста, заполните все поля.");
        return;
      }

      const hashedPassword = await hashPassword(password);

      const response = await retryRequest(`${apiURL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: nickname, password: hashedPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        if (rememberMeField.checked) {
          localStorage.setItem(
            "cookieExpiresIn",
            new Date().getTime() + cookieExpireInMillis
          );
          localStorage.setItem("username", nickname);
        }

        // Сохраняем имя пользователя в localStorage
        localStorage.setItem("currentUserName", nickname);

        alert("Вы успешно авторизованы!");
        document.dispatchEvent(new Event("authorized"));

        // Перенаправляем на страницу игры
        window.location.href = "./game.html";
      } else {
        throw new Error(result.message || "Ошибка при авторизации.");
      }
    } catch (error) {
      alert(error.message || "Ошибка при авторизации.");
    }
  });
});
