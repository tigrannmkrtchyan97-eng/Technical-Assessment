import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import HttpStatusCodes from "../constants/httpStatusCodes.js";

//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(HttpStatusCodes.CLIENT_ERROR.NOT_FOUND).json({ success: false, message: 'User does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(HttpStatusCodes.CLIENT_ERROR.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' })
        }

        const token = createToken(user._id);
        return res.status(HttpStatusCodes.SUCCESS.OK).json({ success: true, token })
    } catch (error) {
        console.log(error)
        return res.status(HttpStatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error' })
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

//register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {

        // checking is user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(HttpStatusCodes.CLIENT_ERROR.UNAUTHORIZED).json({
                success: false,
                message: 'User already exists',
            });
        }

        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.status(HttpStatusCodes.CLIENT_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Please enter a valid email',
            });
        }

        if (password.length < 8) {
            return res.status(HttpStatusCodes.CLIENT_ERROR.BAD_REQUEST).json({
                success: false,
                message: 'Please enter a strong password (min 8 chars)',
            });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        return res.status(HttpStatusCodes.SUCCESS.CREATED).json({
            success: true,
            token,
        });
    } catch (error) {
        console.log(error)
        return res.status(HttpStatusCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error while registering user',
        });
    }
}

export { loginUser, registerUser }
