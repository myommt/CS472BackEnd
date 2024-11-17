import { Request, Response, RequestHandler } from "express";
import fs from 'node:fs';
import path from 'node:path';
import { User } from './interface/user.ts';


const filePath = './data/users.json';
let users: User[] = [];

const readUsersFile = (): User[] => {
    const dataPath = path.join(__dirname, filePath);
    console.log(dataPath);

    try {
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf-8');
            users = JSON.parse(data);
        } else {
            users = [];
        }
    } catch (error) {
        users = [];
    }

    return users;
};

const saveUsersFile = (): void => {
    const dataPath = path.join(__dirname, filePath);
    fs.writeFileSync(dataPath, JSON.stringify(users));
};
readUsersFile();

export const signup: RequestHandler<unknown,
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyMessage: string; },
    { username: string, password: string; },
    unknown> = (req, res, next) => {
        console.log(`hi`);
        const { username, password } = req.body;
        try {
            const existingUser = users.find(user => user.username === username);
            if (existingUser) {
                res.json({ responseBodyStatus: 409, responseBodySuccess: false, responseBodyMessage: 'Username already exists' });
            }
            else {
                const newUser: User = {
                    id: Date.now().toString(),
                    username,
                    password
                };
                users.push(newUser);
                saveUsersFile();
                res.json({ responseBodyStatus: 201, responseBodySuccess: true, responseBodyMessage: 'User created successfully' });
            }
        }
        catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyMessage: 'Internal server error' });
        }
    };

export const signin: RequestHandler<unknown,
    { responseBodyStatus: number, responseBodySuccess: boolean, responseBodyMessage: string, responseBodyData: { id: string, username: string; } | null; },
    { username: string, password: string; },
    unknown> = (req, res, next) => {
        const { username, password } = req.body;
        try {
            const user = users.find(user => user.username === username && user.password === password) as User;
            if (!user) {
                res.json({ responseBodyStatus: 401, responseBodySuccess: false, responseBodyMessage: 'Invalid username or password', responseBodyData: null });
            } else {
                res.json({ responseBodyStatus: 200, responseBodySuccess: true, responseBodyMessage: 'Signin successful', responseBodyData: { id: user.id, username: user.username } });
            }
        } catch (error) {
            res.json({ responseBodyStatus: 500, responseBodySuccess: false, responseBodyMessage: 'Internal server error', responseBodyData: null });
        }
    };