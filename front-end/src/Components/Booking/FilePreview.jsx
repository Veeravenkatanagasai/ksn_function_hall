import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import "./Customer.css";

const FilePreview = ({ file }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return;

    // ✅ CASE 1: Cloudinary URL (string)
    if (typeof file === "string") {
      setPreview(file);
      return;
    }

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="file-preview">
      {preview ? (
        <img src={preview} alt="preview" />
      ) : (
        <FileText size={28} />
      )}
      <div>
        <p className="file-name">{file.name}</p>
        <p className="file-size">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
};

export default FilePreview;
