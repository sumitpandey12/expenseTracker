document.getElementById("buy-button").onclick = async function (e) {
  e.preventDefault();
  const token = JSON.parse(localStorage.getItem("token")).token;
  const result = await axios.post(
    "http://13.233.28.177:3000/payment/createOrder",
    null,
    {
      headers: { Authorization: token },
    }
  );
  var options = {
    key: result.data.key_id,
    order_id: result.data.order.id,
    handler: async function (response) {
      await axios.post(
        "http://13.233.28.177:3000/payment/updateOrder",
        {
          order_id: result.data.order.id,
          payment_id: response.razorpay_payment_id,
          status: "SUCCESS",
        },
        {
          headers: { Authorization: token },
        }
      );
      showPremiumUser();
      localStorage.setItem(
        "token",
        JSON.stringify({
          token: JSON.parse(localStorage.getItem("token")).token,
          ispremium: true,
        })
      );
      alert("You are premium User Now");
    },
  };

  var razorpayObject = new Razorpay(options);
  razorpayObject.on("payment.failed", async function (response) {
    await axios.post(
      "http://13.233.28.177:3000/payment/updateOrder",
      {
        order_id: result.data.order.id,
        payment_id: response.razorpay_payment_id,
        status: "FAILED",
      },
      {
        headers: { Authorization: token },
      }
    );
    alert("This step of Payment Failed");
  });
  razorpayObject.open();
};

function showPremiumUser() {
  const premiumUser = document.getElementById("premiumUser");
  const buyButton = document.getElementById("buy-button");
  const buyContainer = document.getElementsByClassName("buy-container")[0];
  premiumUser.style.display = "block";
  buyButton.style.display = "none";

  var button = document.createElement("button");
  button.textContent = "Show Leaderboard";
  button.className = "btnShowLeaderboard";
  buyContainer.appendChild(button);
  button.addEventListener("click", () => {
    axios
      .post("http://13.233.28.177:3000/premium/show-leaderboard", null, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("token")).token,
        },
      })
      .then(function (response) {
        const premiumList = document.getElementsByClassName("list-premium")[0];
        response.data.forEach((data) => {
          const li = document.createElement("li");
          li.innerHTML = `Name ${data.name} : Total Expense ${data.total_expense}`;
          premiumList.appendChild(li);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const expenseForm = document.getElementById("expenseForm");
  const expensesList = document.getElementById("expenses");
  const paginationCount = document.getElementById("paginationCount");
  const storedData = JSON.parse(localStorage.getItem("token"));

  if (storedData.ispremium) {
    showPremiumUser();
  }
  expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    if (amount && description && category) {
      const expense = {
        amount: amount,
        description: description,
        category: category,
      };

      axios
        .post("http://13.233.28.177:3000/expense", expense, {
          headers: { Authorization: storedData.token },
        })
        .then(function (response) {
          displayExpenses(1);
        })
        .catch(function (error) {
          console.log(error);
        });

      // Clear form fields
      expenseForm.reset();

      // Display expenses
      displayExpenses(1);
    } else {
      alert("Please fill in all fields.");
    }
  });

  // Display expenses
  function displayExpenses(page) {
    expensesList.innerHTML = "";
    const pagenationDiv = document.getElementById("paginationDiv");
    const paginationCount = document.getElementById("paginationCount");
    pagenationDiv.innerHTML = "";
    const count = localStorage.getItem("paginationCount");
    paginationCount.value = count;

    console.log(count);

    pagenationDiv.innerHTML = "";
    axios
      .get(
        "http://13.233.28.177:3000/expense?page=" +
          page +
          "&paginationCount=" +
          count,
        {
          headers: { Authorization: storedData.token },
        }
      )
      .then(function (response) {
        let data = response.data;

        if (data.hasPreviousPage) {
          const button = document.createElement("button");
          button.textContent = data.previousPage;
          button.className = "m-1";
          button.onclick = function () {
            displayExpenses(data.previousPage);
          };
          pagenationDiv.appendChild(button);
        }
        const button = document.createElement("button");
        button.textContent = data.currentPage;
        button.className = "m-1 bg-warning";
        pagenationDiv.appendChild(button);

        if (data.hasNextPage) {
          const button = document.createElement("button");
          button.textContent = data.nextPage;
          button.className = "m-1";
          button.onclick = function () {
            displayExpenses(data.nextPage);
          };
          pagenationDiv.appendChild(button);
        }
        data.expenses.forEach(function (expense, index) {
          const li = document.createElement("li");
          li.className = "list-group-item";
          const deleteButton = document.createElement("button");
          deleteButton.className = "deleteButton";
          deleteButton.textContent = "Delete";
          li.innerHTML = `<span>${expense.amount} - ${expense.description} (${expense.category})</span>`;
          //         <button type="button" class="btn btn-danger btn-sm float-right">Delete</button>
          //         <button type="button" class="btn btn-primary btn-sm float-right mr-2" onclick="editExpense(${index})">Edit</button>
          //       `;
          li.append(deleteButton);
          deleteButton.addEventListener("click", (e) => {
            deleteExpense(index);
          });
          expensesList.appendChild(li);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  window.deleteExpense = function (index) {
    try {
      axios
        .get("http://13.233.28.177:3000/expense", {
          headers: { Authorization: storedData.token },
        })
        .then(function (response) {
          let expense = response.data.expenses[index];
          console.log(response);
          return axios.delete(
            "http://13.233.28.177:3000/expense/" + expense.id,
            {
              headers: { Authorization: storedData.token },
            }
          );
        })
        .then((response) => {
          displayExpenses(1);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  window.editExpense = function (index) {
    axios
      .get("http://13.233.28.177:3000/expense", {
        headers: { Authorization: storedData.token },
      })
      .then(function (response) {
        let expense = response.data[index];
        document.getElementById("amount").value = expense.amount;
        document.getElementById("description").value = expense.description;
        document.getElementById("category").value = expense.category;
        return axios.delete("http://13.233.28.177:3000/expense/" + expense.id, {
          headers: { Authorization: storedData.token },
        });
      })
      .then((response) => {
        console.log("DELETED");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // Initial display
  paginationCount.addEventListener("change", (e) => {
    const selectedValue = e.target.value;
    console.log(selectedValue);
    localStorage.setItem("paginationCount", selectedValue);
    displayExpenses(1);
  });
  displayExpenses(1);
});

document.getElementById("btnDownload").onclick = async function (e) {
  const storedData = JSON.parse(localStorage.getItem("token"));
  axios
    .get("http://13.233.28.177:3000/expense/download", {
      headers: { Authorization: storedData.token },
    })
    .then((response) => {
      if (response.status == 200) {
        var a = document.createElement("a");
        a.href = response.data.fileURL;
        a.download = "myexpense.csv";
        a.click();
      } else {
        throw new Error("Server Error");
      }
    })
    .catch(console.log);
};
