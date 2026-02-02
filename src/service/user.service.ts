import { UserRepository } from "../repository/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../error/http-error";

let userRepository = new UserRepository();

export class UserService{
  async createUser(data:CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);

    if(emailCheck) {
      throw new HttpError(403,"Email already in use"); 
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const usernameCheck = await userRepository.getUserByUsername(data.username);

    if(usernameCheck){
      throw new HttpError(403,"Username already in use")
    }

    const newUser = await userRepository.createUser(data);

    return newUser;
  }

  async loginUser(data: LoginUserDTO){
    const user = await userRepository.getUserByEmail(data.email);
    if(!user) {
      throw new HttpError(404,"No user found")
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if(!validPassword){
      throw new HttpError(401,"Invalid Credentials")
    }

    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }

    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "30d"});
    return {token, user};
  }

    async updateUser(id:string, data:UpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if(!user) {
      throw new HttpError(404, "User not found");
    }
    // if(user.email != data.email) {
    //   const emailCheck = await userRepository.getUserByEmail(data.email!);
    //   if(!emailCheck) {
    //     throw new HttpError(403, "Email already in use");
    //   }
    // }
    // if(user.username != data.username) {
    //   const usernameCheck = await userRepository.getUserByUsername(data.username!);
    //   if(!usernameCheck) {
    //     throw new HttpError(403, "Username already in use");
    //   }
    // }

    if(data.password){
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password   = hashedPassword;
    }

    const updatedUser = await userRepository.updateUser(id, data);
    return updatedUser;
  }

    async uploadProfilePicture(file: Express.Multer.File) {
    if (!file) {
    throw new Error("Please upload a file");
  }

  if (file.size > Number(process.env.MAX_FILE_UPLOAD)) {
    throw new Error(
      `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`
    );
  }

  const filename = await userRepository.uploadProfilePicture(file);
  return filename;
  }
}