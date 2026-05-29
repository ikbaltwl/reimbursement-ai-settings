const policyForm = document.querySelector("#policyForm");
const aiEnabled = document.querySelector("#aiEnabled");
const aiConfig = document.querySelector("#aiConfig");
const closeBanner = document.querySelector("#closeBanner");
const infoBanner = document.querySelector("#infoBanner");
const addCriteria = document.querySelector("#addCriteria");
const criteriaList = document.querySelector("#criteriaList");
const runAiAutomatically = document.querySelector("#runAiAutomatically");
const aiScheduleFields = document.querySelector("#aiScheduleFields");
const tipsToggle = document.querySelector("#tipsToggle");
const tipsText = document.querySelector("#tipsText");
const policyBuilderConfig = document.querySelector("#policyBuilderConfig");
const allowedRelationshipList = document.querySelector("#allowedRelationshipList");
const addEligibilityRule = document.querySelector("#addEligibilityRule");
const eligibilityRuleList = document.querySelector("#eligibilityRuleList");
const addReceiptExtraction = document.querySelector("#addReceiptExtraction");
const receiptExtractionList = document.querySelector("#receiptExtractionList");
const addSupportingDocument = document.querySelector("#addSupportingDocument");
const supportingDocumentList = document.querySelector("#supportingDocumentList");
const useCurrency = document.querySelector("#useCurrency");
const currencyBlock = document.querySelector("#currencyBlock");
const currencySelect = policyForm.elements.currency;
const conversionFields = document.querySelector("#conversionFields");
const noExpiryDate = document.querySelector("#noExpiryDate");
const expiryCard = document.querySelector("#expiryCard");
const expiryFields = document.querySelector("#expiryFields");
const maxRequestEnabled = document.querySelector("#maxRequestEnabled");
const maxRequestField = document.querySelector("#maxRequestField");
const limitAmount = document.querySelector("#limitAmount");
const benefitBody = document.querySelector("#benefitBody");
const addBenefit = document.querySelector("#addBenefit");
const simulateButton = document.querySelector("#simulateButton");
const exportButton = document.querySelector("#exportButton");
const resetButton = document.querySelector("#resetButton");
const modal = document.querySelector("#simulationModal");
const closeModal = document.querySelector("#closeModal");
const modalEyebrow = document.querySelector("#modalEyebrow");
const modalTitle = document.querySelector("#simulationTitle");
const modalCopy = document.querySelector("#simulationCopy");
const modalDetails = document.querySelector("#modalDetails");
const toast = document.querySelector("#toast");
const criteriaPopover = document.querySelector("#criteriaPopover");
const criteriaPopoverSearch = document.querySelector("#criteriaPopoverSearch");
const criteriaPopoverList = document.querySelector("#criteriaPopoverList");
const relationshipPopover = document.querySelector("#relationshipPopover");
const relationshipPopoverSearch = document.querySelector("#relationshipPopoverSearch");
const relationshipPopoverList = document.querySelector("#relationshipPopoverList");

let activeValuePicker = null;
let activeRelationshipPicker = null;
let eligibilityRuleId = 0;
let supportingDocumentId = 0;
let extractionRowId = 0;
let documentConditionId = 0;

const extendedTips =
  "Use positive and negative examples, include merchant names only when needed, and describe edge cases such as unclear receipts, mixed items, or suspicious edits.";

const criteriaSuggestions = {
  "merchant type": ["Klinik Umum", "Klinik Pratama", "Rumah Sakit", "Apotek", "Laboratorium", "Optik"],
  "receipt type": [
    "Printed invoice Klinik/RS",
    "Pharmacy Receipt",
    "Lab Result Invoice",
    "Digital Receipt",
    "Prescription Copy",
  ],
  items: ["Cosmetics", "Skincare", "Hair Loss Treatment", "Botox", "Filler", "Supplements"],
  "claim amount": ["Policy limit", "Remaining balance", "Monthly allowance", "Annual allowance"],
  "receipt date": ["Submitted date", "Receipt issued date", "Approval date"],
};

const currencyPrefixes = {
  "US Dollar": "USD",
  "Indonesian Rupiah": "Rp",
  "Singapore Dollar": "SGD",
  Euro: "EUR",
};

const familyRelationships = [
  { value: "", label: "Select relationship" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "sibling", label: "Sibling" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "cousin", label: "Cousin" },
  { value: "nibling", label: "Nibling" },
  { value: "parent_in_law", label: "Parent In Law" },
  { value: "brother_in_law", label: "Brother In Law" },
  { value: "sister_in_law", label: "Sister In Law" },
  { value: "uncle", label: "Uncle" },
  { value: "aunt", label: "Aunt" },
  { value: "grandfather", label: "Grandfather" },
  { value: "grandmother", label: "Grandmother" },
  { value: "friend", label: "Friend" },
  { value: "coworker", label: "Coworker" },
  { value: "others", label: "Others" },
];

const conditionFields = [
  { value: "Items / Keywords", label: "Items / Keywords", type: "tags" },
  { value: "Merchant Type", label: "Merchant type", type: "tags" },
  { value: "Receipt Type", label: "Receipt type", type: "tags" },
  { value: "Amount", label: "Amount", type: "amount" },
  { value: "Receipt Date", label: "Receipt date", type: "number" },
  { value: "employee_gender", label: "Employee gender", type: "gender" },
  { value: "employee_marital_status", label: "Employee marital status", type: "maritalStatus" },
];

const eligibilityConditionFields = conditionFields.filter((field) =>
  ["tags", "gender", "maritalStatus"].includes(field.type),
);

