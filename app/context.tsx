import { createContext } from 'react';
import { User } from 'firebase/auth';

type UserContextType = {
    user: User | null;
    username: string | null;
};

export const UserContext = createContext<UserContextType>({user: null, username: null});