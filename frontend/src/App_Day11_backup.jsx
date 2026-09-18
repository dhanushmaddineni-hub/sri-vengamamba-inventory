import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("inventory_token") || ""
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("inventory_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [showProductForm, setShowProductForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState("");
  const [productFormSuccess, setProductFormSuccess] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    partNumber: "",
    description: "",
    vehicleModel: "",
    mrp: "",
    sellingPrice: "",
    minimumStock: "",
    categoryId: "",
    brandId: "",
  });

  async function handleLogin(event) {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      const receivedToken = result.data.token;
      const receivedUser = result.data.user;

      localStorage.setItem("inventory_token", receivedToken);
      localStorage.setItem(
        "inventory_user",
        JSON.stringify(receivedUser)
      );

      setToken(receivedToken);
      setUser(receivedUser);

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "Unable to login");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("inventory_token");
    localStorage.removeItem("inventory_user");

    setToken("");
    setUser(null);
    setProducts([]);
  }

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to load products");
      }

      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Product loading error:", error);

      setProductError(
        "Unable to load products. Please check the backend and login token."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error(
          `Categories API returned status ${response.status}`
        );
      }

      const result = await response.json();

      console.log("Categories API response:", result);

      if (Array.isArray(result)) {
        setCategories(result);
      } else if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        setCategories([]);
        console.error("Unexpected categories response:", result);
      }
    } catch (error) {
      console.error("Category loading error:", error);
      setCategories([]);
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch(`${API_URL}/api/brands`);

      if (!response.ok) {
        throw new Error(`Brands API returned status ${response.status}`);
      }

      const result = await response.json();

      console.log("Brands API response:", result);

      if (Array.isArray(result)) {
        setBrands(result);
      } else if (result.success && Array.isArray(result.data)) {
        setBrands(result.data);
      } else {
        setBrands([]);
        console.error("Unexpected brands response:", result);
      }
    } catch (error) {
      console.error("Brand loading error:", error);
      setBrands([]);
    }
  }

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }
  }, [token]);

  function handleProductFormChange(event) {
    const { name, value } = event.target;

    setProductForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function resetProductForm() {
    setProductForm({
      name: "",
      partNumber: "",
      description: "",
      vehicleModel: "",
      mrp: "",
      sellingPrice: "",
      minimumStock: "",
      categoryId: "",
      brandId: "",
    });

    setProductFormError("");
    setProductFormSuccess("");
  }

  function handleOpenProductForm() {
    resetProductForm();
    setShowProductForm(true);
  }

  function handleCloseProductForm() {
    resetProductForm();
    setShowProductForm(false);
  }

  async function handleCreateProduct(event) {
    event.preventDefault();

    setSavingProduct(true);
    setProductFormError("");
    setProductFormSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productForm.name.trim(),
          partNumber: productForm.partNumber.trim() || null,
          description: productForm.description.trim() || null,
          vehicleModel: productForm.vehicleModel.trim() || null,
          mrp: Number(productForm.mrp),
          sellingPrice: Number(productForm.sellingPrice),
          minimumStock: Number(productForm.minimumStock || 0),
          categoryId: Number(productForm.categoryId),
          brandId: Number(productForm.brandId),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create product");
      }

      setProductFormSuccess("Product created successfully.");
      setShowProductForm(false);
      resetProductForm();

      await fetchProducts();
    } catch (error) {
      console.error("Create product error:", error);

      setProductFormError(
        error.message || "Unable to create product"
      );
    } finally {
      setSavingProduct(false);
    }
  }

  function getTotalStock(product) {
    if (!product.inventories || product.inventories.length === 0) {
      return 0;
    }

    return product.inventories.reduce(
      (total, inventory) => total + Number(inventory.quantity || 0),
      0
    );
  }

  function getLocationText(product) {
    if (!product.inventories || product.inventories.length === 0) {
      return ["No location assigned"];
    }

    return product.inventories.map((inventory) => {
      const location = inventory.location;

      if (!location) {
        return `Location ID: ${inventory.locationId}`;
      }

      return `${location.name} | Rack: ${
        location.rack || "N/A"
      } | Shelf: ${location.shelf || "N/A"} | Section: ${
        location.section || "N/A"
      } | Qty: ${inventory.quantity}`;
    });
  }

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Sri Vengamamba</h1>
          <h2>Oils & Automobiles</h2>

          <p className="login-subtitle">
            Inventory Management System
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Sri Vengamamba Oils & Automobiles</h1>
          <p>Inventory Management System</p>

          {user && (
            <p className="welcome-text">
              Welcome, {user.name || user.email}
            </p>
          )}
        </div>

        <div className="header-actions">
          <button
            className="add-product-button"
            onClick={handleOpenProductForm}
          >
            Add Product
          </button>

          <button
            className="refresh-button"
            onClick={fetchProducts}
          >
            Refresh Products
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {productFormSuccess && (
          <div className="success-card">
            {productFormSuccess}
          </div>
        )}

        {showProductForm && (
          <section className="form-card">
            <div className="form-heading">
              <div>
                <h2>Add New Product</h2>
                <p>Enter the product information below.</p>
              </div>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCloseProductForm}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Example: Servo 4T Engine Oil"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="partNumber">Part Number</label>

                  <input
                    id="partNumber"
                    name="partNumber"
                    type="text"
                    placeholder="Example: SERVO-4T-1L"
                    value={productForm.partNumber}
                    onChange={handleProductFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleModel">Vehicle Model</label>

                  <input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="Example: Bajaj Pulsar 150"
                    value={productForm.vehicleModel}
                    onChange={handleProductFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoryId">Category</label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleProductFormChange}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="brandId">Brand</label>

                  <select
                    id="brandId"
                    name="brandId"
                    value={productForm.brandId}
                    onChange={handleProductFormChange}
                    required
                  >
                    <option value="">Select brand</option>

                    {brands.map((brand) => (
                      <option
                        key={brand.id}
                        value={brand.id}
                      >
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="mrp">MRP</label>

                  <input
                    id="mrp"
                    name="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Example: 450"
                    value={productForm.mrp}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellingPrice">
                    Selling Price
                  </label>

                  <input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Example: 420"
                    value={productForm.sellingPrice}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="minimumStock">
                    Minimum Stock
                  </label>

                  <input
                    id="minimumStock"
                    name="minimumStock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Example: 10"
                    value={productForm.minimumStock}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    rows="4"
                  />
                </div>
              </div>

              {productFormError && (
                <div className="form-error">
                  {productFormError}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? "Saving Product..."
                    : "Save Product"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseProductForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="summary-card">
          <h2>Product Inventory</h2>

          <p>
            Total products: <strong>{products.length}</strong>
          </p>
        </section>

        {loadingProducts && (
          <div className="message-card">
            <p>Loading products...</p>
          </div>
        )}

        {!loadingProducts && productError && (
          <div className="error-card">
            <h3>Connection Error</h3>

            <p>{productError}</p>

            <p>
              Make sure the backend is running and your login token
              is valid.
            </p>
          </div>
        )}

        {!loadingProducts &&
          !productError &&
          products.length === 0 && (
            <div className="message-card">
              <p>No products found in the database.</p>
            </div>
          )}

        {!loadingProducts &&
          !productError &&
          products.length > 0 && (
            <section className="table-card">
              <div className="table-heading">
                <h2>All Products</h2>
                <span>{products.length} records</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Part Number</th>
                      <th>Description</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>MRP</th>
                      <th>Selling Price</th>
                      <th>Total Stock</th>
                      <th>Minimum Stock</th>
                      <th>Locations</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const totalStock = getTotalStock(product);
                      const locations = getLocationText(product);

                      return (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.partNumber || "N/A"}</td>
                          <td>{product.description || "N/A"}</td>
                          <td>{product.brand?.name || "N/A"}</td>
                          <td>{product.category?.name || "N/A"}</td>
                          <td>₹{product.mrp}</td>
                          <td>₹{product.sellingPrice}</td>

                          <td>
                            <span
                              className={
                                totalStock <= product.minimumStock
                                  ? "stock-low"
                                  : "stock-normal"
                              }
                            >
                              {totalStock}
                            </span>
                          </td>

                          <td>{product.minimumStock}</td>

                          <td>
                            <div className="location-list">
                              {locations.map((locationText, index) => (
                                <div
                                  className="location-item"
                                  key={index}
                                >
                                  {locationText}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default App; 