const fieldValueOptions = {
  gender: ["male", "female"],
  maritalStatus: ["single", "married", "divorced", "widowed"],
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setDisabled(container, disabled) {
  container.querySelectorAll("input, select, textarea, button").forEach((field) => {
    field.disabled = disabled;
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function syncAiState() {
  const enabled = aiEnabled.checked;
  policyForm.classList.toggle("ai-disabled", !enabled);
  aiConfig.hidden = !enabled;
  simulateButton.hidden = !enabled;
  setDisabled(aiConfig, !enabled);
  if (!enabled) {
    closeCriteriaPopover();
  }
}

function syncScheduleState() {
  const hidden = !runAiAutomatically.checked;
  aiScheduleFields.hidden = hidden;
  aiScheduleFields.classList.toggle("is-hidden", hidden);
}

function syncCurrencyState() {
  const currencyEnabled = useCurrency.checked;
  const hidden = !currencyEnabled;
  currencyBlock.hidden = hidden;
  currencyBlock.classList.toggle("is-hidden", hidden);
  syncAmountPrefixes();
}

function syncCurrencyMethod() {
  const method = policyForm.querySelector('input[name="currencyMethod"]:checked')?.value;
  const converting = method === "convert" && useCurrency.checked;
  if (!useCurrency.checked) {
    conversionFields.classList.remove("is-muted");
    setDisabled(conversionFields, false);
    return;
  }
  conversionFields.classList.toggle("is-muted", !converting);
  setDisabled(conversionFields, !converting);
}

function syncExpiryState() {
  const disabled = noExpiryDate.checked;
  expiryCard.classList.toggle("is-muted", disabled);
  const expiryMode = policyForm.querySelector('input[name="expiry"]:checked')?.value;
  setDisabled(expiryFields, disabled || expiryMode !== "custom");
  expiryCard.querySelectorAll('input[name="expiry"]').forEach((radio) => {
    radio.disabled = disabled;
  });
}

function syncMaxRequestState() {
  const enabled = maxRequestEnabled.checked;
  maxRequestField.classList.toggle("is-muted", !enabled);
  setDisabled(maxRequestField, !enabled);
}

function syncLimitState() {
  const limitType = policyForm.querySelector('input[name="limitType"]:checked')?.value;
  limitAmount.disabled = limitType !== "amount";
}

function getActiveAmountPrefix() {
  if (!useCurrency.checked) {
    return "Rp";
  }

  return currencyPrefixes[currencySelect.value] || "Rp";
}

function replaceAmountPrefix(value, prefix) {
  const [, amount = "0"] = String(value || "").split("|");
  return `${prefix} | ${amount.trim() || "0"}`;
}

function getBenefitMaxRequestInputs() {
  return Array.from(benefitBody.querySelectorAll('input[aria-label^="Max request"]'));
}

function syncAmountPrefixes() {
  const prefix = getActiveAmountPrefix();
  limitAmount.value = replaceAmountPrefix(limitAmount.value, prefix);
  getBenefitMaxRequestInputs().forEach((input) => {
    input.value = replaceAmountPrefix(input.value, prefix);
  });
}

function renumberCriteria() {
  criteriaList.querySelectorAll("[data-criteria]").forEach((row, index) => {
    const number = index + 1;
    row.querySelector(".criteria-label").textContent = `Criteria ${number}`;
    row.querySelectorAll("select, input, button").forEach((field) => {
      if (field.getAttribute("aria-label")) {
        field.setAttribute("aria-label", field.getAttribute("aria-label").replace(/criteria \d+/i, `criteria ${number}`));
          }
    });
    row
      .querySelector("[data-remove-criteria]")
      ?.setAttribute("aria-label", `Remove criteria ${number}`);
  });
}

function createChip(value) {
  const chip = document.createElement("span");
  chip.append(document.createTextNode(value));
  chip.append(document.createTextNode(" "));
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", `Remove ${value}`);
  button.innerHTML = "&times;";
  chip.append(button);
  return chip;
}

function createCriteriaRemoveButton(number) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "criteria-remove-button";
  button.dataset.removeCriteria = "";
  button.setAttribute("aria-label", `Remove criteria ${number}`);
  button.innerHTML = "&times;";
  return button;
}

function ensureCriteriaRemoveButtons() {
  criteriaList.querySelectorAll("[data-criteria]").forEach((row, index) => {
    if (!row.querySelector("[data-remove-criteria]")) {
      row.append(createCriteriaRemoveButton(index + 1));
    }
  });
}

function getSuggestionKey(row) {
  return row.querySelector("select")?.value.toLowerCase() || "merchant type";
}

function getSuggestionsForRow(row) {
  const suggestions = criteriaSuggestions[getSuggestionKey(row)] || criteriaSuggestions["merchant type"];
  return suggestions.filter((item) => !hasChip(row, item));
}

function hasChip(row, value) {
  return Array.from(row.querySelectorAll(".chips span")).some(
    (chip) => chip.childNodes[0].textContent.trim().toLowerCase() === value.toLowerCase(),
  );
}

function addChipToRow(row, value) {
  const cleanValue = value.trim();
  if (!cleanValue) {
    showToast("Type a value before adding it");
    return;
  }

  if (hasChip(row, cleanValue)) {
    showToast(`${cleanValue} already exists`);
    return;
  }

  row.querySelector(".chips").append(createChip(cleanValue));
  renderCriteriaPopover();
  showToast(`Added ${cleanValue}`);
}

function closeCriteriaPopover() {
  criteriaPopover.hidden = true;
  criteriaPopoverSearch.value = "";
  activeValuePicker = null;
}

function positionCriteriaPopover(button) {
  const rect = button.getBoundingClientRect();
  const viewportPadding = 12;
  const left = Math.min(rect.left, window.innerWidth - 314 - viewportPadding);
  criteriaPopover.style.left = `${Math.max(viewportPadding, left)}px`;
  criteriaPopover.style.top = `${rect.bottom + 4}px`;
}

function renderCriteriaPopover() {
  if (!activeValuePicker) return;

  const row = activeValuePicker.closest("[data-criteria]");
  const query = criteriaPopoverSearch.value.trim();
  const suggestions = getSuggestionsForRow(row);
  const filtered = query
    ? suggestions.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  criteriaPopoverList.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach((item) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "popover-option";
      option.setAttribute("role", "option");
      option.dataset.value = item;
      option.textContent = item;
      criteriaPopoverList.append(option);
    });
    return;
  }

  if (query) {
    if (hasChip(row, query)) {
      const selectedOption = document.createElement("button");
      selectedOption.type = "button";
      selectedOption.className = "popover-option is-disabled";
      selectedOption.disabled = true;
      selectedOption.textContent = `"${query}" already selected`;
      criteriaPopoverList.append(selectedOption);
      return;
    }

    const addOption = document.createElement("button");
    addOption.type = "button";
    addOption.className = "popover-option is-add";
    addOption.setAttribute("role", "option");
    addOption.dataset.value = query;
    addOption.textContent = `Add "${query}"`;
    criteriaPopoverList.append(addOption);
  }
}

function openCriteriaPopover(button) {
  closeRelationshipPopover();
  activeValuePicker = button;
  positionCriteriaPopover(button);
  criteriaPopover.hidden = false;
  criteriaPopoverSearch.value = "";
  renderCriteriaPopover();
  criteriaPopoverSearch.focus();
}

function closeRelationshipPopover() {
  relationshipPopover.hidden = true;
  relationshipPopoverSearch.value = "";
  activeRelationshipPicker = null;
}

function positionRelationshipPopover(button) {
  const rect = button.getBoundingClientRect();
  const viewportPadding = 12;
  const left = Math.min(rect.left, window.innerWidth - 314 - viewportPadding);
  relationshipPopover.style.left = `${Math.max(viewportPadding, left)}px`;
  relationshipPopover.style.top = `${rect.bottom + 4}px`;
}

function getAvailableRelationships(container) {
  return familyRelationships.filter(
    (relationship) => relationship.value && !hasRelationshipChip(container, relationship.value),
  );
}

function renderRelationshipPopover() {
  if (!activeRelationshipPicker) return;

  const container = activeRelationshipPicker.closest(".relationship-list");
  const query = relationshipPopoverSearch.value.trim().toLowerCase();
  const relationships = getAvailableRelationships(container);
  const filtered = query
    ? relationships.filter((relationship) => relationship.label.toLowerCase().includes(query))
    : relationships;

  relationshipPopoverList.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach((relationship) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "popover-option";
      option.setAttribute("role", "option");
      option.dataset.value = relationship.value;
      option.textContent = relationship.label;
      relationshipPopoverList.append(option);
    });
    return;
  }

  const emptyOption = document.createElement("button");
  emptyOption.type = "button";
  emptyOption.className = "popover-option is-disabled";
  emptyOption.disabled = true;
  emptyOption.textContent = relationships.length ? "No relationship found" : "All relationships selected";
  relationshipPopoverList.append(emptyOption);
}

