import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // =====================================================
  // AUTHENTICATION
  // =====================================================

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

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  // =====================================================
  // CATEGORIES & BRANDS
  // =====================================================

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // =====================================================
  // PRODUCT FORM
  // =====================================================

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

  // =====================================================
  // DAY 12 - SEARCH
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOGIN
  // =====================================================

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

      setLoginError(
        error.message || "Unable to login"
      );
    } finally {
      setLoginLoading(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("inventory_token");
    localStorage.removeItem("inventory_user");

    setToken("");
    setUser(null);
    setProducts([]);
    setCategories([]);
    setBrands([]);
    setSearchTerm("");
  }

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Unable to load products");
      }

      setProducts(result.data || []);
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      setProductError(
        "Unable to load products. Please check the backend and login token."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  async function fetchCategories() {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`
      );

      if (!response.ok) {
        throw new Error(
          `Category request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setCategories(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setCategories(result.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(
        "Category loading error:",
        error
      );

      setCategories([]);
    }
  }

  // =====================================================
  // FETCH BRANDS
  // =====================================================

  async function fetchBrands() {
    try {
      const response = await fetch(
        `${API_URL}/api/brands`
      );

      if (!response.ok) {
        throw new Error(
          `Brand request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setBrands(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setBrands(result.data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error(
        "Brand loading error:",
        error
      );

      setBrands([]);
    }
  }

  // =====================================================
  // LOAD DATA AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }
  }, [token]);

  // =====================================================
  // PRODUCT FORM CHANGE
  // =====================================================

  function handleProductFormChange(event) {
    const { name, value } = event.target;

    setProductForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  // =====================================================
  // RESET PRODUCT FORM
  // =====================================================

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
  }

  // =====================================================
  // OPEN PRODUCT FORM
  // =====================================================

  function handleOpenProductForm() {
    resetProductForm();
    setProductFormSuccess("");
    setShowProductForm(true);
  }

  // =====================================================
  // CLOSE PRODUCT FORM
  // =====================================================

  function handleCloseProductForm() {
    setShowProductForm(false);
    resetProductForm();
  }

  // =====================================================
  // CREATE PRODUCT
  // =====================================================

  async function handleCreateProduct(event) {
    event.preventDefault();

    setSavingProduct(true);
    setProductFormError("");
    setProductFormSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: productForm.name,
            partNumber:
              productForm.partNumber || null,
            description:
              productForm.description || null,
            vehicleModel:
              productForm.vehicleModel || null,
            mrp: Number(productForm.mrp),
            sellingPrice:
              Number(productForm.sellingPrice),
            minimumStock:
              Number(productForm.minimumStock || 0),
            categoryId:
              Number(productForm.categoryId),
            brandId:
              Number(productForm.brandId),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to create product"
        );
      }

      resetProductForm();

      setShowProductForm(false);

      setProductFormSuccess(
        "Product created successfully."
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      setProductFormError(
        error.message ||
          "Unable to create product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  // =====================================================
  // CALCULATE TOTAL STOCK
  // =====================================================

  function getTotalStock(product) {
    if (
      !product.inventories ||
      product.inventories.length === 0
    ) {
      return 0;
    }

    return product.inventories.reduce(
      (total, inventory) =>
        total +
        Number(inventory.quantity || 0),
      0
    );
  }

  // =====================================================
  // GET LOCATION INFORMATION
  // =====================================================

  function getLocationText(product) {
    if (
      !product.inventories ||
      product.inventories.length === 0
    ) {
      return ["No location assigned"];
    }

    return product.inventories.map(
      (inventory) => {
        const location =
          inventory.location;

        if (!location) {
          return `Location ID: ${
            inventory.locationId
          }`;
        }

        return (
          `${location.name} | ` +
          `Rack: ${location.rack || "N/A"} | ` +
          `Shelf: ${
            location.shelf || "N/A"
          } | ` +
          `Section: ${
            location.section || "N/A"
          } | ` +
          `Qty: ${inventory.quantity}`
        );
      }
    );
  }

  // =====================================================
  // DAY 12 - PRODUCT SEARCH
  // =====================================================

  function getFilteredProducts() {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      const productName =
        product.name || "";

      const partNumber =
        product.partNumber || "";

      const description =
        product.description || "";

      const vehicleModel =
        product.vehicleModel || "";

      const brandName =
        product.brand?.name || "";

      const categoryName =
        product.category?.name || "";

      const locationText =
        (product.inventories || [])
          .map((inventory) => {
            const location =
              inventory.location;

            if (!location) {
              return `location id ${
                inventory.locationId || ""
              }`;
            }

            return [
              location.name,
              location.rack,
              location.shelf,
              location.section,
            ]
              .filter(Boolean)
              .join(" ");
          })
          .join(" ");

      const searchableText = `
        ${productName}
        ${partNumber}
        ${description}
        ${vehicleModel}
        ${brandName}
        ${categoryName}
        ${locationText}
      `.toLowerCase();

      return searchableText.includes(
        search
      );
    });
  }

  const filteredProducts =
    getFilteredProducts();

  // =====================================================
  // DAY 13 - DASHBOARD CALCULATIONS
  // =====================================================

  // Total number of products
  const totalProducts =
    products.length;

  // Total stock across all products
  const totalStock = products.reduce(
    (total, product) => {
      return (
        total +
        getTotalStock(product)
      );
    },
    0
  );

  // Products whose stock is at or below
  // minimum stock
  const lowStockProducts =
    products.filter((product) => {
      const stock =
        getTotalStock(product);

      const minimumStock =
        Number(
          product.minimumStock || 0
        );

      return stock <= minimumStock;
    });

  // Total inventory value
  // Stock × Selling Price
  const totalInventoryValue =
    products.reduce(
      (total, product) => {
        const stock =
          getTotalStock(product);

        const sellingPrice =
          Number(
            product.sellingPrice || 0
          );

        return (
          total +
          stock * sellingPrice
        );
      },
      0
    );

  // =====================================================
  // LOCATION SUMMARY
  // =====================================================

  const locationMap = {};

  products.forEach((product) => {
    (product.inventories || []).forEach(
      (inventory) => {
        const locationName =
          inventory.location?.name ||
          `Location ${inventory.locationId}`;

        if (
          !locationMap[locationName]
        ) {
          locationMap[locationName] = 0;
        }

        locationMap[locationName] +=
          Number(
            inventory.quantity || 0
          );
      }
    );
  });

  const locationSummary =
    Object.entries(locationMap);

  const totalLocations =
    locationSummary.length;

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">

          <h1>Sri Vengamamba</h1>

          <h2>
            Oils & Automobiles
          </h2>

          <p className="login-subtitle">
            Inventory Management System
          </p>

          <form
            onSubmit={handleLogin}
          >

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
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
              {loginLoading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="app-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="app-header">

        <div>
          <h1>
            Sri Vengamamba Oils & Automobiles
          </h1>

          <p>
            Inventory Management System
          </p>

          {user && (
            <p className="welcome-text">
              Welcome,{" "}
              {user.name ||
                user.email}
            </p>
          )}
        </div>

        <div className="header-actions">

          <button
            className="add-product-button"
            onClick={
              handleOpenProductForm
            }
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

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {productFormSuccess && (
          <div className="success-card">
            {productFormSuccess}
          </div>
        )}

        {/* =================================================
            DAY 13 - DASHBOARD STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          {/* TOTAL PRODUCTS */}

          <div className="stat-card">

            <div className="stat-card-content">

              <p>
                Total Products
              </p>

              <h3>
                {totalProducts}
              </h3>

              <span>
                Products in inventory
              </span>

            </div>

          </div>

          {/* TOTAL STOCK */}

          <div className="stat-card">

            <div className="stat-card-content">

              <p>
                Total Stock
              </p>

              <h3>
                {totalStock}
              </h3>

              <span>
                Units available
              </span>

            </div>

          </div>

          {/* LOW STOCK */}

          <div className="stat-card low-stock-card">

            <div className="stat-card-content">

              <p>
                Low Stock
              </p>

              <h3>
                {lowStockProducts.length}
              </h3>

              <span>
                Products need attention
              </span>

            </div>

          </div>

          {/* INVENTORY VALUE */}

          <div className="stat-card">

            <div className="stat-card-content">

              <p>
                Inventory Value
              </p>

              <h3>
                ₹
                {totalInventoryValue.toFixed(
                  2
                )}
              </h3>

              <span>
                Based on selling price
              </span>

            </div>

          </div>

          {/* LOCATIONS */}

          <div className="stat-card">

            <div className="stat-card-content">

              <p>
                Locations
              </p>

              <h3>
                {totalLocations}
              </h3>

              <span>
                Active stock locations
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            DAY 13 - STOCK BY LOCATION
        ================================================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <h2>
                Stock by Location
              </h2>

              <p>
                Current inventory quantity
                at each location.
              </p>

            </div>

          </div>

          {locationSummary.length ===
          0 ? (
            <div className="empty-dashboard">

              <p>
                No inventory locations
                found.
              </p>

            </div>
          ) : (
            <div className="location-summary-grid">

              {locationSummary.map(
                (
                  [
                    locationName,
                    quantity,
                  ]
                ) => (
                  <div
                    className="location-summary-card"
                    key={locationName}
                  >

                    <div>

                      <h3>
                        {locationName}
                      </h3>

                      <p>
                        Available stock
                      </p>

                    </div>

                    <strong>
                      {quantity}
                    </strong>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            DAY 13 - LOW STOCK PRODUCTS
        ================================================= */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <h2>
                Low Stock Products
              </h2>

              <p>
                Products that have reached
                or fallen below their minimum
                stock level.
              </p>

            </div>

          </div>

          {lowStockProducts.length ===
          0 ? (
            <div className="empty-dashboard">

              <p>
                No low stock products
                currently.
              </p>

            </div>
          ) : (
            <div className="low-stock-list">

              {lowStockProducts.map(
                (product) => {

                  const stock =
                    getTotalStock(
                      product
                    );

                  const minimumStock =
                    Number(
                      product.minimumStock ||
                        0
                    );

                  return (
                    <div
                      className="low-stock-item"
                      key={product.id}
                    >

                      <div className="low-stock-product">

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          Part Number:{" "}
                          {product.partNumber ||
                            "N/A"}
                        </p>

                        <p>
                          Brand:{" "}
                          {product.brand
                            ?.name ||
                            "N/A"}
                        </p>

                        <p>
                          Category:{" "}
                          {product.category
                            ?.name ||
                            "N/A"}
                        </p>

                      </div>

                      <div className="low-stock-values">

                        <div>

                          <span>
                            Current Stock
                          </span>

                          <strong className="stock-low">
                            {stock}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Minimum Stock
                          </span>

                          <strong>
                            {minimumStock}
                          </strong>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            DAY 12 - SEARCH PRODUCTS
        ================================================= */}

        <section className="search-card">

          <div className="search-heading">

            <h2>
              Search Products
            </h2>

            <p>
              Search by product name,
              part number, description,
              vehicle model, brand,
              category, or location.
            </p>

          </div>

          <div className="search-row">

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear Search
              </button>
            )}

          </div>

          <div className="search-result-info">

            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {products.length}
            </strong>{" "}
            products

          </div>

        </section>

        {/* =================================================
            ADD PRODUCT FORM
        ================================================= */}

        {showProductForm && (
          <section className="product-form-card">

            <div className="form-header">

              <div>

                <h2>
                  Add New Product
                </h2>

                <p>
                  Enter the product
                  information below.
                </p>

              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={
                  handleCloseProductForm
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateProduct
              }
            >

              <div className="form-grid">

                {/* PRODUCT NAME */}

                <div className="form-group">

                  <label>
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      productForm.name
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: Servo 4T Engine Oil"
                    required
                  />

                </div>

                {/* PART NUMBER */}

                <div className="form-group">

                  <label>
                    Part Number
                  </label>

                  <input
                    type="text"
                    name="partNumber"
                    value={
                      productForm.partNumber
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: SERVO-4T-001"
                  />

                </div>

                {/* VEHICLE MODEL */}

                <div className="form-group">

                  <label>
                    Vehicle Model
                  </label>

                  <input
                    type="text"
                    name="vehicleModel"
                    value={
                      productForm.vehicleModel
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: Honda Activa"
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="categoryId"
                    value={
                      productForm.categoryId
                    }
                    onChange={
                      handleProductFormChange
                    }
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* BRAND */}

                <div className="form-group">

                  <label>
                    Brand *
                  </label>

                  <select
                    name="brandId"
                    value={
                      productForm.brandId
                    }
                    onChange={
                      handleProductFormChange
                    }
                    required
                  >

                    <option value="">
                      Select brand
                    </option>

                    {brands.map(
                      (brand) => (
                        <option
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* MRP */}

                <div className="form-group">

                  <label>
                    MRP *
                  </label>

                  <input
                    type="number"
                    name="mrp"
                    value={
                      productForm.mrp
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: 550"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                {/* SELLING PRICE */}

                <div className="form-group">

                  <label>
                    Selling Price *
                  </label>

                  <input
                    type="number"
                    name="sellingPrice"
                    value={
                      productForm.sellingPrice
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: 500"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                {/* MINIMUM STOCK */}

                <div className="form-group">

                  <label>
                    Minimum Stock
                  </label>

                  <input
                    type="number"
                    name="minimumStock"
                    value={
                      productForm.minimumStock
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Example: 10"
                    min="0"
                    required
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="form-group full-width">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      productForm.description
                    }
                    onChange={
                      handleProductFormChange
                    }
                    placeholder="Enter product description"
                    rows="4"
                  />

                </div>

              </div>

              {/* FORM ERROR */}

              {productFormError && (
                <div className="error-message">
                  {productFormError}
                </div>
              )}

              {/* FORM BUTTONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    handleCloseProductForm
                  }
                  disabled={savingProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? "Saving..."
                    : "Save Product"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            PRODUCT SUMMARY
        ================================================= */}

        <section className="summary-card">

          <h2>
            Product Inventory
          </h2>

          <p>
            Total products matching
            search:{" "}
            <strong>
              {filteredProducts.length}
            </strong>
          </p>

        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingProducts && (
          <div className="message-card">

            <p>
              Loading products...
            </p>

          </div>
        )}

        {/* =================================================
            PRODUCT ERROR
        ================================================= */}

        {!loadingProducts &&
          productError && (
            <div className="error-card">

              <h3>
                Connection Error
              </h3>

              <p>
                {productError}
              </p>

              <p>
                Make sure the backend is
                running and your login token
                is valid.
              </p>

            </div>
          )}

        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {!loadingProducts &&
          !productError &&
          products.length === 0 && (
            <div className="message-card">

              <p>
                No products found in the
                database.
              </p>

              <p>
                Click "Add Product" to create
                your first product.
              </p>

            </div>
          )}

        {/* =================================================
            NO SEARCH RESULTS
        ================================================= */}

        {!loadingProducts &&
          !productError &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="message-card">

              <p>
                No products found matching{" "}
                <strong>
                  "{searchTerm}"
                </strong>
                .
              </p>

              <button
                type="button"
                className="clear-search-button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Show All Products
              </button>

            </div>
          )}

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        {!loadingProducts &&
          !productError &&
          filteredProducts.length > 0 && (
            <section className="table-card">

              <div className="table-heading">

                <h2>
                  All Products
                </h2>

                <span>
                  {filteredProducts.length}{" "}
                  record
                  {filteredProducts.length !==
                  1
                    ? "s"
                    : ""}
                </span>

              </div>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Product Name
                      </th>

                      <th>
                        Part Number
                      </th>

                      <th>
                        Description
                      </th>

                      <th>
                        Vehicle Model
                      </th>

                      <th>
                        Brand
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        MRP
                      </th>

                      <th>
                        Selling Price
                      </th>

                      <th>
                        Total Stock
                      </th>

                      <th>
                        Minimum Stock
                      </th>

                      <th>
                        Locations
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      (product) => {

                        const totalStock =
                          getTotalStock(
                            product
                          );

                        const minimumStock =
                          Number(
                            product.minimumStock ||
                              0
                          );

                        const isLowStock =
                          totalStock <=
                          minimumStock;

                        const locations =
                          getLocationText(
                            product
                          );

                        return (
                          <tr
                            key={
                              product.id
                            }
                          >

                            {/* ID */}

                            <td>
                              {product.id}
                            </td>

                            {/* PRODUCT NAME */}

                            <td>
                              <strong>
                                {product.name ||
                                  "N/A"}
                              </strong>
                            </td>

                            {/* PART NUMBER */}

                            <td>
                              {product.partNumber ||
                                "N/A"}
                            </td>

                            {/* DESCRIPTION */}

                            <td>
                              {product.description ||
                                "N/A"}
                            </td>

                            {/* VEHICLE MODEL */}

                            <td>
                              {product.vehicleModel ||
                                "N/A"}
                            </td>

                            {/* BRAND */}

                            <td>
                              {product.brand
                                ?.name ||
                                "N/A"}
                            </td>

                            {/* CATEGORY */}

                            <td>
                              {product.category
                                ?.name ||
                                "N/A"}
                            </td>

                            {/* MRP */}

                            <td>
                              ₹
                              {Number(
                                product.mrp ||
                                  0
                              ).toFixed(2)}
                            </td>

                            {/* SELLING PRICE */}

                            <td>
                              ₹
                              {Number(
                                product.sellingPrice ||
                                  0
                              ).toFixed(2)}
                            </td>

                            {/* TOTAL STOCK */}

                            <td>

                              <span
                                className={
                                  isLowStock
                                    ? "stock-low"
                                    : "stock-normal"
                                }
                              >
                                {totalStock}
                              </span>

                            </td>

                            {/* MINIMUM STOCK */}

                            <td>
                              {minimumStock}
                            </td>

                            {/* LOCATIONS */}

                            <td>

                              <div className="location-list">

                                {locations.map(
                                  (
                                    location,
                                    index
                                  ) => (
                                    <div
                                      className="location-item"
                                      key={
                                        index
                                      }
                                    >
                                      {
                                        location
                                      }
                                    </div>
                                  )
                                )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

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