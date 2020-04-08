import React from "react";
import ReactRouterDOM from "react-router-dom";
import ListUsers from "../containers/ListUsers";

export default function users() {
  return (
    <div>
      <h1>Users</h1>
      <ListUsers />
    </div>
  );
}
