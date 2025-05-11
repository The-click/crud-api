import { IUser, User } from "./../models/User";
import { UsersRepository } from "../repository/UserRepository";
import { v4 as uuidv4 } from "uuid";

export class UserService {
    userRepository: UsersRepository;

    constructor() {
        this.userRepository = new UsersRepository();
    }

    getAllUser(): IUser[] {
        return this.userRepository.getAllUsers();
    }

    getUser(id: IUser["id"]): IUser {
        if (!this.validateUuid(id)) {
            throw new Error("The id is invalid");
        }

        const user = this.userRepository.findById(id);

        if (!user) {
            throw new Error("The user was not found");
        }

        return user;
    }

    creatUser(drawUser: Omit<IUser, "id">): IUser {
        const newUser: User = new User({ id: uuidv4(), ...drawUser });

        if (!newUser.validateFill()) {
            throw new Error("All required fields are not filled in");
        }

        this.userRepository.save(newUser);

        return newUser;
    }

    deleteUser(id: IUser["id"]): Boolean {
        if (!this.validateUuid(id)) {
            throw new Error("The id is invalid");
        }

        const user = this.userRepository.findById(id);

        if (!user) {
            throw new Error("The user was not found");
        }

        this.userRepository.delete(id);

        return true;
    }

    updateUser(id: IUser["id"], user: IUser): IUser {
        if (!this.validateUuid(id)) {
            throw new Error("The id is invalid");
        }

        const oldUser = this.userRepository.findById(id);

        if (!oldUser) {
            throw new Error("The user was not found");
        }

        if (!this.validateUser(user)) {
            console.log(user);
            throw new Error("All required fields are not filled in");
        }

        const updateuser = this.userRepository.change(user);

        return updateuser;
    }

    validateUuid(uuid: string): boolean {
        const regexp =
            /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
        return !!uuid.match(regexp);
    }

    validateUser(user: IUser) {
        for (const property in user) {
            console.log({ property, value: user[property as keyof IUser] });
            if (property in user && !user[property as keyof IUser]) {
                return false;
            }
        }

        return true;
    }
}
