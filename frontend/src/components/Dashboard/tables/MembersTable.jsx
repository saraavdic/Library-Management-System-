import React from "react";
import '../../../styles/Dashboard.css';
import SortIcon from '../ui/SortIcon';

const MembersTable = ({ members, memberSort, handleMemberSort, onDeleteMember }) => {

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleMemberSort('name')}>
              Name <SortIcon column="name" currentSort={memberSort} />
            </th>
            <th className="sortable" onClick={() => handleMemberSort('email')}>
              Email <SortIcon column="email" currentSort={memberSort} />
            </th>
            <th className="sortable" onClick={() => handleMemberSort('joinDate')}>
              Join Date <SortIcon column="joinDate" currentSort={memberSort} />
            </th>
            <th className="sortable" onClick={() => handleMemberSort('status')}>
              Status <SortIcon column="status" currentSort={memberSort} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, i) => (
            <tr key={member.id ?? `${member.email}-${i}`}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.joinDate}</td>
              <td><span className={`status ${member.status}`}>{member.status}</span></td>
              <td>
                <button className="delete-btn" onClick={() => onDeleteMember(member.id)}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembersTable;