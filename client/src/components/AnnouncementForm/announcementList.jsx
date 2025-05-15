import React, { useEffect, useState } from "react";
import { getAllAnnouncements, deleteAnnouncement } from "../../api/announcement";
import AnnouncementItem from "./announcementItem";
import { getSocket } from "../../socket"; 

const AnnouncementList = ({ onEdit }) => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllAnnouncements();
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách thông báo:", error);
      }
    };

    fetchData();

    const socket = getSocket(); 
    if (!socket) return;


    socket.on("announcementUpdated", (newItem) => {
      setAnnouncements((prev) => {
        const existed = prev.find((a) => a.id === newItem.id);
        if (existed) {
          return prev.map((item) => (item.id === newItem.id ? { ...item, ...newItem } : item));
        } else {
          return [newItem, ...prev];
        }
      });
    });


    socket.on("announcementDeleted", ({ id }) => {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    });

    return () => {
      socket.off("announcementUpdated");
      socket.off("announcementDeleted");
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này không?")) {
      try {
        await deleteAnnouncement(id);
      } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3"></h2>
      {announcements.map((item) => (
        <AnnouncementItem
          key={item.id}
          data={item}
          onDelete={handleDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;
