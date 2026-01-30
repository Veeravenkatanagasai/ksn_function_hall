import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import "./Gallery.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GalleryUpload = () => {

  const [bookingId, setBookingId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stage, setStage] = useState("");
  const [files, setFiles] = useState([]);
  const [gallery, setGallery] = useState({});

  /* FETCH CLOSED BOOKINGS */
  useEffect(() => {
    api.get("/gallery/closed")
      .then(res => setBookings(res.data));
  }, []);

  /* FETCH GALLERY */
  useEffect(() => {
    if (bookingId) fetchGallery();
  }, [bookingId]);

  const fetchGallery = async () => {
    const res = await api.get(`/gallery/stagewise/${bookingId}`);
    setGallery(res.data);
  };

  /* UPLOAD IMAGES */
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
    fetchGallery();
  };

  return (
    <div className="gallery-card">

      {/* HEADER */}
      <div className="gallery-header">
        <h4>Function Gallery</h4>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Back to Dashboard
        </button>
      </div>

      {/* CONTROLS */}
      <select onChange={e => setBookingId(e.target.value)}>
        <option value="">Select Closed Booking</option>
        {bookings.map(b => (
          <option key={b.booking_id} value={b.booking_id}>
            Booking #{b.booking_id}
          </option>
        ))}
      </select>

      <select disabled={!bookingId} onChange={e => setStage(e.target.value)}>
        <option value="">Select Stage</option>
        <option value="PREFUNCTION">Pre Function</option>
        <option value="FUNCTION">Function</option>
        <option value="POSTFUNCTION">Post Function</option>
      </select>

      <input
        type="file"
        multiple
        disabled={!stage}
        onChange={e => setFiles(e.target.files)}
      />

      <button onClick={uploadImages}>Upload Images</button>

      {/* GALLERY VIEW */}
      {Object.keys(gallery).length > 0 && (
        <div className="gallery-view">
          {["PREFUNCTION", "FUNCTION", "POSTFUNCTION"].map(stageKey => (
            <div key={stageKey}>
              <h5>{stageKey}</h5>

              <div className="gallery-grid">
                {gallery[stageKey]?.map(img => (
                  <div key={img.gallery_id} className="gallery-item">

                    <img
                     src={`${BASE_URL}/uploads/gallery/${img.image_path}`}
                      alt={stageKey}
                      onClick={() =>
                        window.open(
                        `${BASE_URL}/uploads/gallery/${img.image_path}`,
                        "_blank"
                      )
                      }
                    />

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GalleryUpload;
