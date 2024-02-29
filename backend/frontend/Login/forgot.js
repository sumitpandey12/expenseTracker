document.getElementById("forgotForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  axios
    .post("http://localhost:3000/password/forgotpassword", {
      email,
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
});
