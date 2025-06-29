// English version of the expense tracker initialization
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let money = "US$";
let id;
let dayOfWeek, day, month, year, hour, minute;

function init() {
  const now = new Date();
  dayOfWeek = now.getDay();
  day = now.getDate();
  month = now.getMonth() + 1;
  year = now.getFullYear();
  hour = now.getHours();
  minute = now.getMinutes();
  id = localStorage.getItem("lastId") || 1;
  retrieveExpenses();
  retrieveCategories();
  navigateTo("expensesTab");
  setupFormListeners();
}

function setupFormListeners() {
  document.getElementById("expenseForm").addEventListener("submit", function (event) {
    event.preventDefault();
    addExpense();
  });
  document.getElementById("confirmForm").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("confirmButton").click();
  });
  document.getElementById("categoryForm").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("addCategoryButton").click();
  });
}

function saveCategory(click = true) {
  const input = document.getElementById("categoryInput").value;
  if (click) {
    if (/^[0-9a-zA-Z]+$/.test(input)) {
      const cat = localStorage.getItem("categories").toLowerCase().split(";");
      if (cat.includes(input.toLowerCase())) {
        showAlert("show", "Category already exists!");
        document.getElementById("categoryInput").value = "";
        return;
      }
      localStorage.setItem("categories", localStorage.getItem("categories") + ";" + input);
    } else {
      showAlert("show", "Invalid input!");
      document.getElementById("categoryInput").value = "";
      return;
    }
  } else {
    const cat = document.getElementById("categoryList").innerText.replace(/\n/g, ";").replace(/;$/, "");
    localStorage.setItem("categories", cat);
  }

  retrieveCategories();
  document.getElementById("categoryInput").value = "";
}

function retrieveCategories() {
  if (!localStorage.categories) {
    localStorage.setItem("categories", "Market;GasStation;Snacks;Store");
  }

  const catList = localStorage.getItem("categories").split(";");
  document.getElementById("categoryList").innerHTML = "";
  const select = document.getElementById("categorySelect");
  select.options.length = 0;

  for (let category of catList) {
    if (category.length > 0) {
      const option = document.createElement("option");
      option.text = category;
      option.value = category;
      select.appendChild(option);

      document.getElementById("categoryList").innerHTML +=
        `<div class='categoryRow'>
          <label for='category_${category}'>
            <input type='checkbox' name='category' id='category_${category}' onclick='toggleDelete("category", "deleteCategoryBtn")' />
            <div class='categoryName'>${category}</div>
          </label>
        </div>`;
    }
  }

  toggleDelete("category", "deleteCategoryBtn");
}

function addExpense() {
  const timestamp = `${dayOfWeek};${pad(day)}/${pad(month)}/${year};${pad(hour)}:${pad(minute)}`;
  const value = parseFloat(document.getElementById("amountInput").value).toFixed(2);

  if (value && !isNaN(value)) {
    const category = document.getElementById("categorySelect").value;
    localStorage.setItem(id, `${timestamp};${value};${category}`);
    localStorage.setItem("lastId", ++id);
  } else {
    showAlert("show", "Invalid amount! Example: 105.50");
    return;
  }

  document.getElementById("amountInput").value = "";
  retrieveExpenses();
}

function pad(n) {
  return n > 9 ? "" + n : "0" + n;
}

function showAlert(action, message = "") {
  const alertBox = document.getElementById("alertBox");
  const overlay = document.getElementById("overlay");
  if (action === "show") {
    alertBox.querySelector(".message").innerText = message;
    alertBox.style.display = "block";
    overlay.style.display = "block";
  } else {
    alertBox.style.display = "none";
    overlay.style.display = "none";
  }
}

function toggleDelete(name, buttonId) {
  const checkboxes = document.getElementsByName(name);
  const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
  document.getElementById(buttonId).disabled = !anyChecked;
}

function navigateTo(tabId) {
  const tabs = document.getElementsByClassName("tab");
  for (let tab of tabs) {
    tab.style.display = "none";
  }
  document.getElementById(tabId).style.display = "block";
}

window.onload = init;
