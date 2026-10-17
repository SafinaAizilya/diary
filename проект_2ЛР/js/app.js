const STORAGE_KEY = "diary-items-v1";

const DEFAULT_ITEMS = [
  {
    id: "1",
    title: "Прогулка в осеннем парке",
    description: "Гуляла по парку, собирала листья и пила кофе. Погода была тёплая, солнечная. Встретила знакомую с собакой, поболтали. Домой вернулась уставшая, но довольная.",
    date: "2026-09-12",
    mood: "радость",
    tags: "#осень #прогулка",
    image: "https://picsum.photos/seed/diary1/400/300",
  },
  {
    id: "2",
    title: "Уютный вечер с книгой",
    description: "Читала роман под пледом, пила чай с мёдом. За окном шёл дождь, а мне было тепло и спокойно. Дочитала до середины — сюжет захватывает.",
    date: "2026-09-10",
    mood: "спокойствие",
    tags: "#книги #уют",
    image: "https://picsum.photos/seed/diary2/400/300",
  },
  {
    id: "3",
    title: "Встреча с подругами",
    description: "Посидели в новом кафе, много смеялись. Обсуждали планы на отпуск, делились новостями. Время пролетело незаметно.",
    date: "2026-09-08",
    mood: "радость",
    tags: "#друзья #кафе",
    image: "https://picsum.photos/seed/diary3/400/300",
  },
  {
    id: "4",
    title: "Дождливый день дома",
    description: "Смотрела фильм, грустила, но было тепло. Иногда полезно просто побыть одной и подумать о своём.",
    date: "2026-09-05",
    mood: "грусть",
    tags: "#дождь #дом",
    image: "https://picsum.photos/seed/diary4/400/300",
  },
  {
    id: "5",
    title: "Новый рецепт: паста",
    description: "Приготовила пасту с томатами, получилось вкусно! Добавила базилик и пармезан. Обязательно повторю.",
    date: "2026-09-03",
    mood: "вдохновение",
    tags: "#еда #готовка",
    image: "https://picsum.photos/seed/diary5/400/300",
  },
  {
    id: "6",
    title: "Утренняя йога",
    description: "Начала утро с йоги, чувствую себя прекрасно. 20 минут растяжки, и день пошёл совсем по-другому.",
    date: "2026-09-01",
    mood: "энергия",
    tags: "#спорт #утро",
    image: "https://picsum.photos/seed/diary6/400/300",
  },
];

const state = {
  items: [],
  searchQuery: "",
  selectedMood: "all",
  sortBy: "date-desc",
};

const cardsContainer = document.getElementById("cardsContainer");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const moodFilter = document.getElementById("moodFilter");
const sortSelect = document.getElementById("sortSelect");
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const addForm = document.getElementById("addForm");

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const viewModal = document.getElementById("viewModal");
const viewDate = document.getElementById("viewDate");
const viewTitle = document.getElementById("viewTitle");
const viewMood = document.getElementById("viewMood");
const viewText = document.getElementById("viewText");
const viewTags = document.getElementById("viewTags");

let pendingDeleteId = null;

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Не удалось прочитать localStorage:", error);
  }
  return DEFAULT_ITEMS.slice();
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (error) {
    console.warn("Не удалось сохранить в localStorage:", error);
  }
}

