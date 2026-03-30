document.addEventListener("DOMContentLoaded", () => {

    // -------------------- Navbar Elements --------------------
    const logo = document.getElementById("logo");
    const navHome = document.getElementById("navHome");
    const navExpenses = document.getElementById("navExpenses");
    const navReports = document.getElementById("navReports");

    // -------------------- Pages / Sections --------------------
    const homePage = document.getElementById("homePage");
    const expensesPage = document.getElementById("expensesPage");
    const reportsPage = document.getElementById("reportsPage");
    const newExpPage = document.getElementById("newExpPage");

    // -------------------- Balance Elements --------------------
    const homeBalanceEl = document.getElementById("homeBalance");
    const reportBalanceEl = document.getElementById("reportBalance");

    // -------------------- Income Elements --------------------
    const saveIncomeBtn = document.getElementById("saveIncome");
    const incomeForm = document.getElementById("incomeForm");
    const incomeTitleEl = document.getElementById("incomeTitle");
    const incomeAmountEl = document.getElementById("incomeAmount");
    const incomeDateEl = document.getElementById("incomeDate");
    const totalIncomeEl = document.getElementById("totalIncome");
    const incomeTableBody = document.getElementById("incomeTableBody");

    // -------------------- Expense Elements --------------------
    const addNewExpenseBtn = document.querySelectorAll(".addNewExpenseBtn");
    const expenseForm = document.getElementById("expenseForm");
    const expenseAmount = document.getElementById("expenseAmount");
    const expenseCategory = document.getElementById("expenseCategory");
    const expenseDate = document.getElementById("expenseDate");
    const expenseDescription = document.getElementById("expenseDescription");
    const totalExpensesEl = document.getElementById("totalExpenses");
    const expenseTableBody = document.getElementById("expenseTableBody");
    const selectAllCheckbox = document.getElementById("selectAllExpenses");

    const sortByDate = document.getElementById("sortByDate");
    const sortAZ = document.getElementById("sortAZ");
    const sortAmountLow = document.getElementById("sortAmountLow");
    const sortAmountHigh = document.getElementById("sortAmountHigh");

    const recentExpenseTableBody = document.getElementById("recentExpenseTableBody");

    // -------------------- Reports Elements --------------------
    const reportIncomeEl = document.getElementById("reportIncome");
    const reportExpense = document.getElementById("reportExpense");

    // -------------------- Navigation Functions --------------------
    const hideAllPages = () => {
        [homePage, expensesPage, reportsPage, newExpPage].forEach(sec => sec.style.display = "none");
    };

    const setLinkColor = () => {
        [navHome, navExpenses, navReports].forEach(link => {
            link.classList.remove("text-warning", "active-link");
            link.classList.add("text-white");
        });
    };

    const showSection = (section, link) => {
        hideAllPages();
        section.style.display = "block";
        setLinkColor();
        if (link && link !== logo) {
            link.classList.add("text-warning", "active-link");
            link.classList.remove("text-white");
        }
    };

    // Default page
    showSection(homePage, null);

    // Navigation Events
    logo.addEventListener("click", () => showSection(homePage, null));
    navHome.addEventListener("click", () => showSection(homePage, navHome));
    navExpenses.addEventListener("click", () => showSection(expensesPage, navExpenses));
    navReports.addEventListener("click", () => showSection(reportsPage, navReports));

    // -------------------- New Expense Button --------------------
    addNewExpenseBtn.forEach(btn => {
        btn.addEventListener("click", () => {
            expenseForm.reset();
            showSection(newExpPage, navExpenses);
        });
    });

    // -------------------- Data Arrays / Local Storage --------------------
    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;

    // -------------------- Balance Function --------------------
    function updateBalance() {
        const balance = totalIncome - totalExpenses;
        const isLoss = balance < 0;
        const formattedBalance = `$ ${Math.abs(balance).toLocaleString()}` + (isLoss ? " ⚠️ Loss!!" : "");
        if (homeBalanceEl) homeBalanceEl.textContent = formattedBalance;
        if (reportBalanceEl) {
            const cardText = reportBalanceEl.querySelector(".card-text");
            if (cardText) cardText.textContent = formattedBalance;
        }
    }

    // -------------------- Income Functions --------------------
    const updateIncomeCards = () => {
        totalIncomeEl.textContent = `$ ${totalIncome.toLocaleString()}`;
        if (reportIncomeEl) reportIncomeEl.querySelector(".card-text").textContent = `$ ${totalIncome.toLocaleString()}`;
    };

    const renderIncomeTable = () => {
        incomeTableBody.innerHTML = "";
        incomes.forEach(income => {
            const row = `
                <tr>
                    <td>${income.title}</td>
                    <td>${new Date(income.date).toLocaleDateString()}</td>
                    <td>$ ${income.amount.toLocaleString()}</td>
                </tr>
            `;
            incomeTableBody.innerHTML += row;
        });
    };

    saveIncomeBtn.addEventListener("click", () => {
        const title = incomeTitleEl.value;
        const amount = parseFloat(incomeAmountEl.value);
        const date = incomeDateEl.value;

        if (!title || isNaN(amount) || amount <= 0 || !date) {
            alert("Please fill all fields correctly");
            return;
        }

        incomes.push({ title, amount, date });
        totalIncome += amount;

        // Save to localStorage
        localStorage.setItem("incomes", JSON.stringify(incomes));
        localStorage.setItem("totalIncome", totalIncome);

        updateIncomeCards();
        renderIncomeTable();
        updateBalance();

        incomeForm.reset();
        const incomeModal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
        incomeModal.hide();
    });

    // -------------------- Expense Functions --------------------
    const updateExpenseCard = () => {
        totalExpensesEl.textContent = `$ ${totalExpenses.toLocaleString()}`;
        if (reportExpense) reportExpense.querySelector(".card-text").textContent = `$ ${totalExpenses.toLocaleString()}`;
    };

    const renderExpenseTable = () => {
        expenseTableBody.innerHTML = "";
        expenses.forEach((exp, index) => {
            const isChecked = exp.status === "done" ? "checked" : "";
            const statusClass = exp.status === "done" ? "submitted" : "not-submitted";
            const statusText = exp.status === "done" ? "Done" : "Pending";

            const row = `
                <tr data-bs-toggle="collapse" data-bs-target="#row${index}" style="cursor:pointer;">
                    <td><input type="checkbox" class="row-checkbox" data-index="${index}" ${isChecked}></td>
                    <td>${exp.description}</td>
                    <td>${exp.category}</td>
                    <td>$ ${exp.amount.toLocaleString()}</td>
                    <td>${new Date(exp.date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
                <tr class="collapse" id="row${index}">
                    <td></td>
                    <td colspan="5">📝 ${exp.description}</td>
                </tr>
            `;
            expenseTableBody.innerHTML += row;
        });

        attachCheckboxEvents();
        updateHeaderCheckbox();
    };

    const attachCheckboxEvents = () => {
        const rowCheckboxes = document.querySelectorAll(".row-checkbox");
        rowCheckboxes.forEach(cb => {
            cb.addEventListener("change", e => {
                const index = e.target.dataset.index;
                expenses[index].status = e.target.checked ? "done" : "pending";
                localStorage.setItem("expenses", JSON.stringify(expenses));
                renderExpenseTable();
            });
        });
    };

    const updateHeaderCheckbox = () => {
        if (!selectAllCheckbox) return;
        selectAllCheckbox.checked = expenses.length && expenses.every(e => e.status === "done");
    };

    selectAllCheckbox.addEventListener("change", e => {
        const checked = e.target.checked;
        expenses.forEach(exp => exp.status = checked ? "done" : "pending");
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenseTable();
    });

    const renderRecentExpenses = () => {
        if (!recentExpenseTableBody) return;
        recentExpenseTableBody.innerHTML = "";
        const recent = [...expenses].slice(-5).reverse();
        recent.forEach(exp => {
            recentExpenseTableBody.innerHTML += `
                <tr>
                    <td>${exp.description}</td>
                    <td>${exp.category}</td>
                    <td>$ ${exp.amount.toLocaleString()}</td>
                </tr>
            `;
        });
    };

    expenseForm.addEventListener("submit", e => {
        e.preventDefault();
        const amount = parseFloat(expenseAmount.value);
        const category = expenseCategory.value;
        const date = expenseDate.value;
        const description = expenseDescription.value;

        if (isNaN(amount) || amount <= 0 || !category || !date || !description) {
            alert("Please fill all fields correctly");
            return;
        }

        expenses.push({ amount, category, date, description, status: "pending" });
        totalExpenses += amount;

        // Save to localStorage
        localStorage.setItem("expenses", JSON.stringify(expenses));
        localStorage.setItem("totalExpenses", totalExpenses);

        showSection(expensesPage, navExpenses);
        updateExpenseCard();
        renderExpenseTable();
        renderRecentExpenses();
        updateBalance();
        expenseForm.reset();
    });

    // -------------------- Sorting --------------------
    sortByDate.addEventListener("click", () => { expenses.sort((a,b)=>new Date(b.date)-new Date(a.date)); renderExpenseTable(); });
    sortAZ.addEventListener("click", () => { expenses.sort((a,b)=>b.description.localeCompare(a.description)); renderExpenseTable(); });
    sortAmountLow.addEventListener("click", () => { expenses.sort((a,b)=>a.amount-b.amount); renderExpenseTable(); });
    sortAmountHigh.addEventListener("click", () => { expenses.sort((a,b)=>b.amount-a.amount); renderExpenseTable(); });

    [sortByDate, sortAZ, sortAmountLow, sortAmountHigh].forEach(btn => btn.addEventListener("click", e => e.preventDefault()));

    // -------------------- Initial Rendering --------------------
    updateIncomeCards();
    renderIncomeTable();
    updateExpenseCard();
    renderExpenseTable();
    renderRecentExpenses();
    updateBalance();

});