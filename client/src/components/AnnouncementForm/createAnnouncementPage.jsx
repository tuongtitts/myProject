import React, { useEffect, useState } from "react";
import { getAllAnnouncements } from "../../api/announcement";
import CreateAnnouncementForm from "./createAnnouncementForm";

const CreateAnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("API lỗi:", error);
      setError("Không thể tải danh sách thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);



  const handleSuccess = () => {
    fetchAnnouncements();
    setEditingAnnouncement(null);
  };

  return (
    <div className="announcement-manager flex">
      <div className="sidebar w-1/4 p-4 bg-gray-100">
        <CreateAnnouncementForm
          initialData={editingAnnouncement}
          onSuccess={handleSuccess}
        />
      </div>

      <div className="content w-3/4 p-4">
        {loading && <p>Đang tải danh sách thông báo...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && announcements.length === 0 && (
          <p>Không có thông báo nào.</p>
        )}
      </div>
    </div>
  );
};

export default CreateAnnouncementPage;
