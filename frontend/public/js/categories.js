async function showCategories() {
  await loadCategories();
  const content = document.getElementById('content');

  if (Object.keys(categoriesMap).length === 0) {
    content.innerHTML = `
            <div class="card">
                <h2>Categories</h2>
                <p>No categories available.</p>
                <button onclick="seedCategories()">Seed Categories</button>
            </div>
        `;
  } else {
    content.innerHTML = `
            <div class="card">
                <h2>Categories</h2>
                <ul id="categoryList">
                    ${Object.entries(categoriesMap)
                      .map(
                        ([id, name]) => `
                        <li>
                            ${name}
                            <button onclick="deleteCategory('${id}')">Delete</button>
                        </li>
                    `
                      )
                      .join('')}
                </ul>
                <button onclick="showAddCategoryForm()">Add Category</button>
            </div>
        `;
  }
}

async function seedCategories() {
  try {
    await apiRequest('/categories/seed', 'POST');
    alert('Categories seeded successfully!');
    await showCategories();
  } catch (error) {
    console.error('Error seeding categories:', error);
    alert('Failed to seed categories. Please try again.');
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
    await showCategories();
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
      await showCategories();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete category. Please try again.');
    }
  }
}
