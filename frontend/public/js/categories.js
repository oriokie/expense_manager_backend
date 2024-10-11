async function showCategories() {
  try {
    const data = await apiRequest('/categories');
    const content = document.getElementById('content');
    content.innerHTML = `
            <div class="card">
                <h2>Categories</h2>
                <ul id="categoryList">
                    ${data.categories
                      .map(
                        (category) => `
                        <li>
                            ${category.name}: ${category.description}
                            <button onclick="deleteCategory('${category._id}')">Delete</button>
                        </li>
                    `
                      )
                      .join('')}
                </ul>
                <button onclick="showAddCategoryForm()">Add Category</button>
            </div>
        `;
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch categories. Please try again.');
  }
}

async function showAddCategoryForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="card">
            <h2>Add Category</h2>
            <form onsubmit="addCategory(event)">
                <input type="text" id="categoryName" placeholder="Name" required>
                <input type="text" id="categoryDescription" placeholder="Description" required>
                <button type="submit">Add Category</button>
            </form>
        </div>
    `;
}

async function addCategory(event) {
  event.preventDefault();
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;

  try {
    await apiRequest('/categories', 'POST', { name, description });
    alert('Category added successfully!');
    await loadCategories(); // Reload categories after adding a new one
    showCategories();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add category. Please try again.');
  }
}

async function fetchCategories() {
  try {
    const data = await apiRequest('/categories');
    const categorySelect = document.getElementById('expenseCategory');
    data.categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category._id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch categories. Please try again.');
  }
}

async function deleteCategory(categoryId) {
  if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
    try {
      await apiRequest(`/categories/${categoryId}`, 'DELETE');
      alert('Category deleted successfully.');
      showCategories(); // Refresh the category list
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete category. Please try again.');
    }
  }
}