function openRelationshipPopover(button) {
  closeCriteriaPopover();
  activeRelationshipPicker = button;
  positionRelationshipPopover(button);
  relationshipPopover.hidden = false;
  relationshipPopoverSearch.value = "";
  renderRelationshipPopover();
  relationshipPopoverSearch.focus();
}

function createCriteriaRow(number) {
  const wrapper = document.createElement("article");
  wrapper.className = "criteria-row";
  wrapper.dataset.criteria = "";
  wrapper.innerHTML = `
    <div class="criteria-label">Criteria ${number}</div>
    <div class="criteria-fields">
      <select aria-label="Criteria ${number} type">
        <option>Merchant type</option>
        <option>Receipt type</option>
        <option>Receipt date</option>
        <option>Items</option>
        <option>Claim amount</option>
      </select>
      <select aria-label="Criteria ${number} operator">
        <option>Includes</option>
        <option>Excludes</option>
        <option>Is less than</option>
        <option>Is greater than</option>
      </select>
      <button
        type="button"
        class="value-picker"
        data-value-picker
        aria-label="Open criteria ${number} value picker"
        aria-haspopup="listbox"
      >
        Select type
      </button>
      <div class="chips span-fields" aria-label="Selected values"></div>
    </div>
    <button type="button" class="criteria-remove-button" data-remove-criteria aria-label="Remove criteria ${number}">&times;</button>
  `;
  return wrapper;
}

function addCriteriaRow() {
  const existing = criteriaList.querySelectorAll("[data-criteria]").length;
  const connector = document.createElement("div");
  connector.className = "connector";
  connector.innerHTML = "<span>And</span>";

  const decisionConnector = criteriaList.querySelector(".decision-connector");
  criteriaList.insertBefore(connector, decisionConnector);
  criteriaList.insertBefore(createCriteriaRow(existing + 1), decisionConnector);
  showToast("Added AI criteria");
}

function removeCriteria(row) {
  if (criteriaList.querySelectorAll("[data-criteria]").length === 1) {
    showToast("At least one AI criteria is required");
    return;
  }

  const previous = row.previousElementSibling;
  const next = row.nextElementSibling;
  if (previous?.classList.contains("connector")) {
    previous.remove();
  } else if (next?.classList.contains("connector") && !next.classList.contains("decision-connector")) {
    next.remove();
  }
  row.remove();
  renumberCriteria();
  showToast("Removed AI criteria");
}

function getConditionField(value) {
  return conditionFields.find((field) => field.value === value) || conditionFields[0];
}

function conditionFieldOptionsHtml(fields, selectedValue) {
  return fields
    .map(
      (field) =>
        `<option value="${escapeHtml(field.value)}"${field.value === selectedValue ? " selected" : ""}>${escapeHtml(
          field.label,
        )}</option>`,
    )
    .join("");
}

function conditionOperatorOptionsHtml(fieldValue, selectedValue) {
  const type = getConditionField(fieldValue).type;
  const options =
    type === "tags"
      ? [
          ["contains", "Includes"],
          ["not_contains", "Excludes"],
        ]
      : type === "amount" || type === "number"
        ? [
            [">", "Greater than"],
            [">=", "Greater than or equal"],
            ["<", "Less than"],
            ["<=", "Less than or equal"],
            ["=", "Equals"],
          ]
        : [["=", "Is"]];

  const selected = selectedValue || options[0][0];
  return options
    .map(
      ([value, label]) =>
        `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`,
    )
    .join("");
}

function toValueArray(values) {
  if (Array.isArray(values)) return values;
  if (values === undefined || values === null || values === "") return [];
  return [String(values)];
}

function tagEditorHtml(values = [], placeholder = "Type and press Enter") {
  const chips = toValueArray(values)
    .map((value) => {
      const cleanValue = String(value).trim();
      return cleanValue
        ? `<span>${escapeHtml(cleanValue)} <button type="button" data-remove-chip aria-label="Remove ${escapeHtml(
            cleanValue,
          )}">&times;</button></span>`
        : "";
    })
    .join("");

  return `
    <div class="tag-editor">
      <div class="chips" data-tag-chips>${chips}</div>
      <input data-tag-input type="text" placeholder="${escapeHtml(placeholder)}" aria-label="Add condition value" />
    </div>
  `;
}

function normalizeRelationshipValue(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";

  const lowerValue = cleanValue.toLowerCase();
  const relationship = familyRelationships.find(
    (item) => item.value === cleanValue || item.label.toLowerCase() === lowerValue,
  );
  return relationship?.value || cleanValue;
}

function getRelationshipLabel(value) {
  const normalizedValue = normalizeRelationshipValue(value);
  return familyRelationships.find((relationship) => relationship.value === normalizedValue)?.label || normalizedValue;
}

function createRelationshipPickerHtml(label = "Select relationship") {
  return `
    <button
      type="button"
      class="value-picker relationship-picker"
      data-relationship-picker
      aria-label="${escapeHtml(label)}"
      aria-haspopup="listbox"
    >
      Select relationship
    </button>
    <div class="chips relationship-chips" data-relationship-chips aria-label="Selected relationships"></div>
  `;
}

function hasRelationshipChip(container, value) {
  const normalizedValue = normalizeRelationshipValue(value);
  return Array.from(container.querySelectorAll("[data-relationship-chip]")).some(
    (chip) => chip.dataset.relationshipValue === normalizedValue,
  );
}

function createRelationshipChip(value) {
  const normalizedValue = normalizeRelationshipValue(value);
  const chip = createChip(getRelationshipLabel(normalizedValue));
  chip.classList.add("relationship-chip");
  chip.dataset.relationshipChip = "";
  chip.dataset.relationshipValue = normalizedValue;
  chip.querySelector("button").dataset.removeRelationship = "";
  return chip;
}

function addRelationshipChip(container, value, options = {}) {
  const normalizedValue = normalizeRelationshipValue(value);
  if (!normalizedValue) return false;

  if (hasRelationshipChip(container, normalizedValue)) {
    if (!options.silent) {
      showToast(`${getRelationshipLabel(normalizedValue)} already selected`);
    }
    return false;
  }

  container.querySelector("[data-relationship-chips]").append(createRelationshipChip(normalizedValue));
  if (!options.silent) {
    showToast(`Added ${getRelationshipLabel(normalizedValue)}`);
  }
  return true;
}

function renderRelationshipPicker(container, values = [], label = "Select relationship") {
  container.innerHTML = createRelationshipPickerHtml(label);
  toValueArray(values).forEach((value) => addRelationshipChip(container, value, { silent: true }));
}

