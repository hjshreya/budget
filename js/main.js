function init() {
  days = lang.day;
  months = lang.month;
  moneySymbol = lang.money;

  const now = new Date();
  dayOfWeek = now.getDay();
  day = now.getDate();
  month = parseInt(now.getMonth()) + 1;
  year = now.getFullYear();
  hour = now.getHours();
  minute = now.getMinutes();

  id = localStorage.ultimoid ? localStorage.getItem("ultimoid") : 1;

  if (lang.id !== "pt-br") translateGUI();

  retrieveExpenses();
  retrieveCategories();
  navigateTo("expensesTab");
  setupFormListeners();
}

function translateGUI() {
  document.getElementById("expensesTabBtn").value = lang.menu.expense;
  document.getElementById("entryTabBtn").value = lang.menu.newExpense;
  document.getElementById("settingsTabBtn").value = lang.menu.settings;
  document.getElementById("categoriesTabBtn").value = lang.menu.categories;
  document.getElementById("categoryInput").placeholder = lang.menu.category;
  document.getElementById("resetBtn").value = lang.menu.reset;
  document.getElementById("deleteExpenseBtn").value = lang.menu.erase;
  document.getElementById("deleteCategoryBtn").value = lang.menu.erase;
  document.getElementById("cancelConfirmBtn").value = lang.cancel;
  document.getElementById("confirmOkBtn").value = lang.accept;
}

function setupFormListeners() {
  document.getElementById("entryForm").addEventListener("submit", function (e) {
    e.preventDefault();
    addExpense();
  });
  document.getElementById("confirmForm").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("confirmOkBtn").click();
  });
  document.getElementById("categoryForm").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("addCategoryBtn").click();
  });
}

function saveCategory(click = true) {
  if (click) {
    const input = document.getElementById("categoryInput").value;
    if (input.match(/^[0-9a-zA-Z]+$/)) {
      let cat = localStorage.getItem("categories").toLowerCase().split(";");
      if (cat.includes(input.toLowerCase())) {
        showAlert("show", lang.catExists);
        document.getElementById("categoryInput").value = "";
        return;
      }
      localStorage.setItem("categories", localStorage.getItem("categories") + ";" + input);
    } else {
      showAlert("show", lang.invalidData);
      document.getElementById("categoryInput").value = "";
      return;
    }
  } else {
    const cat = document.getElementById("categoriesContent").innerText.replace(/\n/g, ";").replace(/;$/, "");
    localStorage.setItem("categories", cat);
  }

  retrieveCategories();
  document.getElementById("categoryInput").value = "";
}

function removeCategory(confirmed = false) {
  showConfirm("show", removeCategory);
  if (confirmed) {
    const categories = document.getElementsByName("category");
    for (let i = categories.length - 1; i >= 0; i--) {
      if (categories[i].checked) {
        categories[i].parentNode.parentNode.remove();
      }
    }
    saveCategory(false);
  }
}

function retrieveCategories() {
  if (!localStorage.categories) {
    localStorage.setItem("categories", lang.defaultCat);
  }

  const catList = localStorage.getItem("categories").split(";");
  document.getElementById("categoriesContent").innerHTML = "";
  const locationSelect = document.getElementById("locationSelect");
  locationSelect.options.length = 0;

  for (let i = 0; i < catList.length; i++) {
    if (catList[i].length > 0) {
      const option = document.createElement("option");
      option.text = catList[i];
      option.value = catList[i];
      locationSelect.appendChild(option);

      document.getElementById("categoriesContent").innerHTML +=
        `<div class='categoryRow'>
          <label for='category_${catList[i]}'>
            <input type='checkbox' name='category' id='category_${catList[i]}' 
              onClick='toggleDeleteButton("category","deleteCategoryBtn")' />
            <div class='dailyTotal'>${catList[i]}</div>
          </label>
        </div>`;
    }
  }

  toggleDeleteButton("category", "deleteCategoryBtn");
}

function pad(n) {
  return n > 9 ? "" + n : "0" + n;
}

function addExpense() {
  const dataStr = `${dayOfWeek};${pad(day)}/${pad(month)}/${year};${pad(hour)}:${pad(minute)}`;
  const value = parseFloat(document.getElementById("amountInput").value).toFixed(2);

  if (value && !isNaN(value)) {
    const category = document.getElementById("locationSelect").value;
    localStorage.setItem(id, `${dataStr};${value};${category}`);
    localStorage.setItem("ultimoid", ++id);
  } else {
    showAlert("show", lang.moneyInvalid);
    return;
  }

  document.getElementById("amountInput").value = "";
  retrieveExpenses();
}