function getVisibleItems() {
  let result = state.items.slice();

  const query = state.searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(query)
    );
  }

  if (state.selectedMood !== "all") {
    result = result.filter((item) => item.mood === state.selectedMood);
  }

  result.sort((a, b) => {
    switch (state.sortBy) {
      case "date-asc":
        return a.date.localeCompare(b.date);
      case "date-desc":
        return b.date.localeCompare(a.date);
      case "title-asc":
        return a.title.localeCompare(b.title, "ru");
      case "title-desc":
        return b.title.localeCompare(a.title, "ru");
      default:
        return 0;
    }
  });

  return result;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function formatToday() {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function createCardElement(item) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = item.id;

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.title;
  article.appendChild(img);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "card-delete";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "Удалить запись");
  deleteBtn.dataset.action = "delete";
  article.appendChild(deleteBtn);

  const title = document.createElement("h3");
  title.textContent = item.title;
  article.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = item.description;
  article.appendChild(desc);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${formatDate(item.date)} · ${item.mood}`;
  article.appendChild(meta);

  if (item.tags) {
    const tags = document.createElement("p");
    tags.className = "tags";
    tags.textContent = item.tags;
    article.appendChild(tags);
  }

  return article;
}

function render() {
  const visible = getVisibleItems();

  cardsContainer.textContent = "";

  if (visible.length === 0) {
    emptyMessage.hidden = false;
  } else {
    emptyMessage.hidden = true;
    visible.forEach((item) => {
      cardsContainer.appendChild(createCardElement(item));
    });
  }
}

function updateState(patch) {
  Object.assign(state, patch);
  render();
}

function openModal() {
  modal.hidden = false;
  addForm.reset();
  clearErrors();

  document.getElementById("diaryDate").textContent = formatToday();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateInput").value = today;

  document.getElementById("titleInput").focus();
}

function closeModal() {
  modal.hidden = true;
}

function openView(id) {
  const item = state.items.find((item) => item.id === id);
  if (!item) return;

  viewDate.textContent = formatDate(item.date);
  viewTitle.textContent = item.title;
  viewMood.textContent = `Настроение: ${item.mood}`;
  viewText.textContent = item.description;
  viewTags.textContent = item.tags || "";

  viewModal.hidden = false;
}

function closeView() {
  viewModal.hidden = true;
}

function clearErrors() {
  addForm.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
  addForm.querySelectorAll("input, select, textarea").forEach((el) => {
    el.classList.remove("invalid");
  });
}

function showErrors() {
  clearErrors();

  const title = document.getElementById("titleInput");
  const desc = document.getElementById("descInput");
  const date = document.getElementById("dateInput");
  const mood = document.getElementById("moodInput");

  if (title.validity.valueMissing) {
    setError("titleInput", "Введите название");
  } else if (title.validity.tooShort) {
    setError("titleInput", "Минимум 3 символа");
  }

  if (desc.validity.valueMissing) {
    setError("descInput", "Введите описание");
  } else if (desc.validity.tooShort) {
    setError("descInput", "Минимум 5 символов");
  }

  if (date.validity.valueMissing) {
    setError("dateInput", "Выберите дату");
  }

  if (mood.validity.valueMissing) {
    setError("moodInput", "Выберите настроение");
  }

  const firstInvalid = addForm.querySelector(".invalid");
  if (firstInvalid) firstInvalid.focus();
}

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = addForm.querySelector(`[data-error-for="${fieldId}"]`);
  if (errorEl) errorEl.textContent = message;
  field.classList.add("invalid");
}

function handleAddSubmit(event) {
  event.preventDefault();

  if (!addForm.checkValidity()) {
    showErrors();
    return;
  }

  const formData = new FormData(addForm);
  const newItem = {
    id: String(Date.now()),
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    date: formData.get("date"),
    mood: formData.get("mood"),
    tags: formData.get("tags").trim(),
    image: `https://picsum.photos/seed/${Date.now()}/400/300`,
  };

  state.items.unshift(newItem);
  saveItems();
  render();
  closeModal();
}

function handleDelete(id) {
  const item = state.items.find((item) => item.id === id);
  if (!item) return;

  pendingDeleteId = id;
  confirmText.textContent = `Удалить запись «${item.title}»? Это действие нельзя отменить.`;
  confirmModal.hidden = false;
}

function confirmDelete() {
  if (!pendingDeleteId) return;

  state.items = state.items.filter((item) => item.id !== pendingDeleteId);
  saveItems();
  render();

  pendingDeleteId = null;
  confirmModal.hidden = true;
}

function closeConfirm() {
  pendingDeleteId = null;
  confirmModal.hidden = true;
}

searchInput.addEventListener("input", (event) => {
  updateState({ searchQuery: event.target.value });
});

moodFilter.addEventListener("change", (event) => {
  updateState({ selectedMood: event.target.value });
});

sortSelect.addEventListener("change", (event) => {
  updateState({ sortBy: event.target.value });
});

addBtn.addEventListener("click", openModal);

addForm.addEventListener("submit", handleAddSubmit);

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close !== undefined) {
    closeModal();
  }
});

viewModal.addEventListener("click", (event) => {
  if (event.target.dataset.viewClose !== undefined) {
    closeView();
  }
});

confirmDeleteBtn.addEventListener("click", confirmDelete);

confirmModal.addEventListener("click", (event) => {
  if (event.target.dataset.confirmClose !== undefined) {
    closeConfirm();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!modal.hidden) closeModal();
  if (!viewModal.hidden) closeView();
  if (!confirmModal.hidden) closeConfirm();
});

cardsContainer.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    const card = deleteBtn.closest(".card");
    if (card) handleDelete(card.dataset.id);
    return;
  }

  const card = event.target.closest(".card");
  if (card) openView(card.dataset.id);
});

function init() {
  state.items = loadItems();
  render();
}

init();