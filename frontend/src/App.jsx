import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
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
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);

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

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("");

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
  // PURCHASES
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
  // INVENTORY - DAY 16
  // =========================================================

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryLocationFilter, setInventoryLocationFilter] =
    useState("");
  const [inventoryLowStockOnly, setInventoryLowStockOnly] =
    useState(false);

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const [savingTransfer, setSavingTransfer] = useState(false);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const [inventoryActionError, setInventoryActionError] = useState("");
  const [inventoryActionSuccess, setInventoryActionSuccess] = useState("");

  const [transferForm, setTransferForm] = useState({
    productId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: "",
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: "",
    locationId: "",
    adjustmentQuantity: "",
  });

  // =========================================================
  // REPORTS - DAY 17
  // =========================================================

  const [reports, setReports] = useState({
    dashboard: null,
    inventory: [],
    location: [],
    category: [],
    sales: null,
    purchases: null,
  });

  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const [reportInventorySearch, setReportInventorySearch] = useState("");
  const [reportLocationFilter, setReportLocationFilter] = useState("");
  const [reportCategoryFilter, setReportCategoryFilter] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("");

  const [dashboardLoading, setDashboardLoading] = useState(false);

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  function getHeaders(includeJson = false) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

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

      setProducts(
        Array.isArray(result) ? result : result.data || []
      );
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
        throw new Error(
          result.message || "Failed to fetch categories"
        );
      }

      setCategories(
        Array.isArray(result) ? result : result.data || []
      );
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

      setBrands(
        Array.isArray(result) ? result : result.data || []
      );
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
        throw new Error(
          result.message || "Failed to fetch locations"
        );
      }

      setLocations(
        Array.isArray(result) ? result : result.data || []
      );
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
        throw new Error(
          result.message || "Failed to fetch suppliers"
        );
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
        throw new Error(
          result.message || "Failed to fetch customers"
        );
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
        throw new Error(
          result.message || "Failed to fetch purchases"
        );
      }

      setPurchases(
        Array.isArray(result) ? result : result.data || []
      );
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

      setSales(
        Array.isArray(result) ? result : result.data || []
      );
    } catch (error) {
      console.error("Fetch sales error:", error);
    }
  }

  // =========================================================
  // FETCH INVENTORY
  // =========================================================

  async function fetchInventory() {
    try {
      setInventoryLoading(true);
      setInventoryError("");

      const response = await fetch(`${API_URL}/api/inventory`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to fetch inventory"
        );
      }

      setInventory(
        Array.isArray(result) ? result : result.data || []
      );
    } catch (error) {
      console.error("Fetch inventory error:", error);

      setInventoryError(
        error.message || "Unable to load inventory"
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  // =========================================================
  // FETCH REPORTS
  // =========================================================

  async function fetchReports() {
    try {
      setReportsLoading(true);
      setReportsError("");

      const [
        dashboardResponse,
        inventoryResponse,
        locationResponse,
        categoryResponse,
        salesResponse,
        purchasesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/reports/dashboard`, {
          headers: getHeaders(),
        }),
        fetch(`${API_URL}/api/reports/inventory`, {
          headers: getHeaders(),
        }),
        fetch(`${API_URL}/api/reports/location`, {
          headers: getHeaders(),
        }),
        fetch(`${API_URL}/api/reports/category`, {
          headers: getHeaders(),
        }),
        fetch(`${API_URL}/api/reports/sales`, {
          headers: getHeaders(),
        }),
        fetch(`${API_URL}/api/reports/purchases`, {
          headers: getHeaders(),
        }),
      ]);

      const dashboardResult = await dashboardResponse.json();
      const inventoryResult = await inventoryResponse.json();
      const locationResult = await locationResponse.json();
      const categoryResult = await categoryResponse.json();
      const salesResult = await salesResponse.json();
      const purchasesResult = await purchasesResponse.json();

      if (!dashboardResponse.ok || !dashboardResult.success) {
        throw new Error(
          dashboardResult.message ||
            "Failed to fetch dashboard report"
        );
      }

      if (!inventoryResponse.ok || !inventoryResult.success) {
        throw new Error(
          inventoryResult.message ||
            "Failed to fetch inventory report"
        );
      }

      if (!locationResponse.ok || !locationResult.success) {
        throw new Error(
          locationResult.message ||
            "Failed to fetch location report"
        );
      }

      if (!categoryResponse.ok || !categoryResult.success) {
        throw new Error(
          categoryResult.message ||
            "Failed to fetch category report"
        );
      }

      if (!salesResponse.ok || !salesResult.success) {
        throw new Error(
          salesResult.message ||
            "Failed to fetch sales report"
        );
      }

      if (!purchasesResponse.ok || !purchasesResult.success) {
        throw new Error(
          purchasesResult.message ||
            "Failed to fetch purchase report"
        );
      }

      setReports({
        dashboard: dashboardResult.data,
        inventory: inventoryResult.data || [],
        location: locationResult.data || [],
        category: categoryResult.data || [],
        sales: salesResult.data,
        purchases: purchasesResult.data,
      });
    } catch (error) {
      console.error("Fetch reports error:", error);

      setReportsError(
        error.message || "Unable to load reports"
      );
    } finally {
      setReportsLoading(false);
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!token) {
      return;
    }

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
        fetchInventory(),
        fetchReports(),
      ]);

      setDashboardLoading(false);
    }

    loadAllData();
  }, [token]);

  // =========================================================
  // REFRESH REPORTS WHEN REPORT PAGE OPENS
  // =========================================================

  useEffect(() => {
    if (token && activePage === "reports") {
      fetchReports();
    }
  }, [activePage, token]);

  // =========================================================
  // PRODUCT FUNCTIONS
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

      if (
        productForm.mrp === "" ||
        Number(productForm.mrp) < 0
      ) {
        throw new Error("Enter a valid MRP");
      }

      if (
        productForm.sellingPrice === "" ||
        Number(productForm.sellingPrice) < 0
      ) {
        throw new Error("Enter a valid selling price");
      }

      if (!productForm.categoryId) {
        throw new Error("Please select a category");
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: productForm.name.trim(),
          partNumber: productForm.partNumber.trim() || null,
          description: productForm.description || null,
          vehicleModel: productForm.vehicleModel || null,
          mrp: Number(productForm.mrp),
          sellingPrice: Number(productForm.sellingPrice),
          minimumStock: Number(
            productForm.minimumStock || 0
          ),
          categoryId: Number(productForm.categoryId),
          brandId: productForm.brandId
            ? Number(productForm.brandId)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to create product"
        );
      }

      await Promise.all([
        fetchProducts(),
        fetchInventory(),
        fetchReports(),
      ]);

      closeProductForm();
      setProductFormSuccess(
        "Product created successfully."
      );
    } catch (error) {
      console.error("Save product error:", error);

      setProductFormError(
        error.message || "Unable to create product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  // =========================================================
  // PURCHASE FUNCTIONS
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
      purchaseDate: new Date()
        .toISOString()
        .split("T")[0],
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
        throw new Error(
          "Quantity must be greater than 0."
        );
      }

      if (
        purchaseForm.purchasePrice === "" ||
        Number(purchaseForm.purchasePrice) < 0
      ) {
        throw new Error(
          "Enter a valid purchase price."
        );
      }

      const response = await fetch(
        `${API_URL}/api/purchases`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            supplierId: Number(
              purchaseForm.supplierId
            ),
            invoiceNumber:
              purchaseForm.invoiceNumber.trim(),
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

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "Unable to create purchase"
        );
      }

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
        fetchInventory(),
        fetchReports(),
      ]);

      resetPurchaseForm();

      setPurchaseSuccess(
        "Purchase created successfully."
      );
    } catch (error) {
      console.error(
        "Save purchase error:",
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

  // =========================================================
  // SALES FUNCTIONS
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

  function getInventoryQuantity(
    productId,
    locationId
  ) {
    const item = inventory.find(
      (inventoryItem) =>
        Number(inventoryItem.productId) ===
          Number(productId) &&
        Number(inventoryItem.locationId) ===
          Number(locationId)
    );

    return item
      ? Number(item.quantity || 0)
      : 0;
  }

  async function handleSaveSale(event) {
    event.preventDefault();

    setSaleError("");
    setSaleSuccess("");
    setSavingSale(true);

    try {
      if (!saleForm.invoiceNumber.trim()) {
        throw new Error(
          "Invoice number is required."
        );
      }

      if (!saleForm.productId) {
        throw new Error(
          "Please select a product."
        );
      }

      if (!saleForm.locationId) {
        throw new Error(
          "Please select a location."
        );
      }

      if (
        !saleForm.quantity ||
        Number(saleForm.quantity) <= 0
      ) {
        throw new Error(
          "Quantity must be greater than 0."
        );
      }

      if (
        saleForm.sellingPrice === "" ||
        Number(saleForm.sellingPrice) < 0
      ) {
        throw new Error(
          "Enter a valid selling price."
        );
      }

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
          `Only ${availableStock} units are available at this location.`
        );
      }

      const response = await fetch(
        `${API_URL}/api/sales`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            customerId:
              saleForm.customerId
                ? Number(saleForm.customerId)
                : null,
            invoiceNumber:
              saleForm.invoiceNumber.trim(),
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

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to create sale"
        );
      }

      await Promise.all([
        fetchSales(),
        fetchProducts(),
        fetchInventory(),
        fetchReports(),
      ]);

      resetSaleForm();

      setSaleSuccess(
        "Sale created successfully."
      );
    } catch (error) {
      console.error(
        "Save sale error:",
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

  // =========================================================
  // SUPPLIER FUNCTIONS
  // =========================================================

  function handleSupplierFormChange(event) {
    const { name, value } = event.target;

    setSupplierForm((previous) => ({
      ...previous,
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
        throw new Error(
          "Supplier name is required."
        );
      }

      const editing =
        editingSupplierId !== null;

      const url = editing
        ? `${API_URL}/api/suppliers/${editingSupplierId}`
        : `${API_URL}/api/suppliers`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
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
          result.message ||
            "Unable to save supplier"
        );
      }

      await Promise.all([
        fetchSuppliers(),
        fetchReports(),
      ]);

      setShowSupplierForm(false);
      resetSupplierForm();

      setSupplierFormSuccess(
        editing
          ? "Supplier updated successfully."
          : "Supplier created successfully."
      );
    } catch (error) {
      console.error(
        "Save supplier error:",
        error
      );

      setSupplierFormError(
        error.message ||
          "Unable to save supplier."
      );
    } finally {
      setSavingSupplier(false);
    }
  }

  async function handleDeleteSupplier(
    supplierId
  ) {
    if (
      !window.confirm(
        "Are you sure you want to delete this supplier?"
      )
    ) {
      return;
    }

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
          result.message ||
            "Unable to delete supplier"
        );
      }

      await fetchSuppliers();

      setSupplierFormSuccess(
        "Supplier deleted successfully."
      );
    } catch (error) {
      setSupplierFormError(
        error.message ||
          "Unable to delete supplier."
      );
    }
  }

  // =========================================================
  // CUSTOMER FUNCTIONS
  // =========================================================

  function handleCustomerFormChange(event) {
    const { name, value } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
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
        throw new Error(
          "Customer name is required."
        );
      }

      const editing =
        editingCustomerId !== null;

      const url = editing
        ? `${API_URL}/api/customers/${editingCustomerId}`
        : `${API_URL}/api/customers`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
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
          result.message ||
            "Unable to save customer"
        );
      }

      await fetchCustomers();

      setShowCustomerForm(false);
      resetCustomerForm();

      setCustomerFormSuccess(
        editing
          ? "Customer updated successfully."
          : "Customer created successfully."
      );
    } catch (error) {
      console.error(
        "Save customer error:",
        error
      );

      setCustomerFormError(
        error.message ||
          "Unable to save customer."
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleDeleteCustomer(
    customerId
  ) {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer?"
      )
    ) {
      return;
    }

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
          result.message ||
            "Unable to delete customer"
        );
      }

      await fetchCustomers();

      setCustomerFormSuccess(
        "Customer deleted successfully."
      );
    } catch (error) {
      setCustomerFormError(
        error.message ||
          "Unable to delete customer."
      );
    }
  }

  // =========================================================
  // PRODUCT FILTER
  // =========================================================

  const filteredProducts = useMemo(() => {
    const search =
      productSearch.toLowerCase().trim();

    return products.filter((product) => {
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
        Number(product.brandId) ===
          Number(productBrandFilter);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand
      );
    });
  }, [
    products,
    productSearch,
    productCategoryFilter,
    productBrandFilter,
  ]);

  // =========================================================
  // STOCK CALCULATIONS
  // =========================================================

  function getProductStock(product) {
    const inventories =
      product.inventories ||
      product.inventory ||
      [];

    if (!Array.isArray(inventories)) {
      return Number(
        product.quantity || 0
      );
    }

    return inventories.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + getProductStock(product),
    0
  );

  const lowStockProducts =
    products.filter(
      (product) =>
        getProductStock(product) <=
        Number(product.minimumStock || 0)
    );

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      getProductStock(product) *
        Number(product.sellingPrice || 0),
    0
  );

  // =========================================================
  // INVENTORY FILTERING
  // =========================================================

  const filteredInventory = useMemo(() => {
    const search =
      inventorySearch.toLowerCase().trim();

    return inventory.filter((item) => {
      const product = item.product || {};
      const location = item.location || {};

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
          .includes(search) ||
        String(location.name || "")
          .toLowerCase()
          .includes(search);

      const matchesLocation =
        !inventoryLocationFilter ||
        Number(item.locationId) ===
          Number(inventoryLocationFilter);

      const matchesLowStock =
        !inventoryLowStockOnly ||
        Number(item.quantity || 0) <=
          Number(product.minimumStock || 0);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesLowStock
      );
    });
  }, [
    inventory,
    inventorySearch,
    inventoryLocationFilter,
    inventoryLowStockOnly,
  ]);

  const inventoryTotalStock =
    inventory.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  const inventoryLowStockCount =
    inventory.filter(
      (item) =>
        Number(item.quantity || 0) <=
        Number(
          item.product?.minimumStock || 0
        )
    ).length;

  const inventoryLocationsUsed =
    new Set(
      inventory.map(
        (item) => item.locationId
      )
    ).size;

  // =========================================================
  // TRANSFER STOCK
  // =========================================================

  function handleTransferFormChange(event) {
    const { name, value } = event.target;

    setTransferForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetTransferForm() {
    setTransferForm({
      productId: "",
      fromLocationId: "",
      toLocationId: "",
      quantity: "",
    });
  }

  function openTransferForm() {
    resetTransferForm();
    setInventoryActionError("");
    setInventoryActionSuccess("");
    setShowTransferForm(true);
  }

  function closeTransferForm() {
    setShowTransferForm(false);
    resetTransferForm();
  }

  async function handleTransferStock(event) {
    event.preventDefault();

    setSavingTransfer(true);
    setInventoryActionError("");
    setInventoryActionSuccess("");

    try {
      if (!transferForm.productId) {
        throw new Error(
          "Please select a product."
        );
      }

      if (!transferForm.fromLocationId) {
        throw new Error(
          "Please select the source location."
        );
      }

      if (!transferForm.toLocationId) {
        throw new Error(
          "Please select the destination location."
        );
      }

      if (
        transferForm.fromLocationId ===
        transferForm.toLocationId
      ) {
        throw new Error(
          "Source and destination locations must be different."
        );
      }

      if (
        !transferForm.quantity ||
        Number(transferForm.quantity) <= 0
      ) {
        throw new Error(
          "Transfer quantity must be greater than 0."
        );
      }

      const response = await fetch(
        `${API_URL}/api/inventory/transfer`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            productId: Number(
              transferForm.productId
            ),
            fromLocationId: Number(
              transferForm.fromLocationId
            ),
            toLocationId: Number(
              transferForm.toLocationId
            ),
            quantity: Number(
              transferForm.quantity
            ),
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to transfer stock"
        );
      }

      await Promise.all([
        fetchInventory(),
        fetchProducts(),
        fetchReports(),
      ]);

      closeTransferForm();

      setInventoryActionSuccess(
        "Stock transferred successfully."
      );
    } catch (error) {
      console.error(
        "Transfer stock error:",
        error
      );

      setInventoryActionError(
        error.message ||
          "Unable to transfer stock."
      );
    } finally {
      setSavingTransfer(false);
    }
  }

  // =========================================================
  // ADJUST STOCK
  // =========================================================

  function handleAdjustmentFormChange(event) {
    const { name, value } = event.target;

    setAdjustmentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetAdjustmentForm() {
    setAdjustmentForm({
      productId: "",
      locationId: "",
      adjustmentQuantity: "",
    });
  }

  function openAdjustmentForm() {
    resetAdjustmentForm();
    setInventoryActionError("");
    setInventoryActionSuccess("");
    setShowAdjustmentForm(true);
  }

  function closeAdjustmentForm() {
    setShowAdjustmentForm(false);
    resetAdjustmentForm();
  }

  async function handleAdjustStock(event) {
    event.preventDefault();

    setSavingAdjustment(true);
    setInventoryActionError("");
    setInventoryActionSuccess("");

    try {
      if (!adjustmentForm.productId) {
        throw new Error(
          "Please select a product."
        );
      }

      if (!adjustmentForm.locationId) {
        throw new Error(
          "Please select a location."
        );
      }

      if (
        !adjustmentForm.adjustmentQuantity ||
        Number(
          adjustmentForm.adjustmentQuantity
        ) === 0
      ) {
        throw new Error(
          "Adjustment quantity must be a non-zero number."
        );
      }

      const response = await fetch(
        `${API_URL}/api/inventory/adjust`,
        {
          method: "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            productId: Number(
              adjustmentForm.productId
            ),
            locationId: Number(
              adjustmentForm.locationId
            ),
            adjustmentQuantity: Number(
              adjustmentForm.adjustmentQuantity
            ),
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Unable to adjust stock"
        );
      }

      await Promise.all([
        fetchInventory(),
        fetchProducts(),
        fetchReports(),
      ]);

      closeAdjustmentForm();

      setInventoryActionSuccess(
        "Stock adjusted successfully."
      );
    } catch (error) {
      console.error(
        "Adjust stock error:",
        error
      );

      setInventoryActionError(
        error.message ||
          "Unable to adjust stock."
      );
    } finally {
      setSavingAdjustment(false);
    }
  }

  // =========================================================
  // REPORT FILTERING
  // =========================================================

  const filteredReportInventory = useMemo(() => {
    const search =
      reportInventorySearch
        .toLowerCase()
        .trim();

    return reports.inventory.filter(
      (item) => {
        const matchesSearch =
          !search ||
          String(item.productName || "")
            .toLowerCase()
            .includes(search) ||
          String(item.partNumber || "")
            .toLowerCase()
            .includes(search) ||
          String(item.location || "")
            .toLowerCase()
            .includes(search);

        const matchesLocation =
          !reportLocationFilter ||
          Number(item.locationId) ===
            Number(reportLocationFilter);

        const matchesCategory =
          !reportCategoryFilter ||
          String(item.category || "") ===
            String(reportCategoryFilter);

        const matchesStatus =
          !reportStatusFilter ||
          String(item.status || "") ===
            String(reportStatusFilter);

        return (
          matchesSearch &&
          matchesLocation &&
          matchesCategory &&
          matchesStatus
        );
      }
    );
  }, [
    reports.inventory,
    reportInventorySearch,
    reportLocationFilter,
    reportCategoryFilter,
    reportStatusFilter,
  ]);

  // =========================================================
  // DAY 18 - CHART DATA
  // =========================================================

  const salesChartData = useMemo(() => {
    return (reports.sales?.sales || [])
      .slice(0, 8)
      .reverse()
      .map((sale) => ({
        invoice:
          sale.invoiceNumber ||
          `SALE-${sale.id}`,
        amount: Number(
          sale.totalAmount || 0
        ),
      }));
  }, [reports.sales]);

  const purchaseChartData = useMemo(() => {
    return (reports.purchases?.purchases || [])
      .slice(0, 8)
      .reverse()
      .map((purchase) => ({
        invoice:
          purchase.invoiceNumber ||
          `PURCHASE-${purchase.id}`,
        amount: Number(
          purchase.totalAmount || 0
        ),
      }));
  }, [reports.purchases]);

  const categoryChartData = useMemo(() => {
    return reports.category.map(
      (category) => ({
        name: category.categoryName,
        stock: Number(
          category.totalStock || 0
        ),
      })
    );
  }, [reports.category]);

  const locationChartData = useMemo(() => {
    return reports.location.map(
      (location) => ({
        name: location.locationName,
        stock: Number(
          location.totalStock || 0
        ),
      })
    );
  }, [reports.location]);

  const dashboardLowStockItems =
    useMemo(() => {
      return reports.inventory.filter(
        (item) =>
          item.status === "LOW STOCK" ||
          item.status === "OUT OF STOCK"
      );
    }, [reports.inventory]);

  const recentSales = useMemo(() => {
    return (
      reports.sales?.sales || []
    ).slice(0, 5);
  }, [reports.sales]);

  const recentPurchases = useMemo(() => {
    return (
      reports.purchases?.purchases || []
    ).slice(0, 5);
  }, [reports.purchases]);

  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            SV
          </div>

          <h1>Sri Vengamamba</h1>

          <p className="login-subtitle">
            Oils & Automobiles
          </p>

          <p className="login-subtitle">
            Inventory Management System
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
                    email:
                      event.target.value,
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
                    password:
                      event.target.value,
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
              {loggingIn
                ? "Logging in..."
                : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD PAGE
  // =========================================================

  function DashboardPage() {
    async function refreshDashboard() {
      setDashboardLoading(true);

      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands(),
        fetchLocations(),
        fetchInventory(),
        fetchPurchases(),
        fetchSales(),
        fetchReports(),
      ]);

      setDashboardLoading(false);
    }

    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Dashboard</h2>

            <p>
              Overview of Sri Vengamamba
              inventory
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={refreshDashboard}
          >
            {dashboardLoading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {reportsError && (
          <div className="alert alert-error">
            {reportsError}
          </div>
        )}

        {productFormSuccess && (
          <div className="alert alert-success">
            {productFormSuccess}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Stock
            </span>

            <strong>
              {totalStock}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Low Stock
            </span>

            <strong>
              {lowStockProducts.length}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Inventory Value
            </span>

            <strong>
              ₹{inventoryValue.toFixed(2)}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Locations
            </span>

            <strong>
              {locations.length}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Sales
            </span>

            <strong>
              ₹
              {Number(
                reports.sales?.totalSales ||
                  0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Purchases
            </span>

            <strong>
              ₹
              {Number(
                reports.purchases
                  ?.totalPurchases || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Sales Invoices
            </span>

            <strong>
              {reports.sales
                ?.totalInvoices || 0}
            </strong>
          </div>
        </div>

        {/* =====================================================
            DAY 18 CHARTS
        ===================================================== */}

        <section className="dashboard-charts-grid">
          <div className="dashboard-chart-card">
            <h3>Sales Overview</h3>

            {salesChartData.length === 0 ? (
              <div className="empty-state">
                No sales data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={salesChartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="invoice"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Sales"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dashboard-chart-card">
            <h3>Purchase Overview</h3>

            {purchaseChartData.length ===
            0 ? (
              <div className="empty-state">
                No purchase data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={purchaseChartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="invoice"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Purchases"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dashboard-chart-card">
            <h3>Stock by Category</h3>

            {categoryChartData.length ===
            0 ? (
              <div className="empty-state">
                No category data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={categoryChartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="stock"
                    name="Stock"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dashboard-chart-card">
            <h3>Stock by Location</h3>

            {locationChartData.length ===
            0 ? (
              <div className="empty-state">
                No location data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={locationChartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="stock"
                    name="Stock"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* =====================================================
            LOW STOCK ALERTS
        ===================================================== */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>
                ⚠️ Low Stock Alerts
              </h3>

              <p>
                Products that need attention
              </p>
            </div>
          </div>

          {dashboardLowStockItems.length ===
          0 ? (
            <div className="empty-state">
              All products currently have
              sufficient stock.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Location</th>
                    <th>Current Stock</th>
                    <th>Minimum Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardLowStockItems.map(
                    (item) => (
                      <tr
                        key={`alert-${item.id}`}
                      >
                        <td>
                          <strong>
                            {
                              item.productName
                            }
                          </strong>
                        </td>

                        <td>
                          {item.location ||
                            "-"}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {
                            item.minimumStock
                          }
                        </td>

                        <td>
                          <span
                            className={
                              item.status ===
                              "OUT OF STOCK"
                                ? "status-badge status-danger"
                                : "status-badge status-warning"
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            RECENT SALES / PURCHASES
        ===================================================== */}

        <section className="recent-dashboard-grid">
          <div className="recent-dashboard-card">
            <h3>Recent Sales</h3>

            {recentSales.length ===
            0 ? (
              <div className="empty-state">
                No sales recorded yet.
              </div>
            ) : (
              <div className="recent-list">
                {recentSales.map((sale) => (
                  <div
                    className="recent-item"
                    key={`sale-${sale.id}`}
                  >
                    <div>
                      <strong>
                        {sale.invoiceNumber ||
                          `SALE-${sale.id}`}
                      </strong>

                      <span>
                        {sale.customer
                          ?.name ||
                          "Walk-in Customer"}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        sale.totalAmount ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="recent-dashboard-card">
            <h3>
              Recent Purchases
            </h3>

            {recentPurchases.length ===
            0 ? (
              <div className="empty-state">
                No purchases recorded yet.
              </div>
            ) : (
              <div className="recent-list">
                {recentPurchases.map(
                  (purchase) => (
                    <div
                      className="recent-item"
                      key={`purchase-${purchase.id}`}
                    >
                      <div>
                        <strong>
                          {purchase.invoiceNumber ||
                            `PURCHASE-${purchase.id}`}
                        </strong>

                        <span>
                          {purchase
                            .supplier
                            ?.name ||
                            "Unknown Supplier"}
                        </span>
                      </div>

                      <strong>
                        ₹
                        {Number(
                          purchase.totalAmount ||
                            0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            LOCATION CARDS
        ===================================================== */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>
                Stock by Location
              </h3>
            </div>
          </div>

          <div className="location-cards">
            {reports.location.length ===
            0 ? (
              <div className="empty-state">
                No locations found.
              </div>
            ) : (
              reports.location.map(
                (location) => (
                  <div
                    className="location-card"
                    key={location.locationId}
                  >
                    <h4>
                      {
                        location.locationName
                      }
                    </h4>

                    <p>
                      Rack:{" "}
                      {location.rack || "-"}
                    </p>

                    <p>
                      Shelf:{" "}
                      {location.shelf || "-"}
                    </p>

                    <p>
                      Section:{" "}
                      {location.section ||
                        "-"}
                    </p>

                    <strong>
                      {location.totalStock}{" "}
                      units
                    </strong>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h3>Products</h3>

              <p>
                Search and filter your
                products
              </p>
            </div>

            <button
              className="primary-button"
              onClick={
                handleAddProduct
              }
            >
              + Add Product
            </button>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              value={productSearch}
              onChange={(event) =>
                setProductSearch(
                  event.target.value
                )
              }
              placeholder="Search product, part number, vehicle..."
            />

            <select
              value={
                productCategoryFilter
              }
              onChange={(event) =>
                setProductCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All Categories
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

            <select
              value={productBrandFilter}
              onChange={(event) =>
                setProductBrandFilter(
                  event.target.value
                )
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
                {filteredProducts.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-table"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                      >
                        <td>
                          <strong>
                            {product.name}
                          </strong>
                        </td>

                        <td>
                          {product.partNumber ||
                            "-"}
                        </td>

                        <td>
                          {product.vehicleModel ||
                            "-"}
                        </td>

                        <td>
                          {product
                            .category
                            ?.name || "N/A"}
                        </td>

                        <td>
                          {product.brand
                            ?.name || "N/A"}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.mrp ||
                              0
                          ).toFixed(2)}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.sellingPrice ||
                              0
                          ).toFixed(2)}
                        </td>

                        <td>
                          {
                            getProductStock(
                              product
                            )
                          }
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            PRODUCT FORM
        ===================================================== */}

        {showProductForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add Product</h3>

              {productFormError && (
                <div className="alert alert-error">
                  {productFormError}
                </div>
              )}

              <form
                onSubmit={
                  handleSaveProduct
                }
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Product Name
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
                      MRP
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
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Selling Price
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
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Category
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
                        Select Category
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
                      Brand
                    </label>

                    <select
                      name="brandId"
                      value={
                        productForm.brandId
                      }
                      onChange={
                        handleProductFormChange
                      }
                    >
                      <option value="">
                        Select Brand
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
                </div>

                <div className="form-group">
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
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeProductForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
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
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // PURCHASE PAGE
  // =========================================================

  function PurchasesPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Purchases</h2>

            <p>
              Record stock purchases
            </p>
          </div>
        </div>

        {purchaseError && (
          <div className="alert alert-error">
            {purchaseError}
          </div>
        )}

        {purchaseSuccess && (
          <div className="alert alert-success">
            {purchaseSuccess}
          </div>
        )}

        <section className="dashboard-section">
          <h3>Create Purchase</h3>

          <form
            onSubmit={
              handleSavePurchase
            }
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Supplier</label>

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
                    Select Supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
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
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Purchase Date
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
                />
              </div>

              <div className="form-group">
                <label>Product</label>

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
                    Select Product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>

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
                    Select Location
                  </option>

                  {locations.map(
                    (location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

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
                  Purchase Price
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
                  required
                />
              </div>
            </div>

            <button
              className="primary-button"
              disabled={savingPurchase}
            >
              {savingPurchase
                ? "Saving..."
                : "Create Purchase"}
            </button>
          </form>
        </section>

        <section className="dashboard-section">
          <h3>Purchase History</h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {purchases.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-table"
                    >
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  purchases.map(
                    (purchase) => (
                      <tr
                        key={purchase.id}
                      >
                        <td>
                          {purchase.invoiceNumber ||
                            `PURCHASE-${purchase.id}`}
                        </td>

                        <td>
                          {purchase.supplier
                            ?.name || "-"}
                        </td>

                        <td>
                          {purchase.purchaseDate
                            ? new Date(
                                purchase.purchaseDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          ₹
                          {Number(
                            purchase.totalAmount ||
                              0
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )
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
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Sales</h2>

            <p>
              Record product sales
            </p>
          </div>
        </div>

        {saleError && (
          <div className="alert alert-error">
            {saleError}
          </div>
        )}

        {saleSuccess && (
          <div className="alert alert-success">
            {saleSuccess}
          </div>
        )}

        <section className="dashboard-section">
          <h3>Create Sale</h3>

          <form
            onSubmit={handleSaveSale}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Customer</label>

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
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Product</label>

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
                    Select Product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>

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
                    Select Location
                  </option>

                  {locations.map(
                    (location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

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
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Selling Price
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
                  required
                />
              </div>
            </div>

            <button
              className="primary-button"
              disabled={savingSale}
            >
              {savingSale
                ? "Saving..."
                : "Create Sale"}
            </button>
          </form>
        </section>

        <section className="dashboard-section">
          <h3>Sales History</h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-table"
                    >
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                    >
                      <td>
                        {sale.invoiceNumber ||
                          `SALE-${sale.id}`}
                      </td>

                      <td>
                        {sale.customer
                          ?.name ||
                          "Walk-in Customer"}
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
                          sale.totalAmount ||
                            0
                        ).toFixed(2)}
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
            <h2>Suppliers</h2>

            <p>
              Manage suppliers
            </p>
          </div>

          <button
            className="primary-button"
            onClick={
              handleAddSupplier
            }
          >
            + Add Supplier
          </button>
        </div>

        {supplierFormError && (
          <div className="alert alert-error">
            {supplierFormError}
          </div>
        )}

        {supplierFormSuccess && (
          <div className="alert alert-success">
            {supplierFormSuccess}
          </div>
        )}

        <section className="dashboard-section">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table"
                    >
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  suppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier.id}
                      >
                        <td>
                          {supplier.name}
                        </td>

                        <td>
                          {supplier.phone ||
                            "-"}
                        </td>

                        <td>
                          {supplier.email ||
                            "-"}
                        </td>

                        <td>
                          {supplier.address ||
                            "-"}
                        </td>

                        <td>
                          <button
                            className="secondary-button"
                            onClick={() =>
                              handleEditSupplier(
                                supplier
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              handleDeleteSupplier(
                                supplier.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showSupplierForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>
                {editingSupplierId
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h3>

              {supplierFormError && (
                <div className="alert alert-error">
                  {supplierFormError}
                </div>
              )}

              <form
                onSubmit={
                  handleSaveSupplier
                }
              >
                <div className="form-group">
                  <label>Name</label>

                  <input
                    name="name"
                    value={
                      supplierForm.name
                    }
                    onChange={
                      handleSupplierFormChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>

                  <input
                    name="phone"
                    value={
                      supplierForm.phone
                    }
                    onChange={
                      handleSupplierFormChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={
                      supplierForm.email
                    }
                    onChange={
                      handleSupplierFormChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    name="address"
                    value={
                      supplierForm.address
                    }
                    onChange={
                      handleSupplierFormChange
                    }
                  />
                </div>

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
                    disabled={
                      savingSupplier
                    }
                  >
                    {savingSupplier
                      ? "Saving..."
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
            <h2>Customers</h2>

            <p>
              Manage customers
            </p>
          </div>

          <button
            className="primary-button"
            onClick={
              handleAddCustomer
            }
          >
            + Add Customer
          </button>
        </div>

        {customerFormError && (
          <div className="alert alert-error">
            {customerFormError}
          </div>
        )}

        {customerFormSuccess && (
          <div className="alert alert-success">
            {customerFormSuccess}
          </div>
        )}

        <section className="dashboard-section">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                      >
                        <td>
                          {customer.name}
                        </td>

                        <td>
                          {customer.phone ||
                            "-"}
                        </td>

                        <td>
                          {customer.email ||
                            "-"}
                        </td>

                        <td>
                          {customer.address ||
                            "-"}
                        </td>

                        <td>
                          <button
                            className="secondary-button"
                            onClick={() =>
                              handleEditCustomer(
                                customer
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              handleDeleteCustomer(
                                customer.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>
                {editingCustomerId
                  ? "Edit Customer"
                  : "Add Customer"}
              </h3>

              {customerFormError && (
                <div className="alert alert-error">
                  {customerFormError}
                </div>
              )}

              <form
                onSubmit={
                  handleSaveCustomer
                }
              >
                <div className="form-group">
                  <label>Name</label>

                  <input
                    name="name"
                    value={
                      customerForm.name
                    }
                    onChange={
                      handleCustomerFormChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>

                  <input
                    name="phone"
                    value={
                      customerForm.phone
                    }
                    onChange={
                      handleCustomerFormChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={
                      customerForm.email
                    }
                    onChange={
                      handleCustomerFormChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    name="address"
                    value={
                      customerForm.address
                    }
                    onChange={
                      handleCustomerFormChange
                    }
                  />
                </div>

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
                    disabled={
                      savingCustomer
                    }
                  >
                    {savingCustomer
                      ? "Saving..."
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
  // INVENTORY PAGE
  // =========================================================

  function InventoryPage() {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>
              Inventory Control
            </h2>

            <p>
              Search, monitor, transfer
              and adjust stock
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="secondary-button"
              onClick={
                fetchInventory
              }
              disabled={
                inventoryLoading
              }
            >
              {inventoryLoading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              className="primary-button"
              onClick={
                openTransferForm
              }
            >
              ⇄ Transfer Stock
            </button>

            <button
              className="primary-button"
              onClick={
                openAdjustmentForm
              }
            >
              ± Adjust Stock
            </button>
          </div>
        </div>

        {inventoryActionSuccess && (
          <div className="alert alert-success">
            {
              inventoryActionSuccess
            }
          </div>
        )}

        {inventoryActionError && (
          <div className="alert alert-error">
            {inventoryActionError}
          </div>
        )}

        {inventoryError && (
          <div className="alert alert-error">
            {inventoryError}
          </div>
        )}

        <div className="inventory-summary-grid">
          <div className="inventory-summary-card">
            <span>Total Stock</span>
            <strong>
              {inventoryTotalStock}
            </strong>
          </div>

          <div className="inventory-summary-card">
            <span>Low Stock Records</span>
            <strong>
              {inventoryLowStockCount}
            </strong>
          </div>

          <div className="inventory-summary-card">
            <span>Locations Used</span>
            <strong>
              {inventoryLocationsUsed}
            </strong>
          </div>

          <div className="inventory-summary-card">
            <span>Inventory Records</span>
            <strong>
              {inventory.length}
            </strong>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="filter-bar">
            <input
              value={inventorySearch}
              onChange={(event) =>
                setInventorySearch(
                  event.target.value
                )
              }
              placeholder="Search product, part number, vehicle or location..."
            />

            <select
              value={
                inventoryLocationFilter
              }
              onChange={(event) =>
                setInventoryLocationFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All Locations
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                  </option>
                )
              )}
            </select>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={
                  inventoryLowStockOnly
                }
                onChange={(event) =>
                  setInventoryLowStockOnly(
                    event.target.checked
                  )
                }
              />

              Low Stock Only
            </label>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Part Number</th>
                  <th>Location</th>
                  <th>Rack</th>
                  <th>Shelf</th>
                  <th>Section</th>
                  <th>Quantity</th>
                  <th>Minimum</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="empty-table"
                    >
                      No inventory records
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(
                    (item) => {
                      const quantity =
                        Number(
                          item.quantity || 0
                        );

                      const minimum =
                        Number(
                          item.product
                            ?.minimumStock ||
                            0
                        );

                      const status =
                        quantity === 0
                          ? "OUT OF STOCK"
                          : quantity <=
                            minimum
                          ? "LOW STOCK"
                          : "NORMAL";

                      return (
                        <tr
                          key={item.id}
                        >
                          <td>
                            <strong>
                              {
                                item.product
                                  ?.name
                              }
                            </strong>
                          </td>

                          <td>
                            {item.product
                              ?.partNumber ||
                              "-"}
                          </td>

                          <td>
                            {
                              item.location
                                ?.name
                            }
                          </td>

                          <td>
                            {item.location
                              ?.rack || "-"}
                          </td>

                          <td>
                            {item.location
                              ?.shelf || "-"}
                          </td>

                          <td>
                            {item.location
                              ?.section ||
                              "-"}
                          </td>

                          <td>
                            {quantity}
                          </td>

                          <td>
                            {minimum}
                          </td>

                          <td>
                            <span
                              className={
                                status ===
                                "NORMAL"
                                  ? "inventory-status normal"
                                  : "inventory-status low"
                              }
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showTransferForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>
                Transfer Stock
              </h3>

              <form
                onSubmit={
                  handleTransferStock
                }
              >
                <div className="form-group">
                  <label>
                    Product
                  </label>

                  <select
                    name="productId"
                    value={
                      transferForm.productId
                    }
                    onChange={
                      handleTransferFormChange
                    }
                    required
                  >
                    <option value="">
                      Select Product
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
                    From Location
                  </label>

                  <select
                    name="fromLocationId"
                    value={
                      transferForm.fromLocationId
                    }
                    onChange={
                      handleTransferFormChange
                    }
                    required
                  >
                    <option value="">
                      Select Source
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
                    To Location
                  </label>

                  <select
                    name="toLocationId"
                    value={
                      transferForm.toLocationId
                    }
                    onChange={
                      handleTransferFormChange
                    }
                    required
                  >
                    <option value="">
                      Select Destination
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
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={
                      transferForm.quantity
                    }
                    onChange={
                      handleTransferFormChange
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeTransferForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      savingTransfer
                    }
                  >
                    {savingTransfer
                      ? "Transferring..."
                      : "Transfer Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAdjustmentForm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>
                Adjust Stock
              </h3>

              <form
                onSubmit={
                  handleAdjustStock
                }
              >
                <div className="form-group">
                  <label>
                    Product
                  </label>

                  <select
                    name="productId"
                    value={
                      adjustmentForm.productId
                    }
                    onChange={
                      handleAdjustmentFormChange
                    }
                    required
                  >
                    <option value="">
                      Select Product
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
                    Location
                  </label>

                  <select
                    name="locationId"
                    value={
                      adjustmentForm.locationId
                    }
                    onChange={
                      handleAdjustmentFormChange
                    }
                    required
                  >
                    <option value="">
                      Select Location
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
                    Adjustment Quantity
                  </label>

                  <input
                    type="number"
                    name="adjustmentQuantity"
                    value={
                      adjustmentForm.adjustmentQuantity
                    }
                    onChange={
                      handleAdjustmentFormChange
                    }
                    placeholder="Example: +10 or -5"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeAdjustmentForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      savingAdjustment
                    }
                  >
                    {savingAdjustment
                      ? "Adjusting..."
                      : "Adjust Stock"}
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
  // REPORTS PAGE - DAY 17
  // =========================================================

  function ReportsPage() {
    const dashboard =
      reports.dashboard;

    const sales =
      reports.sales || {
        totalInvoices: 0,
        totalSales: 0,
        totalItemsSold: 0,
        sales: [],
      };

    const purchaseReport =
      reports.purchases || {
        totalInvoices: 0,
        totalPurchases: 0,
        totalItemsPurchased: 0,
        purchases: [],
      };

    return (
      <div>
        <div className="page-heading">
          <div>
            <h2>Reports & Analytics</h2>

            <p>
              Business and inventory
              reports
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchReports}
            disabled={reportsLoading}
          >
            {reportsLoading
              ? "Refreshing..."
              : "↻ Refresh Reports"}
          </button>
        </div>

        {reportsError && (
          <div className="alert alert-error">
            {reportsError}
          </div>
        )}

        {reportsLoading ? (
          <div className="empty-state">
            Loading reports...
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">
                  Products
                </span>

                <strong>
                  {dashboard
                    ?.totalProducts ||
                    0}
                </strong>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Stock
                </span>

                <strong>
                  {dashboard
                    ?.totalStock || 0}
                </strong>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Low Stock
                </span>

                <strong>
                  {dashboard
                    ?.lowStock || 0}
                </strong>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Inventory Value
                </span>

                <strong>
                  ₹
                  {Number(
                    dashboard
                      ?.inventoryValue ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Total Sales
                </span>

                <strong>
                  ₹
                  {Number(
                    sales.totalSales ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Total Purchases
                </span>

                <strong>
                  ₹
                  {Number(
                    purchaseReport.totalPurchases ||
                      0
                  ).toFixed(2)}
                </strong>
              </div>
            </div>

            <section className="report-section">
              <div className="section-header">
                <div>
                  <h3>
                    Inventory Report
                  </h3>
                </div>
              </div>

              <div className="report-filters">
                <input
                  value={
                    reportInventorySearch
                  }
                  onChange={(event) =>
                    setReportInventorySearch(
                      event.target.value
                    )
                  }
                  placeholder="Search product..."
                />

                <select
                  value={
                    reportLocationFilter
                  }
                  onChange={(event) =>
                    setReportLocationFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Locations
                  </option>

                  {locations.map(
                    (location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    reportCategoryFilter
                  }
                  onChange={(event) =>
                    setReportCategoryFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={
                          category.name
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    reportStatusFilter
                  }
                  onChange={(event) =>
                    setReportStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Status
                  </option>

                  <option value="NORMAL">
                    NORMAL
                  </option>

                  <option value="LOW STOCK">
                    LOW STOCK
                  </option>

                  <option value="OUT OF STOCK">
                    OUT OF STOCK
                  </option>
                </select>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Part Number</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Location</th>
                      <th>Rack</th>
                      <th>Shelf</th>
                      <th>Quantity</th>
                      <th>Minimum</th>
                      <th>Price</th>
                      <th>Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReportInventory.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="empty-table"
                        >
                          No report records
                          found.
                        </td>
                      </tr>
                    ) : (
                      filteredReportInventory.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              <strong>
                                {
                                  item.productName
                                }
                              </strong>
                            </td>

                            <td>
                              {item.partNumber ||
                                "-"}
                            </td>

                            <td>
                              {item.category ||
                                "-"}
                            </td>

                            <td>
                              {item.brand ||
                                "-"}
                            </td>

                            <td>
                              {
                                item.location
                              }
                            </td>

                            <td>
                              {item.rack ||
                                "-"}
                            </td>

                            <td>
                              {item.shelf ||
                                "-"}
                            </td>

                            <td>
                              {
                                item.quantity
                              }
                            </td>

                            <td>
                              {
                                item.minimumStock
                              }
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.sellingPrice ||
                                  0
                              ).toFixed(2)}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.inventoryValue ||
                                  0
                              ).toFixed(2)}
                            </td>

                            <td>
                              <span
                                className={
                                  item.status ===
                                    "NORMAL"
                                    ? "inventory-status normal"
                                    : "inventory-status low"
                                }
                              >
                                {
                                  item.status
                                }
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="report-two-column">
              <section className="report-section">
                <h3>
                  Location Report
                </h3>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Products</th>
                        <th>Stock</th>
                        <th>Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.location.map(
                        (location) => (
                          <tr
                            key={
                              location.locationId
                            }
                          >
                            <td>
                              {
                                location.locationName
                              }
                            </td>

                            <td>
                              {
                                location.totalProducts
                              }
                            </td>

                            <td>
                              {
                                location.totalStock
                              }
                            </td>

                            <td>
                              ₹
                              {Number(
                                location.inventoryValue ||
                                  0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="report-section">
                <h3>
                  Category Report
                </h3>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Stock</th>
                        <th>Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.category.map(
                        (category) => (
                          <tr
                            key={
                              category.categoryId
                            }
                          >
                            <td>
                              {
                                category.categoryName
                              }
                            </td>

                            <td>
                              {
                                category.totalProducts
                              }
                            </td>

                            <td>
                              {
                                category.totalStock
                              }
                            </td>

                            <td>
                              ₹
                              {Number(
                                category.inventoryValue ||
                                  0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="report-two-column">
              <section className="report-section">
                <h3>
                  Sales Summary
                </h3>

                <div className="mini-report">
                  <div>
                    <span>
                      Total Invoices
                    </span>

                    <strong>
                      {
                        sales.totalInvoices
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Items Sold
                    </span>

                    <strong>
                      {
                        sales.totalItemsSold
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Sales
                    </span>

                    <strong>
                      ₹
                      {Number(
                        sales.totalSales ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <h3>
                  Purchase Summary
                </h3>

                <div className="mini-report">
                  <div>
                    <span>
                      Total Invoices
                    </span>

                    <strong>
                      {
                        purchaseReport.totalInvoices
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Items Purchased
                    </span>

                    <strong>
                      {
                        purchaseReport.totalItemsPurchased
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Purchases
                    </span>

                    <strong>
                      ₹
                      {Number(
                        purchaseReport.totalPurchases ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div className="app">
      {/* HEADER */}

      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo">
            SV
          </div>

          <div>
            <h1>
              Sri Vengamamba
            </h1>

            <span>
              Oils & Automobiles
            </span>
          </div>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>
              {user?.name ||
                "Admin"}
            </strong>

            <span>
              {user?.role ||
                "ADMIN"}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </div>
      </header>

      {/* NAVIGATION */}

      <nav className="navigation">
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
            "inventory"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "inventory"
            )
          }
        >
          Inventory
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
            activePage ===
            "sales"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "sales"
            )
          }
        >
          Sales
        </button>

        <button
          className={
            activePage ===
            "suppliers"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "suppliers"
            )
          }
        >
          Suppliers
        </button>

        <button
          className={
            activePage ===
            "customers"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "customers"
            )
          }
        >
          Customers
        </button>

        <button
          className={
            activePage ===
            "reports"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage(
              "reports"
            )
          }
        >
          Reports
        </button>
      </nav>

      {/* PAGE */}

      <main className="main-content">
        {activePage ===
          "dashboard" && (
          <DashboardPage />
        )}

        {activePage ===
          "inventory" && (
          <InventoryPage />
        )}

        {activePage ===
          "purchases" && (
          <PurchasesPage />
        )}

        {activePage ===
          "sales" && (
          <SalesPage />
        )}

        {activePage ===
          "suppliers" && (
          <SuppliersPage />
        )}

        {activePage ===
          "customers" && (
          <CustomersPage />
        )}

        {activePage ===
          "reports" && (
          <ReportsPage />
        )}
      </main>

      {/* FOOTER */}

      <footer className="app-footer">
        Sri Vengamamba Oils &
        Automobiles

        <span>•</span>

        Inventory Management
        System
      </footer>
    </div>
  );
}

export default App;