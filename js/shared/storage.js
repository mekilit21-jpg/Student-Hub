// Generate a unique text ID for each stored item.
export function generateId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

// Retrieve all items for a key. Always returns an array.
export function getAll(key) {
  try {
    const storedData = localStorage.getItem(key);

    if (storedData === null) {
      return [];
    }

    const data = JSON.parse(storedData);

    if (!Array.isArray(data)) {
      return [];
    }

    // Reject malformed lists containing non-object records.
    const validItems = data.every(item =>
      item !== null &&
      typeof item === "object" &&
      !Array.isArray(item)
    );

    return validItems ? data : [];

  } catch (error) {
    return [];
  }
}

// Save the complete list under a storage key.
function saveAll(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;

  } catch (error) {
    return false;
  }
}

// Add a new item and automatically assign its ID.
export function add(key, item) {
  if (
    item === null ||
    typeof item !== "object" ||
    Array.isArray(item)
  ) {
    return null;
  }

  const items = getAll(key);

  const newItem = {
    ...item,
    id: generateId()
  };

  items.push(newItem);

  return saveAll(key, items) ? newItem : null;
}

// Update an existing item while preserving its original ID.
export function update(key, id, changes) {
  if (
    changes === null ||
    typeof changes !== "object" ||
    Array.isArray(changes)
  ) {
    return null;
  }

  const items = getAll(key);

  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...changes,
    id
  };

  return saveAll(key, items) ? items[index] : null;
}

// Remove an item using its ID.
export function remove(key, id) {
  const items = getAll(key);

  const remainingItems = items.filter(item => item.id !== id);

  if (remainingItems.length === items.length) {
    return false;
  }

  return saveAll(key, remainingItems);
}