import React, { useState } from 'react';
import Calendar from '../components/Calendar/calendar';
import GeneralNotice from '../components/GeneralNotice/generalNotice';
import UserList from '../components/UserList/userList';
import './dashboard.css';


function Dashboard() {
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);

  const toggleStatus = () => {
    setIsStatusExpanded(!isStatusExpanded);
  };

  return (
        <div className="dashboard">
        <div className="calendar-container">
          <Calendar />
        </div>
        <div className="notice-container">
          <GeneralNotice expanded={!isStatusExpanded} /> 
        </div>
        <div className="userlist-container">
          <UserList expanded={isStatusExpanded} onToggle={toggleStatus} />
        </div>
      </div>
  

  );
}

export default Dashboard;
