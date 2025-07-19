import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [old_password, setOldPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    API.put("users/change-password/", { old_password, new_password })
      .then(res => {
        alert("Password changed successfully!");
        navigate("/profile");
      })
      .catch(err => {
        alert("Error: " + (err.response?.data?.old_password?.[0] || "Could not change password"));
      });
  }

  return (
    <div className="container mt-4" style={{maxWidth: 400}}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input className="form-control" type="password" placeholder="Old Password" value={old_password} onChange={e => setOldPassword(e.target.value)} />
        </div>
        <div className="mb-2">
          <input className="form-control" type="password" placeholder="New Password" value={new_password} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <button className="btn btn-warning w-100" type="submit">Update Password</button>
      </form>
    </div>
  );
}
