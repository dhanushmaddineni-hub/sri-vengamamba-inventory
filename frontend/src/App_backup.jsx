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

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

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