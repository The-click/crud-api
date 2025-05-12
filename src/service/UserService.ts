import { IUser, User } from "./../models/User";
import { UsersRepository } from "../repository/UserRepository";
import { v4 as uuidv4 } from "uuid";

export enum userServiceError {
    ID_INVALID = "Invalid id is specified",
    USER_NOT_FOUND = "The user was not found",
    REQUIRED_FIELD_NOT_FILL = "Required fields are not filled in",
    FIELDS_NOT_FILLED_CORRECTLY = "Fields are not filled in correctly",
}

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
            throw new Error(userServiceError.ID_INVALID);
        }

        const user = this.userRepository.findById(id);

        if (!user) {
            throw new Error(userServiceError.USER_NOT_FOUND);
        }

        return user;
    }

    creatUser(drawUser: Omit<IUser, "id">): IUser {
        const newUser: User = new User({ id: uuidv4(), ...drawUser });

        if (!newUser.validateFill()) {
            throw new Error(userServiceError.REQUIRED_FIELD_NOT_FILL);
        }

        this.userRepository.save(newUser);

        return newUser;
    }

    deleteUser(id: IUser["id"]): Boolean {
        if (!this.validateUuid(id)) {
            throw new Error(userServiceError.ID_INVALID);
        }

        const user = this.userRepository.findById(id);

        if (!user) {
            throw new Error(userServiceError.USER_NOT_FOUND);
        }

        this.userRepository.delete(id);

        return true;
    }

    updateUser(id: IUser["id"], user: IUser): IUser {
        if (!this.validateUuid(id)) {
            throw new Error(userServiceError.ID_INVALID);
        }

        const oldUser = this.userRepository.findById(id);

        if (!oldUser) {
            throw new Error(userServiceError.USER_NOT_FOUND);
        }

        if (!this.validateUser(user)) {
            throw new Error(userServiceError.FIELDS_NOT_FILLED_CORRECTLY);
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
            if (
                !["username", "age", "hobbies", "id"].includes(property) ||
                (!user[property as keyof IUser] && property !== "age")
            ) {
                return false;
            }
        }

        if (
            typeof user.username !== "string" ||
            typeof user.age !== "number" ||
            !Array.isArray(user.hobbies)
        ) {
            return false;
        }

        return true;
    }
}

export const userService = new UserService();
