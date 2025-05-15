import React, { useState, useEffect } from "react";
import { createAnnouncement } from "../../api/announcement";
import "./createAnnouncementForm.css";

const CreateAnnouncementForm = ({ initialData = null, onSuccess }) => {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
    } else {
      setContent("");
      setAttachment(null);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Vui lòng nhập nội dung thông báo.");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (attachment) formData.append("attachment", attachment);

    try {
      await createAnnouncement(formData);
      alert("Thông báo đã được gửi thành công!");
      setContent("");
      setAttachment(null);
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      alert(" Gửi thông báo thất bại!");
    }
  };

  return (
    <div className="announcement-container">
      <form onSubmit={handleSubmit} className="announcement-form">
        <h1>{initialData ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}</h1>

        <div>
          <label htmlFor="content">Nội dung thông báo</label>
          <textarea
            id="content"
            placeholder="Nội dung thông báo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <label htmlFor="attachment">Tệp đính kèm</label>
          <input
            id="attachment"
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={!content.trim()}
            className="submit-button"
          >
            {initialData ? "Cập nhật thông báo" : "Gửi thông báo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncementForm;