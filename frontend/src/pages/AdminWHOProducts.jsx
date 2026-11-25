
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  AlertCircle,
  Package,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./AdminWHOProducts.css";

const PAGE_SIZE = 25;
const BATCH_SIZE = 500;

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return value;
}

function getStatusClass(status) {
  switch (status) {
    case "verified":
      return "who-status-verified";
    case "rejected":
      return "who-status-rejected";
    default:
      return "who-status-pending";
  }
}

function AdminWHOProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let allProducts = [];
      let from = 0;

      while (true) {
        const { data, error: fetchError } = await supabase
          .from("vaccine_products")
          .select("*")
          .order("id", { ascending: false })
          .range(from, from + BATCH_SIZE - 1);

        if (fetchError) {
          throw fetchError;
        }

        const batch = data || [];
        allProducts = [...allProducts, ...batch];

        if (batch.length < BATCH_SIZE) {
          break;
        }

        from += BATCH_SIZE;
      }

      setProducts(allProducts);
    } catch (err) {
      console.error("WHO products loading error:", err);
      setError(
        err.message ||
          "Unable to load WHO vaccine products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus =
        statusFilter === "all" ||
        product.review_status === statusFilter;

      const searchableText = [
        product.vaccine_type,
        product.manufacturer,
        product.brand_name,
        product.source_name,
        product.responsible_nra,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm || searchableText.includes(searchTerm);

      return matchesStatus && matchesSearch;
    });
  }, [products, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const counts = useMemo(
    () => ({
      all: products.length,
      pending: products.filter(
        (product) => product.review_status === "pending"
      ).length,
      verified: products.filter(
        (product) => product.review_status === "verified"
      ).length,
      rejected: products.filter(
        (product) => product.review_status === "rejected"
      ).length,
    }),
    [products]
  );

  const updateReviewStatus = async (product, newStatus) => {
    if (product.review_status === newStatus) {
      return;
    }

    const actionLabel =
      newStatus === "verified" ? "verify" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this vaccine product?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(product.id);
    setError("");
    setMessage("");

    try {
      const today = new Date().toISOString().slice(0, 10);

      const { error: updateError } = await supabase
        .from("vaccine_products")
        .update({
          review_status: newStatus,
          last_reviewed_at: today,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        throw updateError;
      }

      setProducts((previousProducts) =>
        previousProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                review_status: newStatus,
                last_reviewed_at: today,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setMessage(
        `Product "${product.brand_name || product.vaccine_type}" was marked ${newStatus}.`
      );

      setExpandedId(null);
    } catch (err) {
      console.error("WHO product review update error:", err);
      setError(
        err.message ||
          "Unable to update this product. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const startIndex =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endIndex = Math.min(
    currentPage * PAGE_SIZE,
    filteredProducts.length
  );

  return (
    <div className="who-products-page">
      <div className="who-products-container">
        <div className="who-products-breadcrumb">
          <Link to="/admin">
            <ArrowLeft size={16} />
            Admin Dashboard
          </Link>

          <span>/</span>

          <Link to="/admin/vaccines">
            Vaccine Management
          </Link>

          <span>/</span>

          <span>WHO Product Review</span>
        </div>

        <div className="who-products-heading">
          <div>
            <span className="who-products-eyebrow">
              VAXCARE ADMINISTRATION
            </span>

            <h1>WHO Vaccine Products</h1>

            <p>
              Review imported vaccine product records before making
              verified information available in VaxCare.
            </p>
          </div>

          <button
            type="button"
            className="who-refresh-button"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "who-spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="who-review-notice">
          <ShieldCheck size={21} />

          <div>
            <strong>Medical data review is required</strong>
            <p>
              WHO prequalification is an indicator of WHO
              prequalification status. It does not by itself establish
              Indian regulatory approval, current availability, or
              suitability for every patient. Review the source and
              relevant references before verifying a record.
            </p>
          </div>
        </div>

        {error && (
          <div className="who-feedback who-feedback-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="who-feedback who-feedback-success">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        <div className="who-stats-grid">
          <div className="who-stat-card">
            <div className="who-stat-icon who-stat-total">
              <Package size={21} />
            </div>
            <div>
              <span>Total Products</span>
              <strong>{counts.all}</strong>
            </div>
          </div>

          <div className="who-stat-card">
            <div className="who-stat-icon who-stat-pending">
              <Clock size={21} />
            </div>
            <div>
              <span>Pending Review</span>
              <strong>{counts.pending}</strong>
            </div>
          </div>

          <div className="who-stat-card">
            <div className="who-stat-icon who-stat-verified">
              <CheckCircle size={21} />
            </div>
            <div>
              <span>Verified</span>
              <strong>{counts.verified}</strong>
            </div>
          </div>

          <div className="who-stat-card">
            <div className="who-stat-icon who-stat-rejected">
              <XCircle size={21} />
            </div>
            <div>
              <span>Rejected</span>
              <strong>{counts.rejected}</strong>
            </div>
          </div>
        </div>

        <div className="who-products-toolbar">
          <div className="who-search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search vaccine, manufacturer or brand..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="who-filter-box">
            <label htmlFor="who-status-filter">
              Review status
            </label>

            <select
              id="who-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All products</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="who-products-list-header">
          <div>
            <h2>Imported Product Catalogue</h2>
            <p>
              {filteredProducts.length} matching product
              {filteredProducts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="who-products-state">
            <RefreshCw size={27} className="who-spinning" />
            <strong>Loading vaccine products...</strong>
            <p>Please wait while the catalogue is retrieved.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="who-products-state">
            <Package size={30} />
            <strong>No products found</strong>
            <p>
              Try changing your search or review status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="who-products-table-wrapper">
              <table className="who-products-table">
                <thead>
                  <tr>
                    <th>Vaccine Type</th>
                    <th>Manufacturer</th>
                    <th>Brand Name</th>
                    <th>WHO Prequalified</th>
                    <th>Review Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map((product) => (
                    <>
                      <tr key={product.id}>
                        <td>
                          <strong>
                            {formatValue(product.vaccine_type)}
                          </strong>
                        </td>

                        <td>
                          {formatValue(product.manufacturer)}
                        </td>

                        <td>
                          {formatValue(product.brand_name)}
                        </td>

                        <td>
                          {product.who_prequalified === true ? (
                            <span className="who-yes-label">
                              Yes
                            </span>
                          ) : product.who_prequalified === false ? (
                            <span className="who-no-label">
                              No
                            </span>
                          ) : (
                            <span className="who-muted-label">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`who-status-badge ${getStatusClass(
                              product.review_status
                            )}`}
                          >
                            {product.review_status || "pending"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="who-view-button"
                            onClick={() =>
                              setExpandedId(
                                expandedId === product.id
                                  ? null
                                  : product.id
                              )
                            }
                          >
                            <Eye size={15} />
                            {expandedId === product.id
                              ? "Close"
                              : "Review"}
                          </button>
                        </td>
                      </tr>

                      {expandedId === product.id && (
                        <tr
                          key={`${product.id}-details`}
                          className="who-details-row"
                        >
                          <td colSpan="6">
                            <div className="who-product-details">
                              <div className="who-details-heading">
                                <div>
                                  <span>PRODUCT RECORD</span>
                                  <h3>
                                    {product.brand_name ||
                                      product.vaccine_type}
                                  </h3>
                                </div>

                                <span className="who-record-id">
                                  Record #{product.id}
                                </span>
                              </div>

                              <div className="who-details-grid">
                                <div>
                                  <span>Vaccine Type</span>
                                  <strong>
                                    {formatValue(product.vaccine_type)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Manufacturer</span>
                                  <strong>
                                    {formatValue(product.manufacturer)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Brand Name</span>
                                  <strong>
                                    {formatValue(product.brand_name)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Dosage Number</span>
                                  <strong>
                                    {formatValue(product.dosage_number)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Number of Doses</span>
                                  <strong>
                                    {formatValue(product.no_of_doses)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Presentation Size</span>
                                  <strong>
                                    {formatValue(product.presentation_size)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Presentation</span>
                                  <strong>
                                    {formatValue(product.presentation)}
                                  </strong>
                                </div>

                                <div>
                                  <span>WHO Prequalified</span>
                                  <strong>
                                    {product.who_prequalified === true
                                      ? "Yes"
                                      : product.who_prequalified === false
                                      ? "No"
                                      : "Not provided"}
                                  </strong>
                                </div>

                                <div>
                                  <span>Date of Prequalification</span>
                                  <strong>
                                    {formatValue(
                                      product.date_of_prequalification
                                    )}
                                  </strong>
                                </div>

                                <div>
                                  <span>Responsible NRA</span>
                                  <strong>
                                    {formatValue(product.responsible_nra)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Source Name</span>
                                  <strong>
                                    {formatValue(product.source_name)}
                                  </strong>
                                </div>

                                <div>
                                  <span>Last Reviewed</span>
                                  <strong>
                                    {formatValue(product.last_reviewed_at)}
                                  </strong>
                                </div>
                              </div>

                              {product.source_url && (
                                <a
                                  href={product.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="who-source-link"
                                >
                                  View Original Source
                                  <ExternalLink size={15} />
                                </a>
                              )}

                              <div className="who-details-actions">
                                {product.review_status !== "verified" && (
                                  <button
                                    type="button"
                                    className="who-verify-button"
                                    onClick={() =>
                                      updateReviewStatus(
                                        product,
                                        "verified"
                                      )
                                    }
                                    disabled={updatingId === product.id}
                                  >
                                    <CheckCircle size={17} />
                                    {updatingId === product.id
                                      ? "Updating..."
                                      : "Mark as Verified"}
                                  </button>
                                )}

                                {product.review_status !== "rejected" && (
                                  <button
                                    type="button"
                                    className="who-reject-button"
                                    onClick={() =>
                                      updateReviewStatus(
                                        product,
                                        "rejected"
                                      )
                                    }
                                    disabled={updatingId === product.id}
                                  >
                                    <XCircle size={17} />
                                    Reject Record
                                  </button>
                                )}
                              </div>

                              <p className="who-review-warning">
                                Only verify this record after checking
                                the original source and relevant
                                regulatory and medical references.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="who-pagination">
              <span>
                Showing {startIndex}–{endIndex} of{" "}
                {filteredProducts.length}
              </span>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <strong>
                  {currentPage} / {totalPages}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminWHOProducts;
