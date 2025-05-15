import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from 'react-modal';
import './calendar.css';
import { fetchReminders, createReminder, deleteReminder } from '../../api/reminder';

Modal.setAppElement('#root');

const Calendar = () => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today); 
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReminders, setModalReminders] = useState([]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const mapRemindersToCalendar = useCallback(
    (data) => {
      setCalendarDays((prev) =>
        prev.map((day) => {
          if (day.isEmpty) return day;
          const matched = data.filter((r) => {
            const date = new Date(r.schedule_date);
            return (
              date.getDate() === day.day &&
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear()
            );
          });
          return { ...day, hasReminder: matched.length > 0, reminders: matched };
        })
      );
    },
    [currentDate]
  );

  const loadReminders = useCallback(
    async () => {
      const token = localStorage.getItem('token');
      const studentId = parseToken(token);
      if (!studentId) return alert('⚠️ Bạn cần đăng nhập!');

      console.log(`Loading reminders for studentId: ${studentId}`);
      try {
        const data = await fetchReminders(studentId, currentDate.getMonth(), currentDate.getFullYear());
        console.log('Fetched reminders:', data);
        mapRemindersToCalendar(data);
      } catch (error) {
        console.error('Lỗi khi tải ghi chú:', error);
      }
    },
    [currentDate, mapRemindersToCalendar]
  );

  useEffect(() => {
    const generateCalendar = () => {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      let days = [];

      for (let i = 0; i < firstDay; i++) days.push({ day: '', isEmpty: true });
      for (let day = 1; day <= totalDays; day++) {
        const isToday =
          day === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear();
        days.push({ day, isEmpty: false, isToday, hasReminder: false, reminders: [] });
      }

      setCalendarDays(days);
    };

    generateCalendar();
    loadReminders();
  }, [currentDate, loadReminders, today]);

  const parseToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Parsed token payload:', payload);
      return payload?.id || null;
    } catch {
      console.error('Failed to parse token');
      return null;
    }
  };

  // Hàm chuyển tháng trước
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Hàm chuyển tháng sau
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    if (day.isEmpty) return;
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);

    if (day.hasReminder) {
      console.log('Opening modal with reminders:', day.reminders);
      setModalReminders(day.reminders);
      setIsModalOpen(true);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    const token = localStorage.getItem('token');
    const studentId = parseToken(token);
    if (!studentId) return alert('⚠️ Bạn chưa đăng nhập!');

    if (!window.confirm('Bạn có chắc muốn xóa ghi chú này?')) return;

    console.log(`Attempting to delete reminder id: ${reminderId}, studentId: ${studentId}`);
    try {
      await deleteReminder(reminderId, studentId);
      await loadReminders();
      setIsModalOpen(false);
      alert('Ghi chú đã được xóa!');
    } catch (error) {
      console.error('Error in handleDeleteReminder:', error);
      alert('Không thể xóa ghi chú, vui lòng thử lại!');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedDate || !noteInput.trim()) return alert(' Vui lòng chọn ngày và nhập ghi chú.');

    const token = localStorage.getItem('token');
    const studentId = parseToken(token);
    if (!studentId) return alert(' Bạn chưa đăng nhập!');

    const reminder = { student_id: studentId, schedule_date: selectedDate, note: noteInput };
    console.log('Saving reminder:', reminder);
    try {
      await createReminder(reminder);
      await loadReminders();
      setNoteInput('');
      setSelectedDate('');
      alert('Ghi chú đã lưu thành công!');
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Không thể lưu ghi chú, vui lòng thử lại!');
    }
  };

  return (
    <div className="calendar-main">
      <h2>Lịch</h2>
      <div className="month-navigation">
        <button className="nav-button" onClick={handlePrevMonth}>
          &larr; 
        </button>
        <div id="month-year">{`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</div>
        <button className="nav-button" onClick={handleNextMonth}>
         &rarr;
        </button>
      </div>

      <div className="weekdays">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`day ${day.isEmpty ? 'empty' : ''} ${day.isToday ? 'today' : ''} ${day.hasReminder ? 'has-reminder' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            {day.day}
            {day.hasReminder && <div className="note"><span className="note-icon">📌</span></div>}
          </div>
        ))}
      </div>

      <div className="note-section">
        <h3>Quản lý Ghi chú</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <textarea
          placeholder="Nhập ghi chú..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
        />
        <button id='main_button' onClick={handleSaveNote}>Lưu Ghi Chú</button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '100%',
            padding: '20px',
          },
        }}
      >
        <h3>Ghi chú ngày {selectedDate}</h3>
        {modalReminders.length > 0 ? (
          modalReminders.map((r, i) => (
            <div key={r.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <span>{`${i + 1}. ${r.note}`}</span>
              <button
                onClick={() => handleDeleteReminder(r.id)}
                style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Xóa
              </button>
            </div>
          ))
        ) : (
          <p>Không có ghi chú.</p>
        )}
        <button
          onClick={() => setIsModalOpen(false)}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Đóng
        </button>
      </Modal>
    </div>
  );
};

export default Calendar;