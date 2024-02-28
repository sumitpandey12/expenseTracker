document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", register);
});

function register(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  axios
    .post("http://13.233.28.177:3000/user/login", {
      email: email,
      password: password,
    })
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log(result.data);
        displaySuccess(result.data.message);
        localStorage.setItem(
          "token",
          JSON.stringify({
            token: result.data.token,
            ispremium: result.data.data.ispremium,
          })
        );

        // window.location.replace("http://13.233.28.177:3000/Home/index.html");
        window.location.href = "http://13.233.28.177:3000/Home/index.html";
      } else {
        const errorMessage = result.message;
        displayError(errorMessage);
      }
    })
    .catch((err) => console.log(err));
}

function displayError(message) {
  const errorContainer = document.querySelector(".error-container");
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
}

function displaySuccess(message) {
  const successContainer = document.querySelector(".success-container");
  successContainer.textContent = message;
  successContainer.classList.remove("hidden");
}
