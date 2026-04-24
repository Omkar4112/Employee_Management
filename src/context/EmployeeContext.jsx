import { createContext, useState } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Alice Johnson", role: "Frontend Developer", status: "Active", performance: "98%" },
    { id: 2, name: "Bob Smith", role: "UI/UX Designer", status: "On Leave", performance: "92%" },
    { id: 3, name: "Charlie Davis", role: "Project Manager", status: "Active", performance: "95%" },
    { id: 4, name: "Diana Prince", role: "Backend Engineer", status: "Active", performance: "97%" },
    { id: 5, name: "Ethan Hunt", role: "Security Analyst", status: "Active", performance: "99%" },
  ]);

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees }}>
      {children}
    </EmployeeContext.Provider>
  );
};