function conditionValueHtml(fieldValue, condition = {}) {
  const field = getConditionField(fieldValue);
  const values = condition.values ?? condition.value ?? "";
  const firstValue = Array.isArray(values) ? (values[0] ?? "") : values;

  if (field.type === "tags") {
    return tagEditorHtml(values, "Type value and press Enter");
  }

  if (field.type === "amount") {
    return `
      <div class="amount-value-grid">
        <input data-condition-value-input type="number" value="${escapeHtml(firstValue)}" aria-label="Condition amount" />
        <input data-condition-currency maxlength="3" value="${escapeHtml(condition.currency || "IDR")}" aria-label="Currency" />
      </div>
    `;
  }

  if (field.type === "number") {
    return `<input data-condition-value-input type="number" value="${escapeHtml(firstValue)}" aria-label="Condition value" />`;
  }

  const options = (fieldValueOptions[field.type] || [])
    .map((option) => `<option value="${escapeHtml(option)}"${option === firstValue ? " selected" : ""}>${escapeHtml(option)}</option>`)
    .join("");
  return `<select data-condition-value-input aria-label="Condition value">${options}</select>`;
}

function renderConditionControls(row, condition = {}) {
  const fieldSelect = row.querySelector("[data-condition-field]");
  const operatorSelect = row.querySelector("[data-condition-operator]");
  const valueWrap = row.querySelector("[data-condition-value]");
  const fieldValue = condition.field || fieldSelect.value;

  fieldSelect.value = fieldValue;
  operatorSelect.innerHTML = conditionOperatorOptionsHtml(fieldValue, condition.operator);
  valueWrap.innerHTML = conditionValueHtml(fieldValue, condition);
}

function conditionFieldsHtml(fields, condition = {}) {
  const selectedField = condition.field || fields[0].value;
  return `
    <label class="line-field">
      <span>Field</span>
      <select data-condition-field aria-label="Condition field">
        ${conditionFieldOptionsHtml(fields, selectedField)}
      </select>
    </label>
    <label class="line-field">
      <span>Operator</span>
      <select data-condition-operator aria-label="Condition operator"></select>
    </label>
    <label class="line-field condition-value-field">
      <span>Value</span>
      <div data-condition-value></div>
    </label>
  `;
}

function createEligibilityRule(config = {}) {
  const id = eligibilityRuleId++;
  const condition = config.when || {
    field: config.field || "Items / Keywords",
    operator: config.operator || "contains",
    values: config.values || [],
  };
  const row = document.createElement("article");
  row.className = "builder-rule";
  row.dataset.eligibilityRule = "";
  row.innerHTML = `
    <div class="builder-rule-header">
      <strong>When</strong>
      <button type="button" class="text-button danger" data-remove-eligibility-rule aria-label="Remove eligibility rule ${id + 1}">Remove</button>
    </div>
    <div class="condition-grid">
      ${conditionFieldsHtml(eligibilityConditionFields, condition)}
    </div>
    <fieldset class="relationship-override">
      <legend>Allowed family relationship override</legend>
      <div class="relationship-list" data-relationship-list></div>
    </fieldset>
  `;
  renderConditionControls(row, condition);
  const relationshipList = row.querySelector("[data-relationship-list]");
  const relationships = config.allowedRelationships || config.allowedClaimants || [];
  renderRelationshipPicker(relationshipList, relationships, "Select override relationship");
  return row;
}

function addEligibilityRuleRow(config) {
  eligibilityRuleList.append(createEligibilityRule(config));
}

function setConfigPanelOpen(bodyId, open) {
  const body = document.querySelector(`#${bodyId}`);
  const trigger = document.querySelector(`[data-config-toggle="${bodyId}"]`);
  body.classList.toggle("is-open", open);
  trigger.setAttribute("aria-expanded", String(open));
}

function createExtractionWhenPanel(when = {}) {
  const fieldOptions = ['<option value="">Always</option>']
    .concat(
      conditionFields.map(
        (field) =>
          `<option value="${escapeHtml(field.value)}"${field.value === when.field ? " selected" : ""}>${escapeHtml(
            field.label,
          )}</option>`,
      ),
    )
    .join("");
  const values = Array.isArray(when.values) ? when.values.join(", ") : (when.values ?? "");

  return `
    <div class="extraction-when-panel${when.field ? " is-open" : ""}">
      <div class="condition-caption">Additional extraction is required only when this condition matches.</div>
      <div class="when-grid">
        <label class="line-field">
          <span>Required when</span>
          <select data-extraction-when-field aria-label="Extraction required when field">${fieldOptions}</select>
        </label>
        <label class="line-field">
          <span>Operator</span>
          <select data-extraction-when-operator aria-label="Extraction required when operator">
            <option value="includes"${when.operator === "includes" ? " selected" : ""}>Includes</option>
            <option value="excludes"${when.operator === "excludes" ? " selected" : ""}>Excludes</option>
            <option value="="${when.operator === "=" ? " selected" : ""}>Equals</option>
            <option value=">"${when.operator === ">" ? " selected" : ""}>Greater than</option>
            <option value="<"${when.operator === "<" ? " selected" : ""}>Less than</option>
          </select>
        </label>
        <label class="line-field">
          <span>Value</span>
          <input data-extraction-when-value value="${escapeHtml(values)}" aria-label="Extraction required when value" />
        </label>
      </div>
    </div>
  `;
}

function extractionRequirementHtml(id, mandatory = false) {
  return `
    <div class="segmented-control extraction-requirement" role="radiogroup" aria-label="Extraction requirement">
      <label>
        <input
          data-extraction-requirement
          name="extractionRequirement${id}"
          type="radio"
          value="optional"
          ${mandatory ? "" : "checked"}
        />
        <span>Optional</span>
      </label>
      <label>
        <input
          data-extraction-requirement
          name="extractionRequirement${id}"
          type="radio"
          value="mandatory"
          ${mandatory ? "checked" : ""}
        />
        <span>Mandatory</span>
      </label>
    </div>
  `;
}

function createExtractionRow(config = {}, options = {}) {
  const id = extractionRowId++;
  const withWhen = Boolean(options.withWhen);
  const when = config.when || {};
  const hasWhen = Boolean(when.field);
  const row = document.createElement("article");
  row.className = `extraction-row${withWhen ? " has-when" : ""}`;
  row.dataset.extractionRow = "";
  row.innerHTML = `
    <input data-extraction-key value="${escapeHtml(config.key || "")}" placeholder="Field key" aria-label="Extraction field key ${id + 1}" />
    <input data-extraction-description value="${escapeHtml(config.description || "")}" placeholder="Description" aria-label="Extraction description ${
      id + 1
    }" />
    ${extractionRequirementHtml(id, Boolean(config.mandatory))}
    <button type="button" class="delete-button" data-remove-extraction aria-label="Remove extraction field">&times;</button>
    ${
      withWhen
        ? `
          <div class="extraction-condition-control">
            <label class="legacy-check condition-check">
              <input type="checkbox" data-toggle-extraction-when ${hasWhen ? "checked" : ""} />
              <span class="checkmark" aria-hidden="true"></span>
              <strong>Required only when condition matches</strong>
            </label>
          </div>
        `
        : ""
    }
    ${withWhen ? createExtractionWhenPanel(when) : ""}
  `;
  return row;
}

