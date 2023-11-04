import { User } from "../db/entities/User.js";
import generateToken from "../utils/generateToken.js";

const signupController = async (payload: User) => {
    const { userName, email, password } = payload;
    const user = await User.findOneBy({ email })
    if (user) {
        throw ("user already exists")
    }
    const token = generateToken(payload)

    User.create({ userName, email, password }).save()
    return token

}

export { signupController }