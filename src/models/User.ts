export interface IUser {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

export class User implements IUser {
    private _id: string;
    username: string;
    age: number;
    hobbies: string[];

    constructor(user: IUser) {
        this._id = user.id;
        this.username = user.username;
        this.age = user.age;
        this.hobbies = user.hobbies;
    }

    get id(): IUser["id"] {
        return this._id;
    }

    updateFields(user: IUser) {
        if (user.username) {
            this.username = user.username;
        }

        if (user.age || user.age === 0) {
            this.age = user.age;
        }

        if (user.hobbies) {
            this.hobbies = user.hobbies;
        }
    }

    validateFill(): boolean {
        if (!this.username || typeof this.username !== "string") {
            return false;
        }

        if ((!this.age && this.age !== 0) || typeof this.age !== "number") {
            return false;
        }

        if (!this.hobbies || !Array.isArray(this.hobbies)) {
            return false;
        }

        return true;
    }
}