function addExtractionRow(list, config = {}, options = {}) {
  list.append(createExtractionRow(config, options));
}

function createDocumentConditionRow(condition = {}) {
  const id = documentConditionId++;
  const row = document.createElement("article");
  row.className = "doc-condition-row";
  row.dataset.documentCondition = "";
  row.innerHTML = `
    <div class="condition-grid">
      ${conditionFieldsHtml(conditionFields, condition)}
    </div>
    <button type="button" class="delete-button" data-remove-document-condition aria-label="Remove document condition ${id + 1}">&times;</button>
  `;
  renderConditionControls(row, {
    field: condition.field || "Items / Keywords",
    operator: condition.operator || "contains",
    values: condition.values || [],
    currency: condition.currency,
  });
  return row;
}

function addDocumentConditionRow(list, condition) {
  list.append(createDocumentConditionRow(condition));
}

function syncSupportingDocumentRequirement(block) {
  const conditional = block.querySelector('input[value="conditional"]')?.checked;
  block.querySelector(".conditional-section").classList.toggle("is-open", Boolean(conditional));
}

function createSupportingDocument(config = {}) {
  const id = supportingDocumentId++;
  const conditions = config.requiredWhen || [];
  const conditional = config.requirement === "conditional" || conditions.length > 0;
  const block = document.createElement("article");
  block.className = "document-block";
  block.dataset.supportingDocument = "";
  block.innerHTML = `
    <div class="document-row-header">
      <strong>Supporting document</strong>
      <button type="button" class="text-button danger" data-remove-supporting-document aria-label="Remove supporting document">Remove</button>
    </div>
    <div class="document-form-grid">
      <label class="line-field">
        <span>Document type</span>
        <input data-document-type value="${escapeHtml(config.type || "")}" placeholder="e.g. Prescription" aria-label="Supporting document type" />
      </label>
      <label class="line-field">
        <span>Description</span>
        <input data-document-description value="${escapeHtml(config.description || "")}" placeholder="Brief description" aria-label="Supporting document description" />
      </label>
    </div>
    <div class="requirement-toggle" role="radiogroup" aria-label="Supporting document requirement">
      <label class="radio-row">
        <input name="supportingDocRequirement${id}" type="radio" value="always"${conditional ? "" : " checked"} />
        <span>Always required</span>
      </label>
      <label class="radio-row">
        <input name="supportingDocRequirement${id}" type="radio" value="conditional"${conditional ? " checked" : ""} />
        <span>Conditional</span>
      </label>
    </div>
    <div class="conditional-section${conditional ? " is-open" : ""}">
      <div class="builder-subhead compact-subhead">
        <span>Required if any condition matches</span>
      </div>
      <div class="builder-list" data-document-condition-list></div>
      <button type="button" class="outline-button compact list-add-button" data-add-document-condition>Add condition</button>
    </div>
    <div class="builder-subhead compact-subhead">
      <span>Extractions</span>
    </div>
    <div class="extraction-list" data-document-extraction-list></div>
    <button type="button" class="outline-button compact list-add-button" data-add-document-extraction>Add field</button>
  `;

  const conditionList = block.querySelector("[data-document-condition-list]");
  const extractionList = block.querySelector("[data-document-extraction-list]");
  conditions.forEach((condition) => addDocumentConditionRow(conditionList, condition));
  (config.extractions || []).forEach((extraction) => addExtractionRow(extractionList, extraction));
  return block;
}

function addSupportingDocumentRow(config) {
  supportingDocumentList.append(createSupportingDocument(config));
}

function resetPolicyBuilderConfig() {
  eligibilityRuleId = 0;
  supportingDocumentId = 0;
  extractionRowId = 0;
  documentConditionId = 0;

  setConfigPanelOpen("eligibilityBody", true);
  setConfigPanelOpen("documentationBody", true);

  renderRelationshipPicker(allowedRelationshipList, ["spouse", "child"]);

  eligibilityRuleList.innerHTML = "";
  addEligibilityRuleRow({
    when: { field: "Items / Keywords", operator: "contains", values: ["alat bantu dengar", "hearing aid"] },
    allowedRelationships: [],
  });
  addEligibilityRuleRow({
    when: { field: "employee_gender", operator: "=", values: "female" },
    allowedRelationships: ["child"],
  });

  receiptExtractionList.innerHTML = "";
  addExtractionRow(
    receiptExtractionList,
    { key: "invoice_total", description: "Total invoice amount" },
    { withWhen: true },
  );

  supportingDocumentList.innerHTML = "";
  addSupportingDocumentRow({
    type: "Prescription",
    description: "Doctor prescription for medication claims",
    requirement: "conditional",
    requiredWhen: [{ field: "Items / Keywords", operator: "contains", values: ["Obat", "Resep", "Obat Resep"] }],
    extractions: [
      { key: "diagnosis", description: "Medical diagnosis written on prescription" },
      { key: "prescription_items", description: "List of prescribed medications" },
      { key: "patient_name", description: "Full name of the patient" },
    ],
  });
  addSupportingDocumentRow({
    type: "Payment Proof",
    description: "EDC receipt, QR payment slip, or bank transfer proof",
    requirement: "conditional",
    requiredWhen: [{ field: "Amount", operator: ">=", values: "500000", currency: "IDR" }],
    extractions: [
      { key: "payment_method", description: "Payment method used" },
      { key: "bank_provider", description: "Bank or payment provider name" },
    ],
  });
}

function renumberBenefits() {
  benefitBody.querySelectorAll("tr").forEach((row, index) => {
    row.querySelector("[data-row-number]").textContent = index + 1;
    row.querySelectorAll("input").forEach((input) => {
      const label = input.getAttribute("aria-label") || "";
      input.setAttribute("aria-label", label.replace(/\d+$/, String(index + 1)));
    });
  });
}

