import { useState } from "react";
import { RoleContext } from "./RoleContext";
import { getUser } from "../utils/api";

export const RoleProvider = ({ children }) => {
  // Restore role from localStorage on page refresh
  const [role, setRole] = useState(() => {
    const user = getUser();
    return user?.role || null;
  });

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};