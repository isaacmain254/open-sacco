import { useEffect, useState } from "react";
import axios from "axios";

interface UserProps {
  username: string;
  email: string;
}

const Users = () => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <>
      <div>Users</div>
      {users.length ? (
        <ul>
          {users.map((user) => (
            <li key={user.email}>
              {user.username} {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users records.</p>
      )}
    </>
  );
};

export default Users;
