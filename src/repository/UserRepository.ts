import { IUser, User } from "../models/User";

export class UsersRepository {
    users: User[];

    constructor() {
        this.users = [];
    }

    getAllUsers(): User[] {
        return this.users;
    }

    findById(id: IUser["id"]): User | undefined {
        return this.users.find((user) => user.id === id);
    }

    save(user: User): User {
        this.users.push(user);

        return user;
    }

    change(newUser: IUser): IUser {
        let updateUser = newUser;
        this.users = this.users.map((user) => {
            if (newUser.id === user.id) {
                user.updateFields(newUser);
                updateUser = user;
            }

            return user;
        });

        return updateUser;
    }

    delete(id: IUser["id"]): boolean {
        this.users = this.users.filter((user) => user.id === id);

        return true;
    }
}
