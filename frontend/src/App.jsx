import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // =========================================================
  // AUTH
  // =========================================================
  const [token, setToken] = useState(
    localStorage.getItem("inventoryToken") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("inventoryUser")) || null;
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({
    email: "admin@example.com",
    password: "admin123",
  });

  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // =========================================================
  // NAVIGATION
  // =========================================================
  const [activePage, setActivePage] = useState("dashboard");

  // =========================================================
  // PRODUCTS / CATEGORIES / BRANDS / INVENTORY
  // =========================================================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // =========================================================
  // SUPPLIERS
  // =========================================================
  const [suppliers, setSuppliers] = useState([]);

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [savingSupplier, setSavingSupplier] = useState(false);

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [supplierFormError, setSupplierFormError] = useState("");
  const [supplierFormSuccess, setSupplierFormSuccess] = useState("");

  // =========================================================
  // CUSTOMERS
  // =========================================================
  const [customers, setCustomers] = useState([]);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [customerFormError, setCustomerFormError] = useState("");
  const [customerFormSuccess, setCustomerFormSuccess] = useState("");

  // =========================================================
  // PRODUCT FORM
  // =========================================================
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormError, setProductFormError] = useState("");
  const [productFormSuccess, setProductFormSuccess] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

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

  // =========================================================
  // SEARCH / FILTER
  // =========================================================
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("");

  // =========================================================
  // PURCHASE
  // =========================================================
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    productId: "",
    locationId: "",
    quantity: "",
    purchasePrice: "",
  });

  const [locations, setLocations] = useState([]);

  const [purchases, setPurchases] = useState([]);

  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const [savingPurchase, setSavingPurchase] = useState(false);

  // =========================================================
  // SALES
  // =========================================================
  const [saleForm, setSaleForm] = useState({
    customerId: "",
    invoiceNumber: "",
    productId: "",
    locationId: "",
    quantity: "",
    sellingPrice: "",
  });

  const [sales, setSales] = useState([]);

  const [saleError, setSaleError] = useState("");
  const [saleSuccess, setSaleSuccess] = useState("");
  const [savingSale, setSavingSale] = useState(false);

  // =========================================================
  // DASHBOARD
  // =========================================================
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // =========================================================
  // COMMON AUTH HEADER
  // =========================================================
  const getHeaders = (includeJson = false) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  // =========================================================
  // LOGIN
  // =========================================================
  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");
    setLoggingIn(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      const newToken = result.data.token;
      const newUser = result.data.user;

      localStorage.setItem("inventoryToken", newToken);
      localStorage.setItem("inventoryUser", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setActivePage("dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "Unable to login");
    } finally {
      setLoggingIn(false);
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================
  function handleLogout() {
    localStorage.removeItem("inventoryToken");
    localStorage.removeItem("inventoryUser");

    setToken("");
    setUser(null);
    setActivePage("dashboard");
  }

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  async function fetchProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch products");
      }

      const productData = Array.isArray(result)
        ? result
        : result.data || [];

      setProducts(productData);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  }

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================
  async function fetchCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch categories");
      }

      const categoryData = Array.isArray(result)
        ? result
        : result.data || [];

      setCategories(categoryData);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  }

  // =========================================================
  // FETCH BRANDS
  // =========================================================
  async function fetchBrands() {
    try {
      const response = await fetch(`${API_URL}/api/brands`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch brands");
      }

      const brandData = Array.isArray(result)
        ? result
        : result.data || [];

      setBrands(brandData);
    } catch (error) {
      console.error("Fetch brands error:", error);
    }
  }

  // =========================================================
  // FETCH LOCATIONS
  // =========================================================
  async function fetchLocations() {
    try {
      const response = await fetch(`${API_URL}/api/locations`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch locations");
      }

      const locationData = Array.isArray(result)
        ? result
        : result.data || [];

      setLocations(locationData);
    } catch (error) {
      console.error("Fetch locations error:", error);
    }
  }

  // =========================================================
  // FETCH SUPPLIERS
  // =========================================================
  async function fetchSuppliers() {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch suppliers");
      }

      setSuppliers(result.data || []);
    } catch (error) {
      console.error("Fetch suppliers error:", error);
    }
  }

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================
  async function fetchCustomers() {
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch customers");
      }

      setCustomers(result.data || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
    }
  }

  // =========================================================
  // FETCH PURCHASES
  // =========================================================
  async function fetchPurchases() {
    try {
      const response = await fetch(`${API_URL}/api/purchases`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch purchases");
      }

      const purchaseData = Array.isArray(result)
        ? result
        : result.data || [];

      setPurchases(purchaseData);
    } catch (error) {
      console.error("Fetch purchases error:", error);
    }
  }

  // =========================================================
  // FETCH SALES
  // =========================================================
  async function fetchSales() {
    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch sales");
      }

      const salesData = Array.isArray(result)
        ? result
        : result.data || [];

      setSales(salesData);
    } catch (error) {
      console.error("Fetch sales error:", error);
    }
  }

  // =========================================================
  // INITIAL DATA LOAD
  // =========================================================
  useEffect(() => {
    if (!token) return;

    async function loadAllData() {
      setDashboardLoading(true);

      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands(),
        fetchLocations(),
        fetchSuppliers(),
        fetchCustomers(),
        fetchPurchases(),
        fetchSales(),
      ]);

      setDashboardLoading(false);
    }

    loadAllData();
  }, [token]);

  // =========================================================
  // PRODUCT FORM
  // =========================================================
  function handleProductFormChange(event) {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
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

  function handleAddProduct() {
    resetProductForm();
    setProductFormSuccess("");
    setShowProductForm(true);
  }

  function closeProductForm() {
    setShowProductForm(false);
    resetProductForm();
  }

  async function handleSaveProduct(event) {
    event.preventDefault();

    setSavingProduct(true);
    setProductFormError("");
    setProductFormSuccess("");

    try {
      if (!productForm.name.trim()) {
        throw new Error("Product name is required");
      }

      if (!productForm.partNumber.trim()) {
        throw new Error("Part number is required");
      }

      if (!productForm.mrp || Number(productForm.mrp) < 0) {
        throw new Error("Enter a valid MRP");
      }

      if (
        !productForm.sellingPrice ||
        Number(productForm.sellingPrice) < 0
      ) {
        throw new Error("Enter a valid selling price");
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: productForm.name.trim(),
          partNumber: productForm.partNumber.trim(),
          description: productForm.description || null,
          vehicleModel: productForm.vehicleModel || null,
          mrp: Number(productForm.mrp),
          sellingPrice: Number(productForm.sellingPrice),
          minimumStock: Number(productForm.minimumStock || 0),
          categoryId: productForm.categoryId
            ? Number(productForm.categoryId)
            : null,
          brandId: productForm.brandId
            ? Number(productForm.brandId)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to create product");
      }

      await fetchProducts();

      closeProductForm();

      setProductFormSuccess("Product created successfully.");
    } catch (error) {
      console.error("Save product error:", error);
      setProductFormError(error.message || "Unable to create product.");
    } finally {
      setSavingProduct(false);
    }
  }

  // =========================================================
  // PURCHASE FORM
  // =========================================================
  function handlePurchaseFormChange(event) {
    const { name, value } = event.target;

    setPurchaseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetPurchaseForm() {
    setPurchaseForm({
      supplierId: "",
      invoiceNumber: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      productId: "",
      locationId: "",
      quantity: "",
      purchasePrice: "",
    });
  }

  async function handleSavePurchase(event) {
    event.preventDefault();

    setPurchaseError("");
    setPurchaseSuccess("");
    setSavingPurchase(true);

    try {
      if (!purchaseForm.supplierId) {
        throw new Error("Please select a supplier.");
      }

      if (!purchaseForm.invoiceNumber.trim()) {
        throw new Error("Invoice number is required.");
      }

      if (!purchaseForm.productId) {
        throw new Error("Please select a product.");
      }

      if (!purchaseForm.locationId) {
        throw new Error("Please select a location.");
      }

      if (
        !purchaseForm.quantity ||
        Number(purchaseForm.quantity) <= 0
      ) {
        throw new Error("Quantity must be greater than 0.");
      }

      if (
        purchaseForm.purchasePrice === "" ||
        Number(purchaseForm.purchasePrice) < 0
      ) {
        throw new Error("Enter a valid purchase price.");
      }

      const response = await fetch(`${API_URL}/api/purchases`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          supplierId: Number(purchaseForm.supplierId),
          invoiceNumber: purchaseForm.invoiceNumber.trim(),
          purchaseDate: purchaseForm.purchaseDate,
          items: [
            {
              productId: Number(purchaseForm.productId),
              locationId: Number(purchaseForm.locationId),
              quantity: Number(purchaseForm.quantity),
              purchasePrice: Number(purchaseForm.purchasePrice),
            },
          ],
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to create purchase");
      }

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
      ]);

      resetPurchaseForm();

      setPurchaseSuccess("Purchase created successfully.");
    } catch (error) {
      console.error("Save purchase error:", error);
      setPurchaseError(error.message || "Unable to create purchase.");
    } finally {
      setSavingPurchase(false);
    }
  }

  // =========================================================
  // SALES FORM
  // =========================================================
  function handleSaleFormChange(event) {
    const { name, value } = event.target;

    setSaleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

  function getInventoryQuantity(productId, locationId) {
    const product = products.find(
      (item) => Number(item.id) === Number(productId)
    );

    if (!product) return 0;

    if (Array.isArray(product.inventory)) {
      const inventoryItem = product.inventory.find(
        (item) => Number(item.locationId) === Number(locationId)
      );

      return inventoryItem ? Number(inventoryItem.quantity || 0) : 0;
    }

    if (Array.isArray(product.inventories)) {
      const inventoryItem = product.inventories.find(
        (item) => Number(item.locationId) === Number(locationId)
      );

      return inventoryItem ? Number(inventoryItem.quantity || 0) : 0;
    }

    return 0;
  }

  async function handleSaveSale(event) {
    event.preventDefault();

    setSaleError("");
    setSaleSuccess("");
    setSavingSale(true);

    try {
      if (!saleForm.invoiceNumber.trim()) {
        throw new Error("Invoice number is required.");
      }

      if (!saleForm.productId) {
        throw new Error("Please select a product.");
      }

      if (!saleForm.locationId) {
        throw new Error("Please select a location.");
      }

      if (!saleForm.quantity || Number(saleForm.quantity) <= 0) {
        throw new Error("Quantity must be greater than 0.");
      }

      if (
        saleForm.sellingPrice === "" ||
        Number(saleForm.sellingPrice) < 0
      ) {
        throw new Error("Enter a valid selling price.");
      }

      const availableStock = getInventoryQuantity(
        saleForm.productId,
        saleForm.locationId
      );

      if (
        availableStock > 0 &&
        Number(saleForm.quantity) > availableStock
      ) {
        throw new Error(
          `Only ${availableStock} units are available at this location.`
        );
      }

      const response = await fetch(`${API_URL}/api/sales`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          customerId: saleForm.customerId
            ? Number(saleForm.customerId)
            : null,
          invoiceNumber: saleForm.invoiceNumber.trim(),
          items: [
            {
              productId: Number(saleForm.productId),
              locationId: Number(saleForm.locationId),
              quantity: Number(saleForm.quantity),
              sellingPrice: Number(saleForm.sellingPrice),
            },
          ],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create sale");
      }

      await Promise.all([
        fetchSales(),
        fetchProducts(),
      ]);

      resetSaleForm();

      setSaleSuccess("Sale created successfully.");
    } catch (error) {
      console.error("Save sale error:", error);
      setSaleError(error.message || "Unable to create sale.");
    } finally {
      setSavingSale(false);
    }
  }

  // =========================================================
  // SUPPLIER FORM
  // =========================================================
  function handleSupplierFormChange(event) {
    const { name, value } = event.target;

    setSupplierForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function resetSupplierForm() {
    setSupplierForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingSupplierId(null);
    setSupplierFormError("");
  }

  function handleAddSupplier() {
    resetSupplierForm();
    setSupplierFormSuccess("");
    setShowSupplierForm(true);
  }

  function handleEditSupplier(supplier) {
    setSupplierForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setEditingSupplierId(supplier.id);
    setSupplierFormError("");
    setSupplierFormSuccess("");
    setShowSupplierForm(true);
  }

  function handleCancelSupplierForm() {
    setShowSupplierForm(false);
    resetSupplierForm();
  }

  async function handleSaveSupplier(event) {
    event.preventDefault();

    setSavingSupplier(true);
    setSupplierFormError("");
    setSupplierFormSuccess("");

    try {
      if (!supplierForm.name.trim()) {
        throw new Error("Supplier name is required.");
      }

      const isEditing = editingSupplierId !== null;

      const url = isEditing
        ? `${API_URL}/api/suppliers/${editingSupplierId}`
        : `${API_URL}/api/suppliers`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: supplierForm.name.trim(),
          phone: supplierForm.phone || null,
          email: supplierForm.email || null,
          address: supplierForm.address || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save supplier"
        );
      }

      await fetchSuppliers();

      setShowSupplierForm(false);
      resetSupplierForm();

      setSupplierFormSuccess(
        isEditing
          ? "Supplier updated successfully."
          : "Supplier created successfully."
      );
    } catch (error) {
      console.error("Save supplier error:", error);

      setSupplierFormError(
        error.message || "Unable to save supplier."
      );
    } finally {
      setSavingSupplier(false);
    }
  }

  async function handleDeleteSupplier(supplierId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    setSupplierFormError("");
    setSupplierFormSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/suppliers/${supplierId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete supplier"
        );
      }

      await fetchSuppliers();

      setSupplierFormSuccess("Supplier deleted successfully.");
    } catch (error) {
      console.error("Delete supplier error:", error);

      setSupplierFormError(
        error.message || "Unable to delete supplier."
      );
    }
  }

  // =========================================================
  // CUSTOMER FORM
  // =========================================================
  function handleCustomerFormChange(event) {
    const { name, value } = event.target;

    setCustomerForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function resetCustomerForm() {
    setCustomerForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingCustomerId(null);
    setCustomerFormError("");
  }

  function handleAddCustomer() {
    resetCustomerForm();
    setCustomerFormSuccess("");
    setShowCustomerForm(true);
  }

  function handleEditCustomer(customer) {
    setCustomerForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setEditingCustomerId(customer.id);
    setCustomerFormError("");
    setCustomerFormSuccess("");
    setShowCustomerForm(true);
  }

  function handleCancelCustomerForm() {
    setShowCustomerForm(false);
    resetCustomerForm();
  }

  async function handleSaveCustomer(event) {
    event.preventDefault();

    setSavingCustomer(true);
    setCustomerFormError("");
    setCustomerFormSuccess("");

    try {
      if (!customerForm.name.trim()) {
        throw new Error("Customer name is required.");
      }

      const isEditing = editingCustomerId !== null;

      const url = isEditing
        ? `${API_URL}/api/customers/${editingCustomerId}`
        : `${API_URL}/api/customers`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: customerForm.name.trim(),
          phone: customerForm.phone || null,
          email: customerForm.email || null,
          address: customerForm.address || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save customer"
        );
      }

      await fetchCustomers();

      setShowCustomerForm(false);
      resetCustomerForm();

      setCustomerFormSuccess(
        isEditing
          ? "Customer updated successfully."
          : "Customer created successfully."
      );
    } catch (error) {
      console.error("Save customer error:", error);

      setCustomerFormError(
        error.message || "Unable to save customer."
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleDeleteCustomer(customerId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    setCustomerFormError("");
    setCustomerFormSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete customer"
        );
      }

      await fetchCustomers();

      setCustomerFormSuccess("Customer deleted successfully.");
    } catch (error) {
      console.error("Delete customer error:", error);

      setCustomerFormError(
        error.message || "Unable to delete customer."
      );
    }
  }

  // =========================================================
  // PRODUCT FILTERING
  // =========================================================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = productSearch.toLowerCase().trim();

      const matchesSearch =
        !search ||
        String(product.name || "")
          .toLowerCase()
          .includes(search) ||
        String(product.partNumber || "")
          .toLowerCase()
          .includes(search) ||
        String(product.vehicleModel || "")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !productCategoryFilter ||
        Number(product.categoryId) ===
          Number(productCategoryFilter);

      const matchesBrand =
        !productBrandFilter ||
        Number(product.brandId) === Number(productBrandFilter);

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [
    products,
    productSearch,
    productCategoryFilter,
    productBrandFilter,
  ]);

  // =========================================================
  // DASHBOARD CALCULATIONS
  // =========================================================
  const totalProducts = products.length;

  const totalStock = products.reduce((total, product) => {
    const inventory =
      product.inventory || product.inventories || [];

    const productStock = Array.isArray(inventory)
      ? inventory.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      : Number(product.quantity || 0);

    return total + productStock;
  }, 0);

  const lowStockProducts = products.filter((product) => {
    const inventory =
      product.inventory || product.inventories || [];

    const stock = Array.isArray(inventory)
      ? inventory.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      : Number(product.quantity || 0);

    return stock <= Number(product.minimumStock || 0);
  });

  const inventoryValue = products.reduce((total, product) => {
    const inventory =
      product.inventory || product.inventories || [];

    const stock = Array.isArray(inventory)
      ? inventory.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      : Number(product.quantity || 0);

    return (
      total +
      stock * Number(product.sellingPrice || 0)
    );
  }, 0);

  const locationStock = locations.map((location) => {
    const stock = products.reduce((total, product) => {
      const inventory =
        product.inventory || product.inventories || [];

      if (!Array.isArray(inventory)) return total;

      const item = inventory.find(
        (inventoryItem) =>
          Number(inventoryItem.locationId) ===
          Number(location.id)
      );

      return total + Number(item?.quantity || 0);
    }, 0);

    return {
      ...location,
      stock,
    };
  });

  // =========================================================
  // LOGIN SCREEN
  // =========================================================
  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">SV</div>

          <h1>Sri Vengamamba</h1>
          <p className="login-subtitle">
            Oils & Automobiles
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    email: event.target.value,
                  })
                }
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    password: event.target.value,
                  })
                }
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="alert alert-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="primary-button full-width"
              disabled={loggingIn}
            >
              {loggingIn ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            Inventory Management System
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD PAGE
  // =========================================================
  function DashboardPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Dashboard</h2>
            <p>
              Overview of Sri Vengamamba inventory
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={async () => {
              setDashboardLoading(true);

              await Promise.all([
                fetchProducts(),
                fetchCategories(),
                fetchBrands(),
                fetchLocations(),
              ]);

              setDashboardLoading(false);
            }}
          >
            {dashboardLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {productFormSuccess && (
          <div className="alert alert-success">
            {productFormSuccess}
          </div>
        )}

        {productFormError && (
          <div className="alert alert-error">
            {productFormError}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">
              Total Products
            </span>

            <strong>{totalProducts}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Stock
            </span>

            <strong>{totalStock}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Low Stock
            </span>

            <strong>{lowStockProducts.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Inventory Value
            </span>

            <strong>
              ₹{inventoryValue.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Stock by Location</h3>
            </div>

            <div className="location-cards">
              {locationStock.length === 0 ? (
                <p className="empty-state">
                  No locations found.
                </p>
              ) : (
                locationStock.map((location) => (
                  <div
                    className="location-card"
                    key={location.id}
                  >
                    <h4>{location.name}</h4>

                    <p>
                      {location.section &&
                        `Section: ${location.section}`}
                    </p>

                    <p>
                      {location.rack &&
                        `Rack: ${location.rack}`}
                    </p>

                    <p>
                      {location.shelf &&
                        `Shelf: ${location.shelf}`}
                    </p>

                    <strong>
                      {location.stock} units
                    </strong>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-header">
              <h3>Low Stock Products</h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="empty-state">
                No low-stock products.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Minimum</th>
                      <th>Category</th>
                      <th>Brand</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockProducts.map((product) => {
                      const inventory =
                        product.inventory ||
                        product.inventories ||
                        [];

                      const stock = Array.isArray(inventory)
                        ? inventory.reduce(
                            (sum, item) =>
                              sum +
                              Number(item.quantity || 0),
                            0
                          )
                        : Number(product.quantity || 0);

                      return (
                        <tr key={product.id}>
                          <td>{product.name}</td>

                          <td className="low-stock-number">
                            {stock}
                          </td>

                          <td>
                            {product.minimumStock || 0}
                          </td>

                          <td>
                            {product.category?.name ||
                              "Engine Oil"}
                          </td>

                          <td>
                            {product.brand?.name || "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>Products</h3>
              <p>
                Search and filter your products
              </p>
            </div>

            <button
              className="primary-button"
              onClick={handleAddProduct}
            >
              + Add Product
            </button>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              value={productSearch}
              onChange={(event) =>
                setProductSearch(event.target.value)
              }
              placeholder="Search product, part number, vehicle..."
            />

            <select
              value={productCategoryFilter}
              onChange={(event) =>
                setProductCategoryFilter(event.target.value)
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={productBrandFilter}
              onChange={(event) =>
                setProductBrandFilter(event.target.value)
              }
            >
              <option value="">
                All Brands
              </option>

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

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Part Number</th>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>MRP</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-table"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const inventory =
                      product.inventory ||
                      product.inventories ||
                      [];

                    const stock = Array.isArray(inventory)
                      ? inventory.reduce(
                          (sum, item) =>
                            sum +
                            Number(item.quantity || 0),
                          0
                        )
                      : Number(product.quantity || 0);

                    return (
                      <tr key={product.id}>
                        <td>
                          <strong>
                            {product.name}
                          </strong>
                        </td>

                        <td>
                          {product.partNumber || "-"}
                        </td>

                        <td>
                          {product.vehicleModel || "-"}
                        </td>

                        <td>
                          {product.category?.name ||
                            "N/A"}
                        </td>

                        <td>
                          {product.brand?.name || "N/A"}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.mrp || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.sellingPrice || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          <span
                            className={
                              stock <=
                              Number(
                                product.minimumStock ||
                                  0
                              )
                                ? "stock-badge low"
                                : "stock-badge"
                            }
                          >
                            {stock}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showProductForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3>Add Product</h3>
                  <p>
                    Add a new product to inventory
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={closeProductForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>

                    <input
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      placeholder="Servo 4T Engine Oil"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Part Number *</label>

                    <input
                      name="partNumber"
                      value={productForm.partNumber}
                      onChange={handleProductFormChange}
                      placeholder="SERVO-4T-001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Vehicle Model</label>

                    <input
                      name="vehicleModel"
                      value={productForm.vehicleModel}
                      onChange={handleProductFormChange}
                      placeholder="Honda, Bajaj..."
                    />
                  </div>

                  <div className="form-group">
                    <label>MRP *</label>

                    <input
                      type="number"
                      min="0"
                      name="mrp"
                      value={productForm.mrp}
                      onChange={handleProductFormChange}
                      placeholder="550"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Selling Price *</label>

                    <input
                      type="number"
                      min="0"
                      name="sellingPrice"
                      value={productForm.sellingPrice}
                      onChange={handleProductFormChange}
                      placeholder="500"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock</label>

                    <input
                      type="number"
                      min="0"
                      name="minimumStock"
                      value={productForm.minimumStock}
                      onChange={handleProductFormChange}
                      placeholder="10"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>

                    <select
                      name="categoryId"
                      value={productForm.categoryId}
                      onChange={handleProductFormChange}
                    >
                      <option value="">
                        Select category
                      </option>

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
                    <label>Brand</label>

                    <select
                      name="brandId"
                      value={productForm.brandId}
                      onChange={handleProductFormChange}
                    >
                      <option value="">
                        Select brand
                      </option>

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

                  <div className="form-group full-span">
                    <label>Description</label>

                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      placeholder="Product description..."
                      rows="3"
                    />
                  </div>
                </div>

                {productFormError && (
                  <div className="alert alert-error">
                    {productFormError}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeProductForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingProduct}
                  >
                    {savingProduct
                      ? "Saving..."
                      : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // PURCHASES PAGE
  // =========================================================
  function PurchasesPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Purchase Management</h2>
            <p>
              Record purchases and increase inventory
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchPurchases}
          >
            ↻ Refresh
          </button>
        </div>

        {purchaseSuccess && (
          <div className="alert alert-success">
            {purchaseSuccess}
          </div>
        )}

        {purchaseError && (
          <div className="alert alert-error">
            {purchaseError}
          </div>
        )}

        <section className="transaction-card">
          <div className="section-header">
            <div>
              <h3>Create Purchase</h3>
              <p>
                Stock will automatically be added to
                the selected location.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePurchase}>
            <div className="form-grid">
              <div className="form-group">
                <label>Supplier *</label>

                <select
                  name="supplierId"
                  value={purchaseForm.supplierId}
                  onChange={handlePurchaseFormChange}
                  required
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>
                  ))}
                </select>

                {suppliers.length === 0 && (
                  <small>
                    Add a supplier from Supplier
                    Management first.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Invoice Number *</label>

                <input
                  name="invoiceNumber"
                  value={purchaseForm.invoiceNumber}
                  onChange={handlePurchaseFormChange}
                  placeholder="INV-001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Date *</label>

                <input
                  type="date"
                  name="purchaseDate"
                  value={purchaseForm.purchaseDate}
                  onChange={handlePurchaseFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product *</label>

                <select
                  name="productId"
                  value={purchaseForm.productId}
                  onChange={handlePurchaseFormChange}
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} -{" "}
                      {product.partNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Location *</label>

                <select
                  name="locationId"
                  value={purchaseForm.locationId}
                  onChange={handlePurchaseFormChange}
                  required
                >
                  <option value="">
                    Select location
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={purchaseForm.quantity}
                  onChange={handlePurchaseFormChange}
                  placeholder="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Price *</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="purchasePrice"
                  value={purchaseForm.purchasePrice}
                  onChange={handlePurchaseFormChange}
                  placeholder="450"
                  required
                />
              </div>
            </div>

            <div className="transaction-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetPurchaseForm}
              >
                Clear
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={savingPurchase}
              >
                {savingPurchase
                  ? "Saving..."
                  : "Create Purchase"}
              </button>
            </div>
          </form>
        </section>

        <section className="history-section">
          <div className="section-header">
            <div>
              <h3>Purchase History</h3>
              <p>
                {purchases.length} purchase record(s)
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Invoice</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-table"
                    >
                      No purchase records found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>

                      <td>
                        {purchase.invoiceNumber ||
                          purchase.invoiceNo ||
                          "-"}
                      </td>

                      <td>
                        {purchase.supplier?.name ||
                          purchase.supplierId ||
                          "-"}
                      </td>

                      <td>
                        {purchase.purchaseDate
                          ? new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()
                          : purchase.createdAt
                          ? new Date(
                              purchase.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          purchase.totalAmount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        <span className="status-badge">
                          {purchase.status ||
                            "COMPLETED"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================
  // SALES PAGE
  // =========================================================
  function SalesPage() {
    const selectedStock = saleForm.productId &&
      saleForm.locationId
      ? getInventoryQuantity(
          saleForm.productId,
          saleForm.locationId
        )
      : null;

    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Sales Management</h2>
            <p>
              Record sales and automatically reduce
              inventory
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchSales}
          >
            ↻ Refresh
          </button>
        </div>

        {saleSuccess && (
          <div className="alert alert-success">
            {saleSuccess}
          </div>
        )}

        {saleError && (
          <div className="alert alert-error">
            {saleError}
          </div>
        )}

        <section className="transaction-card">
          <div className="section-header">
            <div>
              <h3>Create Sale</h3>
              <p>
                Stock will automatically be reduced
                from the selected location.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSale}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer</label>

                <select
                  name="customerId"
                  value={saleForm.customerId}
                  onChange={handleSaleFormChange}
                >
                  <option value="">
                    Walk-in Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Invoice Number *</label>

                <input
                  name="invoiceNumber"
                  value={saleForm.invoiceNumber}
                  onChange={handleSaleFormChange}
                  placeholder="SALE-001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Product *</label>

                <select
                  name="productId"
                  value={saleForm.productId}
                  onChange={handleSaleFormChange}
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} -{" "}
                      {product.partNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Location *</label>

                <select
                  name="locationId"
                  value={saleForm.locationId}
                  onChange={handleSaleFormChange}
                  required
                >
                  <option value="">
                    Select location
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={saleForm.quantity}
                  onChange={handleSaleFormChange}
                  placeholder="1"
                  required
                />

                {selectedStock !== null && (
                  <small>
                    Available stock:{" "}
                    <strong>
                      {selectedStock}
                    </strong>
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Selling Price *</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="sellingPrice"
                  value={saleForm.sellingPrice}
                  onChange={handleSaleFormChange}
                  placeholder="500"
                  required
                />
              </div>
            </div>

            <div className="transaction-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetSaleForm}
              >
                Clear
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={savingSale}
              >
                {savingSale
                  ? "Saving..."
                  : "Create Sale"}
              </button>
            </div>
          </form>
        </section>

        <section className="history-section">
          <div className="section-header">
            <div>
              <h3>Sales History</h3>
              <p>
                {sales.length} sales record(s)
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-table"
                    >
                      No sales records found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>

                      <td>
                        {sale.invoiceNumber ||
                          sale.invoiceNo ||
                          "-"}
                      </td>

                      <td>
                        {sale.customer?.name ||
                          sale.customerId ||
                          "Walk-in"}
                      </td>

                      <td>
                        {sale.createdAt
                          ? new Date(
                              sale.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          sale.totalAmount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        <span className="status-badge">
                          {sale.status ||
                            "COMPLETED"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================
  // SUPPLIERS PAGE
  // =========================================================
  function SuppliersPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Supplier Management</h2>
            <p>
              Manage suppliers for your automobile
              shop
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="secondary-button"
              onClick={fetchSuppliers}
            >
              ↻ Refresh
            </button>

            <button
              className="primary-button"
              onClick={handleAddSupplier}
            >
              + Add Supplier
            </button>
          </div>
        </div>

        {supplierFormSuccess && (
          <div className="alert alert-success">
            {supplierFormSuccess}
          </div>
        )}

        {supplierFormError && (
          <div className="alert alert-error">
            {supplierFormError}
          </div>
        )}

        <section className="management-card">
          <div className="section-header">
            <div>
              <h3>Suppliers</h3>
              <p>
                {suppliers.length} supplier(s)
                registered
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Purchases</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-table"
                    >
                      No suppliers found. Click
                      "Add Supplier" to create one.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.id}</td>

                      <td>
                        <strong>
                          {supplier.name}
                        </strong>
                      </td>

                      <td>
                        {supplier.phone || "-"}
                      </td>

                      <td>
                        {supplier.email || "-"}
                      </td>

                      <td>
                        {supplier.address || "-"}
                      </td>

                      <td>
                        <span className="count-badge">
                          {Array.isArray(
                            supplier.purchases
                          )
                            ? supplier.purchases.length
                            : 0}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEditSupplier(
                                supplier
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteSupplier(
                                supplier.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showSupplierForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3>
                    {editingSupplierId !== null
                      ? "Edit Supplier"
                      : "Add Supplier"}
                  </h3>

                  <p>
                    Enter supplier contact
                    information
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={handleCancelSupplierForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveSupplier}>
                <div className="form-grid">
                  <div className="form-group full-span">
                    <label>Supplier Name *</label>

                    <input
                      name="name"
                      value={supplierForm.name}
                      onChange={
                        handleSupplierFormChange
                      }
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>

                    <input
                      name="phone"
                      value={supplierForm.phone}
                      onChange={
                        handleSupplierFormChange
                      }
                      placeholder="9876543210"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      value={supplierForm.email}
                      onChange={
                        handleSupplierFormChange
                      }
                      placeholder="supplier@example.com"
                    />
                  </div>

                  <div className="form-group full-span">
                    <label>Address</label>

                    <textarea
                      name="address"
                      value={supplierForm.address}
                      onChange={
                        handleSupplierFormChange
                      }
                      placeholder="Supplier address"
                      rows="3"
                    />
                  </div>
                </div>

                {supplierFormError && (
                  <div className="alert alert-error">
                    {supplierFormError}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      handleCancelSupplierForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingSupplier}
                  >
                    {savingSupplier
                      ? "Saving..."
                      : editingSupplierId !== null
                      ? "Update Supplier"
                      : "Save Supplier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // CUSTOMERS PAGE
  // =========================================================
  function CustomersPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Customer Management</h2>
            <p>
              Manage customers for your automobile
              shop
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="secondary-button"
              onClick={fetchCustomers}
            >
              ↻ Refresh
            </button>

            <button
              className="primary-button"
              onClick={handleAddCustomer}
            >
              + Add Customer
            </button>
          </div>
        </div>

        {customerFormSuccess && (
          <div className="alert alert-success">
            {customerFormSuccess}
          </div>
        )}

        {customerFormError && (
          <div className="alert alert-error">
            {customerFormError}
          </div>
        )}

        <section className="management-card">
          <div className="section-header">
            <div>
              <h3>Customers</h3>
              <p>
                {customers.length} customer(s)
                registered
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Sales</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-table"
                    >
                      No customers found. Click
                      "Add Customer" to create one.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>

                      <td>
                        <strong>
                          {customer.name}
                        </strong>
                      </td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {customer.email || "-"}
                      </td>

                      <td>
                        {customer.address || "-"}
                      </td>

                      <td>
                        <span className="count-badge">
                          {Array.isArray(
                            customer.sales
                          )
                            ? customer.sales.length
                            : 0}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEditCustomer(
                                customer
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteCustomer(
                                customer.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3>
                    {editingCustomerId !== null
                      ? "Edit Customer"
                      : "Add Customer"}
                  </h3>

                  <p>
                    Enter customer contact
                    information
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={handleCancelCustomerForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveCustomer}>
                <div className="form-grid">
                  <div className="form-group full-span">
                    <label>Customer Name *</label>

                    <input
                      name="name"
                      value={customerForm.name}
                      onChange={
                        handleCustomerFormChange
                      }
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>

                    <input
                      name="phone"
                      value={customerForm.phone}
                      onChange={
                        handleCustomerFormChange
                      }
                      placeholder="9876543210"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      value={customerForm.email}
                      onChange={
                        handleCustomerFormChange
                      }
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="form-group full-span">
                    <label>Address</label>

                    <textarea
                      name="address"
                      value={customerForm.address}
                      onChange={
                        handleCustomerFormChange
                      }
                      placeholder="Customer address"
                      rows="3"
                    />
                  </div>
                </div>

                {customerFormError && (
                  <div className="alert alert-error">
                    {customerFormError}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      handleCancelCustomerForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingCustomer}
                  >
                    {savingCustomer
                      ? "Saving..."
                      : editingCustomerId !== null
                      ? "Update Customer"
                      : "Save Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // MAIN APP
  // =========================================================
  return (
    <div className="app">
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo">SV</div>

          <div>
            <h1>Sri Vengamamba</h1>
            <span>
              Oils & Automobiles
            </span>
          </div>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>
              {user?.role || "ADMIN"}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="navigation">
        <button
          className={
            activePage === "dashboard"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={
            activePage === "purchases"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("purchases")
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
          onClick={() => setActivePage("sales")}
        >
          Sales
        </button>

        <button
          className={
            activePage === "suppliers"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("suppliers")
          }
        >
          Suppliers
        </button>

        <button
          className={
            activePage === "customers"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("customers")
          }
        >
          Customers
        </button>
      </nav>

      <main className="main-content">
        {activePage === "dashboard" && (
          <DashboardPage />
        )}

        {activePage === "purchases" && (
          <PurchasesPage />
        )}

        {activePage === "sales" && (
          <SalesPage />
        )}

        {activePage === "suppliers" && (
          <SuppliersPage />
        )}

        {activePage === "customers" && (
          <CustomersPage />
        )}
      </main>

      <footer className="app-footer">
        Sri Vengamamba Oils & Automobiles
        <span>•</span>
        Inventory Management System
      </footer>
    </div>
  );
}

export default App;