import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaImages } from "react-icons/fa";
import api from "../../../services/api";
import "./Gallery.css";

const GalleryUpload = () => {
  const [bookingId, setBookingId] = useState(""); // Selected booking
  const [bookings, setBookings] = useState([]);   // All bookings
  const [stage, setStage] = useState("");
  const [files, setFiles] = useState([]);
  const [gallery, setGallery] = useState({});
  const [searchBookingId, setSearchBookingId] = useState(""); // Search input

  // Fetch closed bookings
  useEffect(() => {
    api.get("/gallery/closed").then(res => setBookings(res.data));
  }, []);

  // Filter bookings based on search input
  const filteredBookings = bookings.filter(b =>
    b.booking_id.toString().includes(searchBookingId)
  );

  // Fetch gallery when a booking is selected
  const fetchGallery = async (id) => {
    if (!id) return;
    const res = await api.get(`/gallery/stagewise/${id}`);
    setGallery(res.data);
  };

  const handleSearchChange = (e) => {
    setSearchBookingId(e.target.value);
    setBookingId(""); // reset selection
    setGallery({});   // hide gallery
  };

  const handleBookingSelect = (e) => {
    const id = e.target.value;
    setBookingId(id);
    fetchGallery(id); // show gallery only after selection
  };

  const uploadImages = async () => {
    if (!bookingId || !stage || files.length === 0) {
      alert("Select booking, stage & images");
      return;
    }

    const formData = new FormData();
    formData.append("stage", stage);
    [...files].forEach(file => formData.append("images", file));

    await api.post(`/gallery/upload/${bookingId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Images uploaded");
    setFiles([]);
    fetchGallery(bookingId);
  };

  return (
    <div className="gallery-wrapper">
      {/* FIXED HEADER */}
      <div className="gallery-header-fixed">
        <h4 className="page-title">
          <FaImages className="header-icon" /> Function Gallery
        </h4>
        <button className="btn btn-outline-light" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back To Dashboard
        </button>
      </div>

      {/* FORM CARD */}
      <div className="gallery-content">
        <div className="gallery-card">

          {/* SEARCH BAR */}
          <div className="booking-search-box">
            <input
              type="text"
              placeholder="🔍 Search Booking ID"
              value={searchBookingId}
              onChange={handleSearchChange}
            />
          </div>

          {/* CLOSED BOOKING */}
          <div className="form-group">
            <label>Closed Booking <span>*</span></label>
            <select value={bookingId} onChange={handleBookingSelect}>
              <option value="">Select Closed Booking</option>
              {filteredBookings.map(b => (
                <option key={b.booking_id} value={b.booking_id}>
                  Booking #{b.booking_id}
                </option>
              ))}
            </select>
          </div>

          {/* STAGE */}
          <div className="form-group">
            <label>Stage <span>*</span></label>
            <select
              value={stage}
              disabled={!bookingId}
              onChange={e => setStage(e.target.value)}
            >
              <option value="">Select Stage</option>
              <option value="PREFUNCTION">Pre Function</option>
              <option value="FUNCTION">Function</option>
              <option value="POSTFUNCTION">Post Function</option>
            </select>
          </div>

          {/* FILE UPLOAD */}
          <div className="form-group">
            <label>Upload Images <span>*</span></label>
            <input
              type="file"
              multiple
              disabled={!stage}
              onChange={e => setFiles(e.target.files)}
            />
          </div>

          <button className="upload-btn" onClick={uploadImages}>
            Upload Images
          </button>

          {/* GALLERY VIEW ONLY AFTER SELECTION */}
          {bookingId && Object.keys(gallery).length > 0 && (
            <div className="gallery-view">
              {["PREFUNCTION", "FUNCTION", "POSTFUNCTION"].map(stageKey => (
                <div key={stageKey} className="gallery-stage">
                  <h5>{stageKey}</h5>
                  <div className="gallery-grid">
                    {gallery[stageKey]?.map(img => (
                      <div key={img.gallery_id} className="gallery-item">
                        <img
                          src={img.image_path}
                          alt={stageKey}
                          onClick={() => window.open(img.image_path, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GalleryUpload;
