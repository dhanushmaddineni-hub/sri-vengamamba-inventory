import { useEffect, useMemo, useState } from "react";
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

  const [activePage, setActivePage] = useState("dashboard");

  // -----------------------------
  // LOGIN
  // -----------------------------

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // -----------------------------
  // PRODUCTS
  // -----------------------------

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

  const [searchTerm, setSearchTerm] = useState("");

  // -----------------------------
  // SUPPLIERS / CUSTOMERS / LOCATIONS
  // -----------------------------

  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);

  // -----------------------------
  // PURCHASE
  // -----------------------------

  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    productId: "",
    locationId: "",
    quantity: "",
    purchasePrice: "",
  });

  const [savingPurchase, setSavingPurchase] = useState(false);

  // -----------------------------
  // SALES
  // -----------------------------

  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [saleError, setSaleError] = useState("");
  const [saleSuccess, setSaleSuccess] = useState("");

  const [saleForm, setSaleForm] = useState({
    customerId: "",
    invoiceNumber: "",
    productId: "",
    locationId: "",
    quantity: "",
    sellingPrice: "",
  });

  const [savingSale, setSavingSale] = useState(false);

  // ============================================================
  // LOGIN
  // ============================================================

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
    setCategories([]);
    setBrands([]);
    setSuppliers([]);
    setCustomers([]);
    setLocations([]);
    setPurchases([]);
    setSales([]);

    setActivePage("dashboard");
  }

  // ============================================================
  // PRODUCTS
  // ============================================================

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
        throw new Error("Unable to load categories");
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
      console.error("Category loading error:", error);
      setCategories([]);
    }
  }

  async function fetchBrands() {
    try {
      const response = await fetch(`${API_URL}/api/brands`);

      if (!response.ok) {
        throw new Error("Unable to load brands");
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
      console.error("Brand loading error:", error);
      setBrands([]);
    }
  }

  async function fetchSuppliers() {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`);

      if (!response.ok) {
        throw new Error("Unable to load suppliers");
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setSuppliers(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setSuppliers(result.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Supplier loading error:", error);
      setSuppliers([]);
    }
  }

  async function fetchCustomers() {
    try {
      const response = await fetch(`${API_URL}/api/customers`);

      if (!response.ok) {
        throw new Error("Unable to load customers");
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setCustomers(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setCustomers(result.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Customer loading error:", error);
      setCustomers([]);
    }
  }

  async function fetchLocations() {
    try {
      const response = await fetch(`${API_URL}/api/locations`);

      if (!response.ok) {
        throw new Error("Unable to load locations");
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setLocations(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setLocations(result.data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Location loading error:", error);
      setLocations([]);
    }
  }

  async function fetchPurchases() {
    try {
      setLoadingPurchases(true);
      setPurchaseError("");

      const response = await fetch(`${API_URL}/api/purchases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load purchases");
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setPurchases(result.data);
      } else if (Array.isArray(result)) {
        setPurchases(result);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error("Purchase loading error:", error);

      setPurchaseError(
        "Unable to load purchase history."
      );
    } finally {
      setLoadingPurchases(false);
    }
  }

  async function fetchSales() {
    try {
      setLoadingSales(true);
      setSaleError("");

      const response = await fetch(`${API_URL}/api/sales`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load sales");
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        setSales(result);
      } else if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setSales(result.data);
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error("Sales loading error:", error);

      setSaleError(
        "Unable to load sales history."
      );
    } finally {
      setLoadingSales(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchSuppliers();
    fetchCustomers();
    fetchLocations();
    fetchPurchases();
    fetchSales();
  }, [token]);

  // ============================================================
  // PRODUCT FORM
  // ============================================================

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
  }

  function handleOpenProductForm() {
    resetProductForm();
    setProductFormSuccess("");
    setShowProductForm(true);
  }

  function handleCloseProductForm() {
    setShowProductForm(false);
    resetProductForm();
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
          name: productForm.name,
          partNumber: productForm.partNumber || null,
          description: productForm.description || null,
          vehicleModel: productForm.vehicleModel || null,
          mrp: Number(productForm.mrp),
          sellingPrice: Number(productForm.sellingPrice),
          minimumStock: Number(
            productForm.minimumStock || 0
          ),
          categoryId: Number(productForm.categoryId),
          brandId: Number(productForm.brandId),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create product"
        );
      }

      resetProductForm();

      setShowProductForm(false);

      setProductFormSuccess(
        "Product created successfully."
      );

      await fetchProducts();
    } catch (error) {
      console.error("Create product error:", error);

      setProductFormError(
        error.message || "Unable to create product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  // ============================================================
  // PURCHASE FORM
  // ============================================================

  function handlePurchaseFormChange(event) {
    const { name, value } = event.target;

    setPurchaseForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (name === "productId") {
      const selectedProduct = products.find(
        (product) => String(product.id) === String(value)
      );

      if (selectedProduct) {
        setPurchaseForm((previousForm) => ({
          ...previousForm,
          productId: value,
          purchasePrice: Number(
            selectedProduct.sellingPrice || 0
          ).toString(),
        }));
      }
    }
  }

  function resetPurchaseForm() {
    setPurchaseForm({
      supplierId: "",
      invoiceNumber: "",
      purchaseDate: new Date()
        .toISOString()
        .split("T")[0],
      productId: "",
      locationId: "",
      quantity: "",
      purchasePrice: "",
    });
  }

  const purchaseTotal = useMemo(() => {
    const quantity = Number(
      purchaseForm.quantity || 0
    );

    const price = Number(
      purchaseForm.purchasePrice || 0
    );

    return quantity * price;
  }, [
    purchaseForm.quantity,
    purchaseForm.purchasePrice,
  ]);

  async function handleCreatePurchase(event) {
    event.preventDefault();

    setSavingPurchase(true);
    setPurchaseError("");
    setPurchaseSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/purchases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            supplierId: Number(
              purchaseForm.supplierId
            ),
            invoiceNumber:
              purchaseForm.invoiceNumber || null,
            purchaseDate:
              purchaseForm.purchaseDate,
            items: [
              {
                productId: Number(
                  purchaseForm.productId
                ),
                locationId: Number(
                  purchaseForm.locationId
                ),
                quantity: Number(
                  purchaseForm.quantity
                ),
                purchasePrice: Number(
                  purchaseForm.purchasePrice
                ),
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to create purchase"
        );
      }

      setPurchaseSuccess(
        "Purchase created successfully. Inventory stock has been updated."
      );

      resetPurchaseForm();

      await fetchPurchases();
      await fetchProducts();

      setActivePage("purchases");
    } catch (error) {
      console.error(
        "Create purchase error:",
        error
      );

      setPurchaseError(
        error.message ||
          "Unable to create purchase."
      );
    } finally {
      setSavingPurchase(false);
    }
  }

  // ============================================================
  // SALE FORM
  // ============================================================

  function handleSaleFormChange(event) {
    const { name, value } = event.target;

    setSaleForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (name === "productId") {
      const selectedProduct = products.find(
        (product) =>
          String(product.id) === String(value)
      );

      if (selectedProduct) {
        setSaleForm((previousForm) => ({
          ...previousForm,
          productId: value,
          sellingPrice: Number(
            selectedProduct.sellingPrice || 0
          ).toString(),
        }));
      }
    }
  }

  function resetSaleForm() {
    setSaleForm({
      customerId: "",
      invoiceNumber: "",
      productId: "",
      locationId: "",
      quantity: "",
      sellingPrice: "",
    });
  }

  const saleTotal = useMemo(() => {
    const quantity = Number(
      saleForm.quantity || 0
    );

    const price = Number(
      saleForm.sellingPrice || 0
    );

    return quantity * price;
  }, [
    saleForm.quantity,
    saleForm.sellingPrice,
  ]);

  function getInventoryQuantity(
    productId,
    locationId
  ) {
    const product = products.find(
      (item) =>
        String(item.id) === String(productId)
    );

    if (!product) {
      return 0;
    }

    const inventory = (
      product.inventories || []
    ).find(
      (item) =>
        String(item.locationId) ===
        String(locationId)
    );

    return inventory
      ? Number(inventory.quantity || 0)
      : 0;
  }

  async function handleCreateSale(event) {
    event.preventDefault();

    setSavingSale(true);
    setSaleError("");
    setSaleSuccess("");

    try {
      const availableStock =
        getInventoryQuantity(
          saleForm.productId,
          saleForm.locationId
        );

      if (
        Number(saleForm.quantity) >
        availableStock
      ) {
        throw new Error(
          `Insufficient stock. Available stock: ${availableStock}`
        );
      }

      const response = await fetch(
        `${API_URL}/api/sales`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId:
              saleForm.customerId
                ? Number(
                    saleForm.customerId
                  )
                : null,
            invoiceNumber:
              saleForm.invoiceNumber || null,
            items: [
              {
                productId: Number(
                  saleForm.productId
                ),
                locationId: Number(
                  saleForm.locationId
                ),
                quantity: Number(
                  saleForm.quantity
                ),
                sellingPrice: Number(
                  saleForm.sellingPrice
                ),
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        (!result.sale &&
          result.success !== true)
      ) {
        throw new Error(
          result.message ||
            "Unable to create sale"
        );
      }

      setSaleSuccess(
        "Sale created successfully. Inventory stock has been updated."
      );

      resetSaleForm();

      await fetchSales();
      await fetchProducts();

      setActivePage("sales");
    } catch (error) {
      console.error(
        "Create sale error:",
        error
      );

      setSaleError(
        error.message ||
          "Unable to create sale."
      );
    } finally {
      setSavingSale(false);
    }
  }

  // ============================================================
  // INVENTORY HELPERS
  // ============================================================

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
          return `Location ID: ${inventory.locationId}`;
        }

        return (
          `${location.name} | ` +
          `Rack: ${
            location.rack || "N/A"
          } | ` +
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

  function getFilteredProducts() {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter(
      (product) => {
        const searchableText = `
          ${product.name || ""}
          ${product.partNumber || ""}
          ${product.description || ""}
          ${product.vehicleModel || ""}
          ${product.brand?.name || ""}
          ${product.category?.name || ""}
          ${(product.inventories || [])
            .map(
              (inventory) =>
                inventory.location?.name ||
                ""
            )
            .join(" ")}
        `.toLowerCase();

        return searchableText.includes(
          search
        );
      }
    );
  }

  // ============================================================
  // DASHBOARD CALCULATIONS
  // ============================================================

  const filteredProducts =
    getFilteredProducts();

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        getTotalStock(product),
      0
    );

  const lowStockProducts =
    products.filter((product) => {
      const stock =
        getTotalStock(product);

      const minimumStock = Number(
        product.minimumStock || 0
      );

      return (
        stock <= minimumStock
      );
    });

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

  const locationMap = {};

  products.forEach((product) => {
    (
      product.inventories || []
    ).forEach((inventory) => {
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
    });
  });

  const locationSummary =
    Object.entries(locationMap);

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Sri Vengamamba</h1>

          <h2>
            Oils & Automobiles
          </h2>

          <p className="login-subtitle">
            Inventory Management
            System
          </p>

          <form
            onSubmit={handleLogin}
          >
            <label>Email</label>

            <input
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

            <label>Password</label>

            <input
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
              disabled={
                loginLoading
              }
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

  // ============================================================
  // DASHBOARD
  // ============================================================

  function DashboardPage() {
    return (
      <>
        <section className="dashboard-stats">
          <div className="stat-card">
            <p>Total Products</p>

            <h3>
              {totalProducts}
            </h3>

            <span>
              Products in inventory
            </span>
          </div>

          <div className="stat-card">
            <p>Total Stock</p>

            <h3>
              {totalStock}
            </h3>

            <span>
              Units available
            </span>
          </div>

          <div className="stat-card low-stock-card">
            <p>Low Stock</p>

            <h3>
              {
                lowStockProducts.length
              }
            </h3>

            <span>
              Products need attention
            </span>
          </div>

          <div className="stat-card">
            <p>Inventory Value</p>

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

          <div className="stat-card">
            <p>Locations</p>

            <h3>
              {
                locationSummary.length
              }
            </h3>

            <span>
              Active stock locations
            </span>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                Stock by Location
              </h2>

              <p>
                Current inventory
                quantity at each
                location.
              </p>
            </div>
          </div>

          {locationSummary.length ===
          0 ? (
            <div className="empty-dashboard">
              No inventory
              locations found.
            </div>
          ) : (
            <div className="location-summary-grid">
              {locationSummary.map(
                ([
                  locationName,
                  quantity,
                ]) => (
                  <div
                    className="location-summary-card"
                    key={
                      locationName
                    }
                  >
                    <div>
                      <h3>
                        {
                          locationName
                        }
                      </h3>

                      <p>
                        Available
                        stock
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

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                Low Stock Products
              </h2>

              <p>
                Products that have
                reached or fallen
                below their minimum
                stock level.
              </p>
            </div>
          </div>

          {lowStockProducts.length ===
          0 ? (
            <div className="empty-dashboard">
              No low stock
              products currently.
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts.map(
                (product) => {
                  const stock =
                    getTotalStock(
                      product
                    );

                  return (
                    <div
                      className="low-stock-item"
                      key={
                        product.id
                      }
                    >
                      <div>
                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <p>
                          Part Number:{" "}
                          {
                            product.partNumber ||
                            "N/A"
                          }
                        </p>

                        <p>
                          Brand:{" "}
                          {
                            product
                              .brand
                              ?.name ||
                            "N/A"
                          }
                        </p>

                        <p>
                          Category:{" "}
                          {
                            product
                              .category
                              ?.name ||
                            "N/A"
                          }
                        </p>
                      </div>

                      <div className="low-stock-values">
                        <div>
                          <span>
                            Current
                            Stock
                          </span>

                          <strong className="stock-low">
                            {stock}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Minimum
                            Stock
                          </span>

                          <strong>
                            {
                              product.minimumStock
                            }
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

        <section className="search-card">
          <div className="search-heading">
            <h2>
              Search Products
            </h2>

            <p>
              Search by product
              name, part number,
              description, vehicle
              model, brand,
              category, or
              location.
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
                className="clear-search-button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear Search
              </button>
            )}
          </div>

          <p className="search-result-info">
            Showing{" "}
            <strong>
              {
                filteredProducts.length
              }
            </strong>{" "}
            of{" "}
            <strong>
              {products.length}
            </strong>{" "}
            products
          </p>
        </section>

        {showProductForm && (
          <ProductForm />
        )}

        <section className="summary-card">
          <h2>
            Product Inventory
          </h2>

          <p>
            Total products matching
            search:{" "}
            <strong>
              {
                filteredProducts.length
              }
            </strong>
          </p>
        </section>

        {loadingProducts && (
          <div className="message-card">
            Loading products...
          </div>
        )}

        {productError && (
          <div className="error-card">
            {productError}
          </div>
        )}

        {!loadingProducts &&
          !productError &&
          filteredProducts.length >
            0 && (
            <ProductTable />
          )}

        {!loadingProducts &&
          !productError &&
          filteredProducts.length ===
            0 && (
            <div className="message-card">
              No products found.
            </div>
          )}
      </>
    );
  }

  // ============================================================
  // PRODUCT FORM
  // ============================================================

  function ProductForm() {
    return (
      <section className="product-form-card">
        <div className="form-header">
          <div>
            <h2>
              Add New Product
            </h2>

            <p>
              Enter product
              information below.
            </p>
          </div>

          <button
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
            <div className="form-group">
              <label>
                Product Name *
              </label>

              <input
                name="name"
                value={
                  productForm.name
                }
                onChange={
                  handleProductFormChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Part Number
              </label>

              <input
                name="partNumber"
                value={
                  productForm.partNumber
                }
                onChange={
                  handleProductFormChange
                }
              />
            </div>

            <div className="form-group">
              <label>
                Vehicle Model
              </label>

              <input
                name="vehicleModel"
                value={
                  productForm.vehicleModel
                }
                onChange={
                  handleProductFormChange
                }
              />
            </div>

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
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

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
                      key={
                        brand.id
                      }
                      value={
                        brand.id
                      }
                    >
                      {brand.name}
                    </option>
                  )
                )}
              </select>
            </div>

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
                min="0"
                step="0.01"
                required
              />
            </div>

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
                min="0"
                step="0.01"
                required
              />
            </div>

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
                min="0"
                required
              />
            </div>

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
                rows="4"
              />
            </div>
          </div>

          {productFormError && (
            <div className="error-message">
              {productFormError}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={
                handleCloseProductForm
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-product-button"
              disabled={
                savingProduct
              }
            >
              {savingProduct
                ? "Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ============================================================
  // PRODUCT TABLE
  // ============================================================

  function ProductTable() {
    return (
      <section className="table-card">
        <div className="table-heading">
          <h2>
            All Products
          </h2>

          <span>
            {
              filteredProducts.length
            }{" "}
            records
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>
                  Product Name
                </th>
                <th>
                  Part Number
                </th>
                <th>
                  Vehicle Model
                </th>
                <th>Brand</th>
                <th>
                  Category
                </th>
                <th>MRP</th>
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
                  const stock =
                    getTotalStock(
                      product
                    );

                  const minimum =
                    Number(
                      product.minimumStock ||
                        0
                    );

                  return (
                    <tr
                      key={
                        product.id
                      }
                    >
                      <td>
                        {
                          product.id
                        }
                      </td>

                      <td>
                        <strong>
                          {
                            product.name
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          product.partNumber ||
                          "N/A"
                        }
                      </td>

                      <td>
                        {
                          product.vehicleModel ||
                          "N/A"
                        }
                      </td>

                      <td>
                        {
                          product.brand
                            ?.name ||
                          "N/A"
                        }
                      </td>

                      <td>
                        {
                          product
                            .category
                            ?.name ||
                          "N/A"
                        }
                      </td>

                      <td>
                        ₹
                        {Number(
                          product.mrp ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td>
                        ₹
                        {Number(
                          product.sellingPrice ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            stock <=
                            minimum
                              ? "stock-low"
                              : "stock-normal"
                          }
                        >
                          {stock}
                        </span>
                      </td>

                      <td>
                        {minimum}
                      </td>

                      <td>
                        <div className="location-list">
                          {getLocationText(
                            product
                          ).map(
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
    );
  }

  // ============================================================
  // PURCHASE FORM
  // ============================================================

  function PurchaseForm() {
    return (
      <section className="transaction-card">
        <div className="transaction-header">
          <div>
            <h2>
              Create Purchase
            </h2>

            <p>
              Add purchased stock to
              your inventory.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleCreatePurchase
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>
                Supplier *
              </label>

              <select
                name="supplierId"
                value={
                  purchaseForm.supplierId
                }
                onChange={
                  handlePurchaseFormChange
                }
                required
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map(
                  (supplier) => (
                    <option
                      key={
                        supplier.id
                      }
                      value={
                        supplier.id
                      }
                    >
                      {
                        supplier.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Invoice Number
              </label>

              <input
                name="invoiceNumber"
                value={
                  purchaseForm.invoiceNumber
                }
                onChange={
                  handlePurchaseFormChange
                }
                placeholder="PUR-002"
              />
            </div>

            <div className="form-group">
              <label>
                Purchase Date *
              </label>

              <input
                type="date"
                name="purchaseDate"
                value={
                  purchaseForm.purchaseDate
                }
                onChange={
                  handlePurchaseFormChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Product *
              </label>

              <select
                name="productId"
                value={
                  purchaseForm.productId
                }
                onChange={
                  handlePurchaseFormChange
                }
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Location *
              </label>

              <select
                name="locationId"
                value={
                  purchaseForm.locationId
                }
                onChange={
                  handlePurchaseFormChange
                }
                required
              >
                <option value="">
                  Select location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location.id
                      }
                      value={
                        location.id
                      }
                    >
                      {
                        location.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Quantity *
              </label>

              <input
                type="number"
                name="quantity"
                value={
                  purchaseForm.quantity
                }
                onChange={
                  handlePurchaseFormChange
                }
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Purchase Price *
              </label>

              <input
                type="number"
                name="purchasePrice"
                value={
                  purchaseForm.purchasePrice
                }
                onChange={
                  handlePurchaseFormChange
                }
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="transaction-total">
            <span>
              Total Amount
            </span>

            <strong>
              ₹
              {purchaseTotal.toFixed(
                2
              )}
            </strong>
          </div>

          {purchaseError && (
            <div className="error-message">
              {purchaseError}
            </div>
          )}

          {purchaseSuccess && (
            <div className="success-message">
              {purchaseSuccess}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={
                resetPurchaseForm
              }
            >
              Clear
            </button>

            <button
              type="submit"
              className="save-product-button"
              disabled={
                savingPurchase
              }
            >
              {savingPurchase
                ? "Saving..."
                : "Save Purchase"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ============================================================
  // PURCHASE HISTORY
  // ============================================================

  function PurchaseHistory() {
    return (
      <section className="history-card">
        <div className="section-header">
          <div>
            <h2>
              Purchase History
            </h2>

            <p>
              All purchase
              transactions.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={
              fetchPurchases
            }
          >
            Refresh
          </button>
        </div>

        {loadingPurchases ? (
          <div className="message-card">
            Loading purchases...
          </div>
        ) : purchaseError ? (
          <div className="error-card">
            {purchaseError}
          </div>
        ) : purchases.length ===
          0 ? (
          <div className="empty-dashboard">
            No purchases found.
          </div>
        ) : (
          <div className="transaction-list">
            {purchases.map(
              (purchase) => (
                <div
                  className="transaction-item"
                  key={
                    purchase.id
                  }
                >
                  <div>
                    <h3>
                      {purchase.invoiceNumber ||
                        `Purchase #${purchase.id}`}
                    </h3>

                    <p>
                      Supplier:{" "}
                      {
                        purchase
                          .supplier
                          ?.name ||
                        "N/A"
                      }
                    </p>

                    <p>
                      Date:{" "}
                      {purchase.purchaseDate
                        ? new Date(
                            purchase.purchaseDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="transaction-amount">
                    ₹
                    {Number(
                      purchase.totalAmount ||
                        0
                    ).toFixed(
                      2
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    );
  }

  // ============================================================
  // SALE FORM
  // ============================================================

  function SaleForm() {
    const availableStock =
      getInventoryQuantity(
        saleForm.productId,
        saleForm.locationId
      );

    return (
      <section className="transaction-card">
        <div className="transaction-header">
          <div>
            <h2>
              Create Sale
            </h2>

            <p>
              Sell products and
              automatically reduce
              inventory.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleCreateSale
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>
                Customer
              </label>

              <select
                name="customerId"
                value={
                  saleForm.customerId
                }
                onChange={
                  handleSaleFormChange
                }
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={
                        customer.id
                      }
                      value={
                        customer.id
                      }
                    >
                      {
                        customer.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Invoice Number
              </label>

              <input
                name="invoiceNumber"
                value={
                  saleForm.invoiceNumber
                }
                onChange={
                  handleSaleFormChange
                }
                placeholder="SALE-002"
              />
            </div>

            <div className="form-group">
              <label>
                Product *
              </label>

              <select
                name="productId"
                value={
                  saleForm.productId
                }
                onChange={
                  handleSaleFormChange
                }
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Location *
              </label>

              <select
                name="locationId"
                value={
                  saleForm.locationId
                }
                onChange={
                  handleSaleFormChange
                }
                required
              >
                <option value="">
                  Select location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location.id
                      }
                      value={
                        location.id
                      }
                    >
                      {
                        location.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Available Stock
              </label>

              <input
                value={
                  availableStock
                }
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-group">
              <label>
                Quantity *
              </label>

              <input
                type="number"
                name="quantity"
                value={
                  saleForm.quantity
                }
                onChange={
                  handleSaleFormChange
                }
                min="1"
                max={
                  availableStock ||
                  undefined
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Selling Price *
              </label>

              <input
                type="number"
                name="sellingPrice"
                value={
                  saleForm.sellingPrice
                }
                onChange={
                  handleSaleFormChange
                }
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="transaction-total">
            <span>
              Total Amount
            </span>

            <strong>
              ₹
              {saleTotal.toFixed(
                2
              )}
            </strong>
          </div>

          {saleError && (
            <div className="error-message">
              {saleError}
            </div>
          )}

          {saleSuccess && (
            <div className="success-message">
              {saleSuccess}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={
                resetSaleForm
              }
            >
              Clear
            </button>

            <button
              type="submit"
              className="save-product-button"
              disabled={
                savingSale
              }
            >
              {savingSale
                ? "Saving..."
                : "Save Sale"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ============================================================
  // SALES HISTORY
  // ============================================================

  function SalesHistory() {
    return (
      <section className="history-card">
        <div className="section-header">
          <div>
            <h2>
              Sales History
            </h2>

            <p>
              All sales
              transactions.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchSales}
          >
            Refresh
          </button>
        </div>

        {loadingSales ? (
          <div className="message-card">
            Loading sales...
          </div>
        ) : saleError ? (
          <div className="error-card">
            {saleError}
          </div>
        ) : sales.length ===
          0 ? (
          <div className="empty-dashboard">
            No sales found.
          </div>
        ) : (
          <div className="transaction-list">
            {sales.map(
              (sale) => (
                <div
                  className="transaction-item"
                  key={sale.id}
                >
                  <div>
                    <h3>
                      {sale.invoiceNumber ||
                        `Sale #${sale.id}`}
                    </h3>

                    <p>
                      Customer:{" "}
                      {
                        sale.customer
                          ?.name ||
                        "Walk-in Customer"
                      }
                    </p>

                    <p>
                      Date:{" "}
                      {sale.createdAt
                        ? new Date(
                            sale.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="transaction-amount">
                    ₹
                    {Number(
                      sale.totalAmount ||
                        0
                    ).toFixed(
                      2
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    );
  }

  // ============================================================
  // MAIN APP
  // ============================================================

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>
            Sri Vengamamba
            Oils & Automobiles
          </h1>

          <p>
            Inventory Management
            System
          </p>

          {user && (
            <p className="welcome-text">
              Welcome,{" "}
              {user.name ||
                user.email}
            </p>
          )}
        </div>

        <button
          className="logout-button"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>
      </header>

      <nav className="main-navigation">
        <button
          className={
            activePage ===
            "dashboard"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "dashboard"
            )
          }
        >
          Dashboard
        </button>

        <button
          className={
            activePage ===
            "purchases"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "purchases"
            )
          }
        >
          Purchases
        </button>

        <button
          className={
            activePage === "sales"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("sales")
          }
        >
          Sales
        </button>
      </nav>

      <main className="main-content">
        {activePage ===
          "dashboard" && (
          <>
            {productFormSuccess && (
              <div className="success-card">
                {
                  productFormSuccess
                }
              </div>
            )}

            <div className="page-action-bar">
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
                onClick={
                  fetchProducts
                }
              >
                Refresh Products
              </button>
            </div>

            <DashboardPage />
          </>
        )}

        {activePage ===
          "purchases" && (
          <>
            <PurchaseForm />
            <PurchaseHistory />
          </>
        )}

        {activePage === "sales" && (
          <>
            <SaleForm />
            <SalesHistory />
          </>
        )}
      </main>
    </div>
  );
}

export default App; 

