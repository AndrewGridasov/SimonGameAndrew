const cookieExpiresIn = localStorage.getItem("cookieExpiresIn");
const isCookieExpired = !cookieExpiresIn
  ? true
  : cookieExpiresIn - new Date().getTime() <= 0;

const paths = window.location.pathname.split(/\//g);

switch (true) {
  case isCookieExpired &&
    !["autorization", "index"].some((cur) => paths.at(-1).includes(cur)): {
    localStorage.removeItem("username");

    window.location.pathname =
      paths.slice(0, -1).join("\\") + "/autorization.html";

    break;
  }
  default: {
    document.body.style.display = "block";
    document.body.style.opacity = 1;
  }
}

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.registerAuthorizedListener(this);
    this.mountHeader(this, !isCookieExpired);
  }


  registerAuthorizedListener(context) {
    document.addEventListener("authorized", () =>
      this.mountHeader(context, true)
    );
  }
}

customElements.define("header-component", Header);
