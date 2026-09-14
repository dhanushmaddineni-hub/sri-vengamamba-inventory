import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Backend did not return a successful response");
      }

      setProducts(result.data || []);
    } catch (err) {
      console.error("Product loading error:", err);

      setError(
        "Unable to load products. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Sri Vengamamba Oils & Automobiles</h1>
          <p>Inventory Management System</p>
        </div>

        <button className="refresh-button" onClick={fetchProducts}>
          Refresh Products
        </button>
      </header>

      <main className="main-content">
        <section className="summary-card">
          <h2>Product Inventory</h2>

          <p>
            Total products: <strong>{products.length}</strong>
          </p>
        </section>

        {loading && (
          <div className="message-card">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-card">
            <h3>Connection Error</h3>
            <p>{error}</p>
            <p>
              Make sure the backend is running with{" "}
              <strong>node server.js</strong>.
            </p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="message-card">
            <p>No products found in the database.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
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
                    <th>Purchase Price</th>
                    <th>Selling Price</th>
                    <th>Minimum Stock</th>
                    <th>Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.partNumber || "N/A"}</td>
                      <td>{product.description || "N/A"}</td>
                      <td>{product.brand?.name || "N/A"}</td>
                      <td>{product.category?.name || "N/A"}</td>
                      <td>₹{product.purchasePrice}</td>
                      <td>₹{product.sellingPrice}</td>
                      <td>{product.minimumStock}</td>
                      <td>{product.unit || "N/A"}</td>
                    </tr>
                  ))}
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