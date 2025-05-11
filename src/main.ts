import http from "http";
import "dotenv/config";
import { UserService, userServiceError } from "./service/UserService";
import { IUser } from "./models/User";

enum baseError {
    PATH_NOT_FOUND = "An unknown path is specified",
    UNKNOWN_ERROR = "Oops, unknown error",
    INCORRECT_FORM = "Incorrect data format is received, please, use json",
}
enum statusCode {
    OK = 200,
    CREATED = 201,
    DELETED = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,
}

const PORT = process.env.PORT || 3000;
const userService = new UserService();

userService.creatUser({ username: "Name", hobbies: ["one", "two"], age: 20 });
userService.creatUser({
    username: "Second Name",
    hobbies: ["one", "three"],
    age: 20,
});

http.createServer(async function (request, response) {
    try {
        const requestPath = request.url?.split("/") || [];
        const basePath = requestPath.slice(0, 3).join("/");
        const id = requestPath[3];
        let base: any = "";

        if (requestPath.length > 4 || basePath !== "/api/users") {
            throw new Error(baseError.PATH_NOT_FOUND);
        }

        if (request.method === "GET") {
            if (id) {
                base = userService.getUser(id);
            } else {
                base = userService.getAllUser();
            }
        }

        if (request.method === "DELETE") {
            const answer = userService.deleteUser(id);

            if (answer) {
                base = "User deleted";
                console.log(base);
                response.statusCode = statusCode.DELETED;
            }
        }

        if (request.method === "PUT") {
            let drawUser: undefined | Omit<IUser, "id">;

            try {
                const buffers = [];

                for await (const chunk of request) {
                    buffers.push(chunk);
                }

                drawUser = JSON.parse(Buffer.concat(buffers).toString());
            } catch (error) {
                throw new Error(baseError.INCORRECT_FORM);
            }

            if (!drawUser) {
                return;
            }

            const updateUser = userService.updateUser(id, {
                ...drawUser,
                id,
            });

            base = updateUser;
        }

        if (request.method === "POST") {
            let drawUser: undefined | Omit<IUser, "id">;

            try {
                const buffers = [];

                for await (const chunk of request) {
                    buffers.push(chunk);
                }

                drawUser = JSON.parse(Buffer.concat(buffers).toString());
            } catch (error) {
                throw new Error(baseError.INCORRECT_FORM);
            }

            if (!drawUser) {
                return;
            }

            const user = userService.creatUser({
                username: drawUser.username,
                age: drawUser.age,
                hobbies: drawUser.hobbies,
            });

            base = user;
            response.statusCode = statusCode.CREATED;
        }

        response.setHeader("Content-Type", "text/html; charset=utf-8;");
        response.write(JSON.stringify(base, null, 2));
        response.end();
    } catch (error) {
        const errorMessage = { ...baseError, ...userServiceError };
        const mapErrorWithCode = {
            [errorMessage.ID_INVALID]: statusCode.BAD_REQUEST,
            [errorMessage.PATH_NOT_FOUND]: statusCode.NOT_FOUND,
            [errorMessage.REQUIRED_FIELD_NOT_FILL]: statusCode.BAD_REQUEST,
            [errorMessage.USER_NOT_FOUND]: statusCode.NOT_FOUND,
            [errorMessage.FIELDS_NOT_FILLED_CORRECTLY]: statusCode.BAD_REQUEST,
            [errorMessage.INCORRECT_FORM]: statusCode.BAD_REQUEST,
        };

        response.setHeader("Content-Type", "text/html; charset=utf-8;");

        if (error instanceof Error && typeof error.message === "string") {
            response.statusCode =
                mapErrorWithCode[
                    error.message as keyof typeof mapErrorWithCode
                ] || statusCode.SERVER_ERROR;
            response.write(
                JSON.stringify(
                    mapErrorWithCode[
                        error.message as keyof typeof mapErrorWithCode
                    ]
                        ? error.message
                        : baseError.UNKNOWN_ERROR,
                    null,
                    2
                )
            );
        } else {
            response.write(JSON.stringify(baseError.UNKNOWN_ERROR, null, 2));
            response.statusCode = statusCode.SERVER_ERROR;
        }

        response.end();
    }
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