function retrieveExpenses() {
  let hasData = false;
  _x = [];
  _y = [];

  for (let i = id - 1; i > 0; i--) {
    if (localStorage.getItem(i)) {
      hasData = true;
      break;
    }
  }

  if (hasData) {
    document.getElementById("deleteExpenseBox").style.display = "block";
    document.getElementById("expensesContent").innerHTML = "";

    let monthTotal = 0;
    let dayTotal = 0;
    let lastMonth = "00", lastYear = "0000", lastDate = "00/00/0000";

    for (let i = id - 1; i > 0; i--) {
      if (localStorage.getItem(i)) {
        const [dayIndex, dateStr, timeStr, amount, category] = localStorage.getItem(i).split(";");
        const [d, m, y] = dateStr.split("/");

        if (y === year.toString() && m >= month - 3) {
          if (localStorage.categories.split(";").includes(category)) {
            _x.push([dayIndex, timeStr.split(":")[0], parseFloat(amount).toFixed(2)]);
            _y.push(localStorage.categories.split(";").indexOf(category));
          }
        }

        if (y !== lastYear) lastYear = y;
        if (m !== lastMonth) {
          lastMonth = m;
          if (i !== id - 1) document.getElementById("expensesContent").innerHTML += "<br>";
          document.getElementById("expensesContent").innerHTML += `${months[parseInt(m) - 1]} <div id='${m + y}' class='monthlyTotal'></div>`;
          monthTotal = 0;
        }

        if (dateStr !== lastDate) {
          lastDate = dateStr;
          document.getElementById("expensesContent").innerHTML += `<div class='data'>${days[parseInt(dayIndex)]}, ${dateStr}<div id='${dateStr}' class='dailyTotal'></div></div>`;
          dayTotal = 0;
        }

        dayTotal += parseFloat(amount);
        monthTotal += parseFloat(amount);

        document.getElementById("expensesContent").innerHTML +=
          `<div class='expense'>
            <div id='expenseCell1'><input type='checkbox' name='expense' value='${i}' onClick='toggleDeleteButton("expense","deleteExpenseBtn")'></div>
            <div id='expenseCell2'>${timeStr}</div>
            <div id='expenseCell3'>${moneySymbol} ${parseFloat(amount).toFixed(2)}</div>
            <div id='expenseCell4'>${category}</div>
          </div>`;

        document.getElementById(`${m + y}`).innerHTML = `${moneySymbol} ${monthTotal.toFixed(2)}`;
        document.getElementById(`${dateStr}`).innerHTML = `${moneySymbol} ${dayTotal.toFixed(2)}`;
      }
    }

    toggleDeleteButton("expense", "deleteExpenseBtn");
  } else {
    document.getElementById("expensesContent").innerHTML = lang.noneExpanse;
    document.getElementById("deleteExpenseBox").style.display = "none";
  }
}

function showAlert(action, msg = "") {
  if (action === "show") {
    document.getElementById("alertMessage").innerHTML = msg;
    document.getElementById("backdrop").style.display = "block";
    document.getElementById("alertBox").style.display = "block";
  } else {
    document.getElementById("backdrop").style.display = "none";
    document.getElementById("alertBox").style.display = "none";
  }
}

function showConfirm(action, callback) {
  if (action === "show") {
    document.getElementById("backdrop").style.display = "block";
    document.getElementById("confirmBox").style.display = "block";
    document.getElementById("confirmMessage").innerHTML = lang.confirm;
    document.getElementById("confirmOkBtn").onclick = function () {
      callback(true);
      showConfirm("hide");
    };
  } else {
    document.getElementById("backdrop").style.display = "none";
    document.getElementById("confirmBox").style.display = "none";
  }
}

function toggleDeleteButton(name, buttonId) {
  const checkboxes = document.getElementsByName(name);
  const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
  document.getElementById(buttonId).disabled = !anyChecked;
}

function removeExpense(confirmed = false) {
  showConfirm("show", removeExpense);
  if (confirmed) {
    const items = document.getElementsByName("expense");
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].checked) {
        localStorage.removeItem(items[i].value);
      }
    }
    retrieveExpenses();
  }
}

function navigateTo(tabId) {
  const tabs = document.getElementsByClassName("tab");
  for (let tab of tabs) {
    tab.style.display = "none";
  }
  document.getElementById(tabId).style.display = "block";
}

function resetApp(confirmed = false) {
  showConfirm("show", resetApp);
  if (confirmed) {
    localStorage.clear();
    init();
  }
}

function predictCategory() {
  if (_x && _x.length > 0) {
    const value = document.getElementById("amountInput").value;
    const hour = new Date().getHours();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      document.getElementById("locationSelect").selectedIndex = predict([dayOfWeek, hour, value]);
    }, 500);
  }
}

function predict(input, k = 3) {
  const distances = [];
  const resultCounts = {};
  let results = [];

  for (let i = 0; i < _x.length; i++) {
    let distance = 0;
    for (let j = 0; j < _x[i].length; j++) {
      distance += Math.abs(parseFloat(input[j]) - parseFloat(_x[i][j]));
    }
    distances.push(distance);
  }

  if (distances.length >= k * k) {
    for (let i = 0; i < k; i++) {
      const minIndex = distances.indexOf(Math.min(...distances));
      results.push(_y[minIndex]);
      distances.splice(minIndex, 1);
    }

    let maxCount = -1;
    let bestResult;

    results.forEach(r => {
      resultCounts[r] = (resultCounts[r] || 0) + 1;
      if (resultCounts[r] > maxCount) {
        maxCount = resultCounts[r];
        bestResult = r;
      }
    });

    return bestResult;
  } else {
    return _y[distances.indexOf(Math.min(...distances))];
  }
}

window.onload = () => {
  window.applicationCache.addEventListener('updateready', function () {
    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
      window.applicationCache.swapCache();
      window.location.reload();
    }
  }, false);

  fetch(langSetting)
    .then(response => response.json())
    .then(result => {
      lang = result;
      init();
    })
    .catch(e => console.error(e));
};