function addBenefitRow() {
  const number = benefitBody.querySelectorAll("tr").length + 1;
  const prefix = getActiveAmountPrefix();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-row-number>${number}</td>
    <td><input aria-label="Benefit name ${number}" value="New benefit" /></td>
    <td><input aria-label="Max request ${number}" value="${prefix} | 0" /></td>
    <td><input aria-label="Min next claim ${number}" value="" /></td>
    <td><button type="button" class="outline-button tiny" data-formula>Formula</button></td>
    <td><button type="button" class="delete-button" data-delete-benefit aria-label="Delete benefit">&times;</button></td>
  `;
  benefitBody.append(row);
  showToast("Added benefit row");
}

function openModal({ eyebrow, title, copy, details }) {
  modalEyebrow.textContent = eyebrow;
  modalTitle.textContent = title;
  modalCopy.textContent = copy;
  modalDetails.innerHTML = details
    .map(
      (item) => `
        <div>
          <dt>${item.term}</dt>
          <dd>${item.description}</dd>
        </div>
      `,
    )
    .join("");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeOpenModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function collectCriteria() {
  return Array.from(criteriaList.querySelectorAll("[data-criteria]")).map((row) => {
    const selects = Array.from(row.querySelectorAll("select")).map((select) => select.value);
    const inputs = Array.from(row.querySelectorAll(".criteria-fields > input")).map((input) => input.value);
    const chips = Array.from(row.querySelectorAll(".chips span")).map((chip) =>
      chip.childNodes[0].textContent.trim(),
    );
    return { fields: selects.concat(inputs).filter(Boolean), chips };
  });
}

function collectBenefits() {
  return Array.from(benefitBody.querySelectorAll("tr")).map((row) => {
    const inputs = row.querySelectorAll("input");
    return {
      name: inputs[0]?.value || "",
      maxRequest: inputs[1]?.value || "",
      minNextClaimMonths: inputs[2]?.value || "",
    };
  });
}

function collectTagValues(container) {
  const chips = Array.from(container.querySelectorAll("[data-tag-chips] span")).map((chip) =>
    chip.childNodes[0].textContent.trim(),
  );
  const typedValue = container.querySelector("[data-tag-input]")?.value.trim();
  if (typedValue) {
    chips.push(typedValue.replace(/,$/, ""));
  }
  return chips.filter(Boolean);
}

function collectCondition(row) {
  const field = row.querySelector("[data-condition-field]")?.value;
  const operator = row.querySelector("[data-condition-operator]")?.value;
  const fieldType = getConditionField(field).type;
  const valueWrap = row.querySelector("[data-condition-value]");
  const condition = { field, operator };

  if (fieldType === "tags") {
    const values = collectTagValues(valueWrap);
    if (!values.length) return null;
    condition.values = values;
    return condition;
  }

  const value = valueWrap.querySelector("[data-condition-value-input]")?.value.trim();
  if (!value) return null;
  condition.values = fieldType === "amount" || fieldType === "number" ? Number(value) || value : value;

  const currency = valueWrap.querySelector("[data-condition-currency]")?.value.trim().toUpperCase();
  if (currency) {
    condition.currency = currency;
  }

  return condition;
}

function collectRelationships(container) {
  return Array.from(container.querySelectorAll("[data-relationship-chip]"))
    .map((chip) => chip.dataset.relationshipValue)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function collectEligibility() {
  const allowedRelationships = collectRelationships(allowedRelationshipList);
  const conditionalRestrictions = Array.from(eligibilityRuleList.querySelectorAll("[data-eligibility-rule]"))
    .map((row) => {
      const condition = collectCondition(row);
      if (!condition) return null;
      return {
        when: condition,
        allowed_family_relationships: collectRelationships(row.querySelector("[data-relationship-list]")),
      };
    })
    .filter(Boolean);

  if (!allowedRelationships.length && !conditionalRestrictions.length) return null;
  return {
    allowed_family_relationships: allowedRelationships,
    conditional_restrictions: conditionalRestrictions,
  };
}

function collectExtractionRows(list) {
  return Array.from(list.querySelectorAll(":scope > [data-extraction-row]"))
    .map((row) => {
      const key = row.querySelector("[data-extraction-key]")?.value.trim();
      if (!key) return null;

      const description = row.querySelector("[data-extraction-description]")?.value.trim();
      const whenEnabled = row.querySelector("[data-toggle-extraction-when]")?.checked;
      const whenField = row.querySelector("[data-extraction-when-field]")?.value;
      const whenValue = row.querySelector("[data-extraction-when-value]")?.value.trim();
      const extraction = { key };

      if (description) {
        extraction.description = description;
      }

      if (row.querySelector('[data-extraction-requirement][value="mandatory"]')?.checked) {
        extraction.is_mandatory = true;
      }

      if (whenEnabled && whenField && whenValue) {
        extraction.when = {
          field: whenField,
          operator: row.querySelector("[data-extraction-when-operator]")?.value || "includes",
          values: whenValue.includes(",") ? whenValue.split(",").map((value) => value.trim()).filter(Boolean) : whenValue,
        };
      }

      return extraction;
    })
    .filter(Boolean);
}

function collectDocumentation() {
  const receiptExtractions = collectExtractionRows(receiptExtractionList);
  const supportingDocuments = Array.from(supportingDocumentList.querySelectorAll("[data-supporting-document]"))
    .map((block) => {
      const documentType = block.querySelector("[data-document-type]")?.value.trim();
      if (!documentType) return null;

      const description = block.querySelector("[data-document-description]")?.value.trim();
      const isConditional = block.querySelector('input[value="conditional"]')?.checked;
      const conditionRows = Array.from(block.querySelectorAll("[data-document-condition]"));
      const extractions = collectExtractionRows(block.querySelector("[data-document-extraction-list]"));
      const documentConfig = {
        document_type: documentType,
        required_when: isConditional ? conditionRows.map(collectCondition).filter(Boolean) : [],
        required_extractions: extractions,
      };

      if (description) {
        documentConfig.description = description;
      }

      return documentConfig;
    })
    .filter(Boolean);

  if (!receiptExtractions.length && !supportingDocuments.length) return null;
  return {
    receipt: { required_extractions: receiptExtractions },
    supporting_documents: supportingDocuments,
  };
}

function collectPolicyData() {
  const formData = new FormData(policyForm);
  return {
    reimbursementName: formData.get("reimbursementName"),
    effectiveDate: formData.get("effectiveDate"),
    description: formData.get("description"),
    aiEnabled: aiEnabled.checked,
    ai: aiEnabled.checked
      ? {
          policyCategory: formData.get("policyCategory"),
          decision: formData.get("aiDecision"),
          rules: formData.get("aiRules"),
          runAutomatically: runAiAutomatically.checked,
          scheduleEvery: formData.get("aiScheduleEvery"),
          schedulePeriod: formData.get("aiSchedulePeriod"),
          scheduleStart: formData.get("aiScheduleStart"),
          criteria: collectCriteria(),
          eligibility: collectEligibility(),
          documentation: collectDocumentation(),
        }
      : null,
    classic: {
      unlimitedAmount: Boolean(formData.get("unlimitedAmount")),
      useCurrency: useCurrency.checked,
      currency: formData.get("currency"),
      currencyMethod: formData.get("currencyMethod"),
      allowanceAmount: formData.get("allowanceAmount"),
      currencyRate: formData.get("currencyRate"),
      conversionAmount: formData.get("conversionAmount"),
      defaultNewEmployee: Boolean(formData.get("defaultNewEmployee")),
      includeTakeHomePay: Boolean(formData.get("includeTakeHomePay")),
      taxable: Boolean(formData.get("taxable")),
      prorateFirstYear: Boolean(formData.get("prorateFirstYear")),
      noExpiryDate: noExpiryDate.checked,
      maxRequestEnabled: maxRequestEnabled.checked,
      maxRequestPerEmerge: formData.get("maxRequestPerEmerge"),
      emerge: formData.get("emerge"),
      limitType: formData.get("limitType"),
      limitAmount: formData.get("limitAmount"),
      firstYearFlag: Boolean(formData.get("firstYearFlag")),
      benefits: collectBenefits(),
    },
    expiry: noExpiryDate.checked
      ? null
      : {
          mode: formData.get("expiry"),
          day: formData.get("expiryDay"),
          month: formData.get("expiryMonth"),
        },
  };
}

function exportPolicyData() {
  const data = collectPolicyData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "reimbursement-policy-settings.json";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Exported reimbursement policy JSON");
}

function addTagFromInput(input) {
  const value = input.value.replace(/,$/, "").trim();
  if (!value) return false;

  const editor = input.closest(".tag-editor");
  const alreadyExists = Array.from(editor.querySelectorAll("[data-tag-chips] span")).some(
    (chip) => chip.childNodes[0].textContent.trim().toLowerCase() === value.toLowerCase(),
  );

  if (alreadyExists) {
    showToast(`${value} already exists`);
    input.value = "";
    return false;
  }

  editor.querySelector("[data-tag-chips]").append(createChip(value));
  input.value = "";
  return true;
}

aiEnabled.addEventListener("change", () => {
  syncAiState();
  showToast(aiEnabled.checked ? "AI policy verification enabled" : "AI policy verification disabled");
});

closeBanner.addEventListener("click", () => {
  infoBanner.hidden = true;
});

addCriteria.addEventListener("click", addCriteriaRow);

criteriaList.addEventListener("click", (event) => {
  const valuePicker = event.target.closest("[data-value-picker]");
  if (valuePicker) {
    openCriteriaPopover(valuePicker);
    return;
  }

  const chipButton = event.target.closest(".chips button");
  if (chipButton) {
    chipButton.closest("span").remove();
    showToast("Removed condition value");
    return;
  }

  const removeButton = event.target.closest("[data-remove-criteria]");
  if (removeButton) {
    removeCriteria(removeButton.closest("[data-criteria]"));
  }
});

criteriaList.addEventListener("change", (event) => {
  const row = event.target.closest("[data-criteria]");
  if (row && event.target === row.querySelector("select")) {
    row.querySelector(".chips").innerHTML = "";
    closeCriteriaPopover();
    showToast("Criteria values reset for the selected type");
  }
});

criteriaPopoverSearch.addEventListener("input", renderCriteriaPopover);

criteriaPopoverSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const firstOption = criteriaPopoverList.querySelector(".popover-option");
    if (firstOption && activeValuePicker) {
      addChipToRow(activeValuePicker.closest("[data-criteria]"), firstOption.dataset.value);
      closeCriteriaPopover();
    }
  }

  if (event.key === "Escape") {
    closeCriteriaPopover();
  }
});

criteriaPopoverList.addEventListener("click", (event) => {
  const option = event.target.closest(".popover-option");
  if (!option || !activeValuePicker) return;
  addChipToRow(activeValuePicker.closest("[data-criteria]"), option.dataset.value);
  closeCriteriaPopover();
});

relationshipPopoverSearch.addEventListener("input", renderRelationshipPopover);

relationshipPopoverSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const firstOption = relationshipPopoverList.querySelector(".popover-option:not(.is-disabled)");
    if (firstOption && activeRelationshipPicker) {
      addRelationshipChip(activeRelationshipPicker.closest(".relationship-list"), firstOption.dataset.value);
      closeRelationshipPopover();
    }
  }

  if (event.key === "Escape") {
    closeRelationshipPopover();
  }
});

relationshipPopoverList.addEventListener("click", (event) => {
  const option = event.target.closest(".popover-option");
  if (!option || option.disabled || !activeRelationshipPicker) return;
  addRelationshipChip(activeRelationshipPicker.closest(".relationship-list"), option.dataset.value);
  closeRelationshipPopover();
});

document.addEventListener("click", (event) => {
  if (
    criteriaPopover.hidden ||
    event.target.closest("#criteriaPopover") ||
    event.target.closest("[data-value-picker]")
  ) {
    return;
  }
  closeCriteriaPopover();
});

document.addEventListener("click", (event) => {
  if (
    relationshipPopover.hidden ||
    event.target.closest("#relationshipPopover") ||
    event.target.closest("[data-relationship-picker]")
  ) {
    return;
  }
  closeRelationshipPopover();
});

window.addEventListener("resize", () => {
  if (activeValuePicker && !criteriaPopover.hidden) {
    positionCriteriaPopover(activeValuePicker);
  }

  if (activeRelationshipPicker && !relationshipPopover.hidden) {
    positionRelationshipPopover(activeRelationshipPicker);
  }
});

window.addEventListener("scroll", () => {
  if (activeValuePicker && !criteriaPopover.hidden) {
    positionCriteriaPopover(activeValuePicker);
  }

  if (activeRelationshipPicker && !relationshipPopover.hidden) {
    positionRelationshipPopover(activeRelationshipPicker);
  }
});

tipsToggle.addEventListener("click", () => {
  const expanded = tipsToggle.dataset.expanded === "true";
  tipsToggle.dataset.expanded = String(!expanded);
  tipsText.textContent = expanded
    ? "Describe the reimbursement policy in simple and specific sentences so the AI can evaluate claims correctly."
    : extendedTips;
  tipsToggle.textContent = expanded ? "Show more" : "Show less";
});

policyBuilderConfig.querySelectorAll("[data-config-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const bodyId = button.dataset.configToggle;
    const open = button.getAttribute("aria-expanded") !== "true";
    setConfigPanelOpen(bodyId, open);
  });
});

addEligibilityRule.addEventListener("click", () => {
  addEligibilityRuleRow();
  showToast("Added eligibility rule");
});

addReceiptExtraction.addEventListener("click", () => {
  addExtractionRow(receiptExtractionList, {}, { withWhen: true });
  showToast("Added receipt extraction field");
});

addSupportingDocument.addEventListener("click", () => {
  addSupportingDocumentRow({
    type: "New supporting document",
    description: "",
    requirement: "always",
    extractions: [],
  });
  showToast("Added supporting document");
});

policyBuilderConfig.addEventListener("click", (event) => {
  const relationshipPicker = event.target.closest("[data-relationship-picker]");
  if (relationshipPicker) {
    openRelationshipPopover(relationshipPicker);
    return;
  }

  const chipButton = event.target.closest(".tag-editor .chips button");
  if (chipButton) {
    chipButton.closest("span").remove();
    showToast("Removed condition value");
    return;
  }

  if (event.target.closest("[data-remove-eligibility-rule]")) {
    event.target.closest("[data-eligibility-rule]").remove();
    showToast("Removed eligibility rule");
    return;
  }

  const removeRelationshipButton = event.target.closest("[data-remove-relationship]");
  if (removeRelationshipButton) {
    removeRelationshipButton.closest("[data-relationship-chip]").remove();
    showToast("Removed relationship");
    return;
  }

  if (event.target.closest("[data-remove-extraction]")) {
    event.target.closest("[data-extraction-row]").remove();
    showToast("Removed extraction field");
    return;
  }

  const addConditionButton = event.target.closest("[data-add-document-condition]");
  if (addConditionButton) {
    const list = addConditionButton.closest("[data-supporting-document]").querySelector("[data-document-condition-list]");
    addDocumentConditionRow(list);
    showToast("Added document condition");
    return;
  }

  if (event.target.closest("[data-remove-document-condition]")) {
    event.target.closest("[data-document-condition]").remove();
    showToast("Removed document condition");
    return;
  }

  const addExtractionButton = event.target.closest("[data-add-document-extraction]");
  if (addExtractionButton) {
    const list = addExtractionButton.closest("[data-supporting-document]").querySelector("[data-document-extraction-list]");
    addExtractionRow(list);
    showToast("Added document extraction field");
    return;
  }

  if (event.target.closest("[data-remove-supporting-document]")) {
    event.target.closest("[data-supporting-document]").remove();
    showToast("Removed supporting document");
  }
});

policyBuilderConfig.addEventListener("change", (event) => {
  if (event.target.matches("[data-condition-field]")) {
    renderConditionControls(event.target.closest("[data-eligibility-rule], [data-document-condition]"), {
      field: event.target.value,
    });
    return;
  }

  if (event.target.matches("[data-toggle-extraction-when]")) {
    const panel = event.target.closest("[data-extraction-row]").querySelector(".extraction-when-panel");
    panel.classList.toggle("is-open", event.target.checked);
    return;
  }

  if (
    event.target.closest("[data-supporting-document]") &&
    event.target.matches('.requirement-toggle input[type="radio"]')
  ) {
    syncSupportingDocumentRequirement(event.target.closest("[data-supporting-document]"));
  }
});

policyBuilderConfig.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-tag-input]")) return;

  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    if (addTagFromInput(event.target)) {
      showToast("Added condition value");
    }
  }
});

policyBuilderConfig.addEventListener("focusout", (event) => {
  if (event.target.matches("[data-tag-input]")) {
    addTagFromInput(event.target);
  }
});

runAiAutomatically.addEventListener("change", syncScheduleState);
useCurrency.addEventListener("change", () => {
  syncCurrencyState();
  syncCurrencyMethod();
});

currencySelect.addEventListener("change", syncAmountPrefixes);

policyForm.querySelectorAll('input[name="currencyMethod"]').forEach((radio) => {
  radio.addEventListener("change", syncCurrencyMethod);
});

policyForm.querySelectorAll('input[name="limitType"]').forEach((radio) => {
  radio.addEventListener("change", syncLimitState);
});

noExpiryDate.addEventListener("change", syncExpiryState);
expiryCard.querySelectorAll('input[name="expiry"]').forEach((radio) => {
  radio.addEventListener("change", syncExpiryState);
});
maxRequestEnabled.addEventListener("change", syncMaxRequestState);

addBenefit.addEventListener("click", addBenefitRow);

benefitBody.addEventListener("click", (event) => {
  if (event.target.closest("[data-delete-benefit]")) {
    if (benefitBody.querySelectorAll("tr").length === 1) {
      showToast("At least one benefit is required");
      return;
    }
    event.target.closest("tr").remove();
    renumberBenefits();
    showToast("Removed benefit row");
    return;
  }

  if (event.target.closest("[data-formula]")) {
    openModal({
      eyebrow: "Formula builder",
      title: "Benefit formula",
      copy: "This prototype keeps the formula editable through the table action. Connect this button to the legacy formula builder in production.",
      details: [
        { term: "Current formula", description: "No custom formula configured" },
        { term: "Fallback", description: "Use the benefit max request amount" },
      ],
    });
  }
});

simulateButton.addEventListener("click", () => {
  if (!aiEnabled.checked) {
    showToast("Enable AI policy verification before simulating");
    return;
  }

  const data = collectPolicyData();
  const documentation = data.ai.documentation;
  const receiptExtractionCount = documentation?.receipt?.required_extractions?.length || 0;
  const supportingDocumentCount = documentation?.supporting_documents?.length || 0;

  openModal({
    eyebrow: "AI verification simulation",
    title: "Manual review recommended",
    copy:
      "The receipt is from a supported medical provider, but it includes mixed medical and non-medical items. The prototype routes this claim for manual review.",
    details: [
      { term: "Matched rules", description: "Merchant type, receipt type, receipt date" },
      { term: "Potential issue", description: "Item list contains restricted cosmetic categories" },
      {
        term: "Allowed family relationships",
        description: data.ai.eligibility?.allowed_family_relationships?.join(", ") || "Not configured",
      },
      {
        term: "Required documents",
        description: `${supportingDocumentCount} supporting document(s), ${receiptExtractionCount} receipt extraction(s)`,
      },
      { term: "Decision", description: policyForm.elements.aiDecision.value },
    ],
  });
});

exportButton.addEventListener("click", exportPolicyData);

resetButton.addEventListener("click", () => {
  policyForm.reset();
  infoBanner.hidden = false;
  closeCriteriaPopover();
  closeRelationshipPopover();
  syncAiState();
  syncScheduleState();
  syncCurrencyState();
  syncCurrencyMethod();
  syncExpiryState();
  syncMaxRequestState();
  syncLimitState();
  showToast("Form restored to its initial prototype values");
});

closeModal.addEventListener("click", closeOpenModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeOpenModal();
  }
});

policyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = collectPolicyData();
  const documentCount = data.ai?.documentation?.supporting_documents?.length || 0;
  openModal({
    eyebrow: "Policy saved",
    title: "Reimbursement policy ready",
    copy: `${data.reimbursementName} has ${data.classic.benefits.length} benefit row(s)${
      data.aiEnabled ? " and AI verification enabled." : " with AI verification disabled."
    }`,
    details: [
      { term: "Effective date", description: data.effectiveDate },
      { term: "Currency", description: data.classic.useCurrency ? data.classic.currency : "Not used" },
      { term: "Expiry", description: data.expiry ? `${data.expiry.day} ${data.expiry.month}` : "No expiry date" },
      {
        term: "AI policy builder",
        description: data.aiEnabled
          ? `${data.ai?.eligibility?.conditional_restrictions?.length || 0} eligibility rule(s), ${documentCount} supporting document(s)`
          : "Disabled",
      },
    ],
  });
  showToast("Policy settings saved");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !criteriaPopover.hidden) {
    closeCriteriaPopover();
  }

  if (event.key === "Escape" && !relationshipPopover.hidden) {
    closeRelationshipPopover();
  }

  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeOpenModal();
  }
});

resetPolicyBuilderConfig();
ensureCriteriaRemoveButtons();
syncAiState();
syncScheduleState();
syncCurrencyState();
syncCurrencyMethod();
syncAmountPrefixes();
syncExpiryState();
syncMaxRequestState();
syncLimitState();
